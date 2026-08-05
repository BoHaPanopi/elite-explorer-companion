mod exploration;
mod runtime_health;

use exploration::{ExplorationSnapshot, ExplorationTracker};
use runtime_health::{StartupHealth, UpdateReadiness};
use serde::Serialize;
use serde_json::Value;
use std::{
    env,
    fs::{self, File},
    io::{BufRead, BufReader},
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex,
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{LogicalSize, Manager};

use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct VoiceServer {
    child: Mutex<Option<CommandChild>>,
    stopping: AtomicBool,
}
struct StartupStatus(Mutex<StartupHealth>);
struct FrontendHeartbeat {
    ready: AtomicBool,
    last_seen_ms: std::sync::atomic::AtomicU64,
}

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct RouteStep {
    system: String,
    star_class: Option<String>,
    position: Option<[f64; 3]>,
}

#[derive(Debug, Default, Serialize)]
#[serde(rename_all = "camelCase")]
struct EliteSnapshot {
    commander: Option<String>,
    system: Option<String>,
    ship: Option<String>,
    ship_name: Option<String>,
    docked: Option<bool>,
    elite_connected: bool,
    exploration: ExplorationSnapshot,
    journal_path: String,
    route: Vec<RouteStep>,
}

#[tauri::command]
fn is_elite_dangerous_running() -> bool {
    runtime_health::process_running("EliteDangerous64.exe")
}

fn installed_sidecar_path() -> Option<PathBuf> {
    env::current_exe().ok().and_then(|executable| {
        executable
            .parent()
            .map(|directory| directory.join(runtime_health::VOICE_PROCESS))
    })
}

fn maintain_voice_server_recovery(app: &tauri::AppHandle) -> Result<(), String> {
    let installed =
        installed_sidecar_path().ok_or_else(|| "voice-server path is unavailable".to_string())?;
    let cache_directory = app
        .path()
        .app_local_data_dir()
        .map_err(|error| error.to_string())?
        .join("repair-cache");
    let cached = cache_directory.join(runtime_health::VOICE_PROCESS);

    if runtime_health::valid_windows_x64_executable(&installed) {
        fs::create_dir_all(&cache_directory).map_err(|error| error.to_string())?;
        let pending = cache_directory.join("ogg-voice-server.pending");
        fs::copy(&installed, &pending).map_err(|error| error.to_string())?;
        if !runtime_health::valid_windows_x64_executable(&pending) {
            let _ = fs::remove_file(&pending);
            return Err("voice-server recovery copy is invalid".into());
        }
        let _ = fs::remove_file(&cached);
        fs::rename(&pending, &cached).map_err(|error| error.to_string())?;
        log::info!(
            "version={} phase=recovery_cache process={} cause=verified_copy",
            env!("CARGO_PKG_VERSION"),
            runtime_health::VOICE_PROCESS
        );
        return Ok(());
    }

    if runtime_health::valid_windows_x64_executable(&cached) {
        fs::copy(&cached, &installed).map_err(|error| error.to_string())?;
        if runtime_health::valid_windows_x64_executable(&installed) {
            log::warn!("version={} phase=automatic_repair process={} cause=installed_sidecar_missing_or_invalid", env!("CARGO_PKG_VERSION"), runtime_health::VOICE_PROCESS);
            return Ok(());
        }
    }

    Err("voice-server executable is missing or invalid and no recovery copy is available".into())
}

fn stop_voice_server(app: &tauri::AppHandle) -> bool {
    log::info!(
        "version={} phase=background_service_stop process={} cause=requested",
        env!("CARGO_PKG_VERSION"),
        runtime_health::VOICE_PROCESS
    );
    app.state::<VoiceServer>()
        .stopping
        .store(true, Ordering::SeqCst);
    runtime_health::terminate_voice_servers();
    let stopped = runtime_health::wait_for_voice_servers(std::time::Duration::from_secs(5));
    if let Ok(mut child) = app.state::<VoiceServer>().child.lock() {
        *child = None;
    }
    if !stopped {
        log::error!("version={} phase=background_service_stop process={} cause=process_still_running technical=timeout", env!("CARGO_PKG_VERSION"), runtime_health::VOICE_PROCESS);
    }
    stopped
}

fn start_voice_server(app: &tauri::AppHandle) -> Result<(), String> {
    app.state::<VoiceServer>()
        .stopping
        .store(true, Ordering::SeqCst);
    runtime_health::terminate_voice_servers();
    if !runtime_health::wait_for_voice_servers(std::time::Duration::from_secs(5)) {
        return Err("previous voice-server process could not be stopped".into());
    }

    let sidecar_path =
        installed_sidecar_path().ok_or_else(|| "voice-server path is unavailable".to_string())?;
    if !runtime_health::valid_windows_x64_executable(&sidecar_path) {
        return Err("voice-server executable is missing or invalid".into());
    }

    app.state::<VoiceServer>()
        .stopping
        .store(false, Ordering::SeqCst);
    let parent_pid = std::process::id().to_string();
    let (mut events, child) = app
        .shell()
        .sidecar("ogg-voice-server")
        .map_err(|error| error.to_string())?
        .args(["--parent-pid", &parent_pid])
        .spawn()
        .map_err(|error| error.to_string())?;

    app.state::<VoiceServer>()
        .child
        .lock()
        .map_err(|_| "voice-server state is unavailable".to_string())?
        .replace(child);

    let app_handle = app.clone();
    tauri::async_runtime::spawn(async move {
        while events.recv().await.is_some() {}
        if !app_handle
            .state::<VoiceServer>()
            .stopping
            .load(Ordering::SeqCst)
        {
            let reason = "voice server exited unexpectedly";
            log::error!("version={} phase=background_service_exit process={} cause=unexpected_exit technical=event_stream_closed", env!("CARGO_PKG_VERSION"), runtime_health::VOICE_PROCESS);
            if let Ok(mut health) = app_handle.state::<StartupStatus>().0.lock() {
                *health = StartupHealth::degraded(reason);
            }
        }
    });
    log::info!(
        "version={} phase=background_service_ready process={} cause=started",
        env!("CARGO_PKG_VERSION"),
        runtime_health::VOICE_PROCESS
    );
    Ok(())
}

#[tauri::command]
fn get_startup_health(app: tauri::AppHandle) -> StartupHealth {
    app.state::<StartupStatus>()
        .0
        .lock()
        .map(|health| health.clone())
        .unwrap_or_else(|_| StartupHealth::degraded("startup state is unavailable"))
}

fn show_main_window(app: &tauri::AppHandle, phase: &str) -> Result<(), String> {
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window is unavailable".to_string())?;
    window.show().map_err(|error| error.to_string())?;
    window.set_focus().map_err(|error| error.to_string())?;
    log::info!(
        "version={} phase={} process=app.exe cause=single_ready_show url={}",
        env!("CARGO_PKG_VERSION"),
        phase,
        window
            .url()
            .map(|url| url.to_string())
            .unwrap_or_else(|_| "unavailable".into())
    );
    Ok(())
}

#[tauri::command]
fn show_boot_surface(app: tauri::AppHandle) -> Result<(), String> {
    show_main_window(&app, "boot_surface_ready")
}

#[tauri::command]
fn mark_frontend_ready(app: tauri::AppHandle) -> Result<(), String> {
    let heartbeat = app.state::<FrontendHeartbeat>();
    heartbeat
        .last_seen_ms
        .store(unix_time_ms(), Ordering::SeqCst);
    heartbeat.ready.store(true, Ordering::SeqCst);
    log::info!(
        "version={} phase=frontend_ready process=app.exe cause=rendered",
        env!("CARGO_PKG_VERSION")
    );
    show_main_window(&app, "main_window_ready")
}

#[tauri::command]
fn frontend_heartbeat(app: tauri::AppHandle) {
    app.state::<FrontendHeartbeat>()
        .last_seen_ms
        .store(unix_time_ms(), Ordering::Relaxed);
}

#[tauri::command]
fn log_frontend_failure(kind: String, message: String, stack: Option<String>) {
    log::error!(
        "version={} phase=frontend_failure process=msedgewebview2.exe cause={} technical={} stack={}",
        env!("CARGO_PKG_VERSION"),
        kind,
        message,
        stack.unwrap_or_else(|| "none".into())
    );
}

#[tauri::command]
fn log_update_phase(phase: String, cause: String, technical: Option<String>) {
    log::info!(
        "version={} phase=update_{} process=app.exe cause={} technical={}",
        env!("CARGO_PKG_VERSION"),
        phase,
        cause,
        technical.unwrap_or_else(|| "none".into())
    );
}

#[tauri::command]
fn log_audio_event(event: String, technical: Option<String>) {
    log::info!(
        "version={} phase=audio process=msedgewebview2.exe event={} technical={}",
        env!("CARGO_PKG_VERSION"),
        event,
        technical.unwrap_or_else(|| "none".into())
    );
}

#[tauri::command]
fn prepare_for_update(app: tauri::AppHandle) -> UpdateReadiness {
    log::info!(
        "version={} phase=update_prepare process=app.exe cause=preflight",
        env!("CARGO_PKG_VERSION")
    );
    let stopped = stop_voice_server(&app);
    if !stopped {
        return UpdateReadiness {
            ready: false,
            blocker: Some(runtime_health::UpdateBlocker::VoiceServerRunning),
        };
    }
    let readiness = installed_sidecar_path()
        .map(|path| runtime_health::update_readiness(&path))
        .unwrap_or(UpdateReadiness {
            ready: false,
            blocker: Some(runtime_health::UpdateBlocker::VoiceServerMissing),
        });
    log::info!(
        "version={} phase=update_preflight_result process=app.exe cause={:?}",
        env!("CARGO_PKG_VERSION"),
        readiness.blocker
    );
    readiness
}

#[tauri::command]
fn repair_runtime(app: tauri::AppHandle) -> StartupHealth {
    log::info!(
        "version={} phase=repair process=app.exe cause=user_requested",
        env!("CARGO_PKG_VERSION")
    );
    let health = match start_voice_server(&app) {
        Ok(()) => StartupHealth {
            ready: true,
            phase: "ready".into(),
            process_name: runtime_health::VOICE_PROCESS.into(),
            version: env!("CARGO_PKG_VERSION").into(),
            reason: None,
        },
        Err(error) => {
            log::error!(
                "version={} phase=repair process={} cause=restart_failed technical={}",
                env!("CARGO_PKG_VERSION"),
                runtime_health::VOICE_PROCESS,
                error
            );
            StartupHealth::degraded(error)
        }
    };
    if let Ok(mut current) = app.state::<StartupStatus>().0.lock() {
        *current = health.clone();
    }
    health
}

#[tauri::command]
fn open_log_directory(app: tauri::AppHandle) -> Result<(), String> {
    let path = app
        .path()
        .app_log_dir()
        .map_err(|error| error.to_string())?;
    runtime_health::hidden_output("explorer.exe", &[path.to_string_lossy().as_ref()])
        .map(|_| ())
        .map_err(|error| error.to_string())
}

fn localized(locale: &str, de: &str, en: &str) -> String {
    if locale == "en" {
        en.to_string()
    } else {
        de.to_string()
    }
}

fn find_journal_directory(locale: &str) -> Result<PathBuf, String> {
    let user_profile = env::var("USERPROFILE").map_err(|_| {
        localized(
            locale,
            "Windows-Benutzerordner nicht gefunden.",
            "Windows user folder was not found.",
        )
    })?;

    let candidates = [
        PathBuf::from(&user_profile)
            .join("Saved Games")
            .join("Frontier Developments")
            .join("Elite Dangerous"),
        PathBuf::from(&user_profile)
            .join("Gespeicherte Spiele")
            .join("Frontier Developments")
            .join("Elite Dangerous"),
    ];

    candidates
        .into_iter()
        .find(|path| path.is_dir())
        .ok_or_else(|| {
            localized(
                locale,
                "Der Elite-Dangerous-Journalordner wurde nicht gefunden.",
                "The Elite Dangerous journal folder was not found.",
            )
        })
}

fn newest_journal_file(directory: &Path, locale: &str) -> Result<PathBuf, String> {
    let mut journals = fs::read_dir(directory)
        .map_err(|error| {
            format!(
                "{}: {error}",
                localized(
                    locale,
                    "Journalordner konnte nicht gelesen werden",
                    "The journal folder could not be read"
                )
            )
        })?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with("Journal.") && name.ends_with(".log"))
        })
        .collect::<Vec<_>>();

    journals.sort_by_key(|path| {
        fs::metadata(path)
            .and_then(|metadata| metadata.modified())
            .ok()
    });

    journals.pop().ok_or_else(|| {
        localized(
            locale,
            "Keine Journal-Datei gefunden.",
            "No journal file was found.",
        )
    })
}

fn read_navigation_route(directory: &Path) -> Vec<RouteStep> {
    let route_path = directory.join("NavRoute.json");

    let contents = match fs::read_to_string(route_path) {
        Ok(contents) => contents,
        Err(_) => return Vec::new(),
    };

    let document: Value = match serde_json::from_str(&contents) {
        Ok(document) => document,
        Err(_) => return Vec::new(),
    };

    document
        .get("Route")
        .and_then(Value::as_array)
        .map(|route| {
            route
                .iter()
                .filter_map(|step| {
                    let system = step.get("StarSystem")?.as_str()?.to_string();

                    let star_class = step
                        .get("StarClass")
                        .and_then(Value::as_str)
                        .map(str::to_string);

                    let position =
                        step.get("StarPos")
                            .and_then(Value::as_array)
                            .and_then(|coordinates| {
                                if coordinates.len() != 3 {
                                    return None;
                                }

                                Some([
                                    coordinates[0].as_f64()?,
                                    coordinates[1].as_f64()?,
                                    coordinates[2].as_f64()?,
                                ])
                            });

                    Some(RouteStep {
                        system,
                        star_class,
                        position,
                    })
                })
                .collect()
        })
        .unwrap_or_default()
}

fn read_latest_snapshot(
    journal_path: &Path,
    journal_directory: &Path,
    locale: &str,
) -> Result<EliteSnapshot, String> {
    let file = File::open(journal_path).map_err(|error| {
        format!(
            "{}: {error}",
            localized(
                locale,
                "Journal-Datei konnte nicht geöffnet werden",
                "The journal file could not be opened"
            )
        )
    })?;

    let reader = BufReader::new(file);
    let mut exploration = ExplorationTracker::default();

    let mut snapshot = EliteSnapshot {
        journal_path: journal_path.display().to_string(),
        route: read_navigation_route(journal_directory),
        ..EliteSnapshot::default()
    };

    for line in reader.lines() {
        let line = match line {
            Ok(line) => line,
            Err(_) => continue,
        };

        let event: Value = match serde_json::from_str(&line) {
            Ok(event) => event,
            Err(_) => continue,
        };

        exploration.apply(&event);

        let event_name = event
            .get("event")
            .and_then(Value::as_str)
            .unwrap_or_default();

        match event_name {
            "Commander" | "LoadGame" => {
                if let Some(name) = event.get("Name").and_then(Value::as_str) {
                    snapshot.commander = Some(name.to_string());
                }

                if let Some(ship) = event.get("Ship").and_then(Value::as_str) {
                    snapshot.ship = Some(ship.to_string());
                }

                if let Some(ship_name) = event.get("ShipName").and_then(Value::as_str) {
                    snapshot.ship_name = Some(ship_name.to_string());
                }
            }

            "Loadout" => {
                if let Some(ship) = event.get("Ship").and_then(Value::as_str) {
                    snapshot.ship = Some(ship.to_string());
                }

                if let Some(ship_name) = event.get("ShipName").and_then(Value::as_str) {
                    snapshot.ship_name = Some(ship_name.to_string());
                }
            }

            "Location" | "FSDJump" | "CarrierJump" => {
                if let Some(system) = event.get("StarSystem").and_then(Value::as_str) {
                    snapshot.system = Some(system.to_string());
                }

                if let Some(docked) = event.get("Docked").and_then(Value::as_bool) {
                    snapshot.docked = Some(docked);
                }
            }

            "Docked" => snapshot.docked = Some(true),
            "Undocked" => snapshot.docked = Some(false),

            _ => {}
        }
    }

    snapshot.exploration = exploration.finish();

    Ok(snapshot)
}

#[tauri::command]
fn get_elite_snapshot(locale: Option<String>) -> Result<EliteSnapshot, String> {
    let locale = locale.as_deref().unwrap_or("de");
    let journal_directory = find_journal_directory(locale)?;
    let journal_path = newest_journal_file(&journal_directory, locale)?;

    let mut snapshot = read_latest_snapshot(&journal_path, &journal_directory, locale)?;
    snapshot.elite_connected = is_elite_dangerous_running();

    if !snapshot.elite_connected {
        snapshot.docked = None;
    }

    Ok(snapshot)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(
            tauri_plugin_log::Builder::new()
                .clear_targets()
                .target(tauri_plugin_log::Target::new(
                    tauri_plugin_log::TargetKind::LogDir {
                        file_name: Some("ogg-startup".into()),
                    },
                ))
                .level(log::LevelFilter::Info)
                .max_file_size(2_000_000)
                .rotation_strategy(tauri_plugin_log::RotationStrategy::KeepAll)
                .timezone_strategy(tauri_plugin_log::TimezoneStrategy::UseLocal)
                .build(),
        )
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            app.manage(VoiceServer {
                child: Mutex::new(None),
                stopping: AtomicBool::new(false),
            });
            app.manage(StartupStatus(Mutex::new(StartupHealth::starting())));
            app.manage(FrontendHeartbeat {
                ready: AtomicBool::new(false),
                last_seen_ms: std::sync::atomic::AtomicU64::new(unix_time_ms()),
            });
            log::info!("version={} phase=start process=app.exe cause=application_launch", env!("CARGO_PKG_VERSION"));

            let window_state_path = app
                .path()
                .app_config_dir()?
                .join(tauri_plugin_window_state::DEFAULT_FILENAME);

            if !window_state_path.exists() {
                if let Some(window) = app.get_webview_window("main") {
                    if let Some(monitor) = window.current_monitor()? {
                        let scale_factor = monitor.scale_factor();
                        let monitor_size = monitor.size().to_logical::<f64>(scale_factor);
                        let width = 1400.0_f64.min(monitor_size.width * 0.9);
                        let height = 900.0_f64.min(monitor_size.height * 0.9);

                        window.set_size(LogicalSize::new(width, height))?;
                        window.center()?;
                    }
                }
            }

            if let Err(error) = maintain_voice_server_recovery(app.handle()) {
                log::error!("version={} phase=automatic_repair process={} cause=recovery_unavailable technical={}", env!("CARGO_PKG_VERSION"), runtime_health::VOICE_PROCESS, error);
            }

            if let Err(error) = start_voice_server(app.handle()) {
                log::error!("version={} phase=background_service_start process={} cause=start_failed technical={}", env!("CARGO_PKG_VERSION"), runtime_health::VOICE_PROCESS, error);
                if let Ok(mut health) = app.state::<StartupStatus>().0.lock() {
                    *health = StartupHealth::degraded(error);
                }
            } else if let Ok(mut health) = app.state::<StartupStatus>().0.lock() {
                health.phase = "ready".into();
            }

            let watchdog_app = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(3));
                    let heartbeat = watchdog_app.state::<FrontendHeartbeat>();
                    if heartbeat.ready.load(Ordering::Relaxed)
                        && unix_time_ms().saturating_sub(heartbeat.last_seen_ms.load(Ordering::Relaxed)) > 12_000
                    {
                        log::error!("version={} phase=frontend_watchdog process=msedgewebview2.exe cause=heartbeat_timeout technical=automatic_restart", env!("CARGO_PKG_VERSION"));
                        stop_voice_server(&watchdog_app);
                        watchdog_app.restart();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_elite_snapshot,
            is_elite_dangerous_running,
            get_startup_health,
            show_boot_surface,
            mark_frontend_ready,
            frontend_heartbeat,
            log_frontend_failure,
            log_audio_event,
            log_update_phase,
            prepare_for_update,
            repair_runtime,
            open_log_directory
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                log::info!("version={} phase=exit process=app.exe cause=application_exit", env!("CARGO_PKG_VERSION"));
                stop_voice_server(app);
            }
        });
}
