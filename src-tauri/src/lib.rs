mod exploration;

use exploration::{ExplorationSnapshot, ExplorationTracker};
use serde::Serialize;
use serde_json::Value;
use std::{
    env,
    fs::{self, File},
    io::{BufRead, BufReader},
    path::{Path, PathBuf},
    process::Command,
    sync::Mutex,
};
use tauri::{LogicalSize, Manager};
use tauri_plugin_shell::process::CommandChild;
use tauri_plugin_shell::ShellExt;

struct VoiceServer(Mutex<Option<CommandChild>>);

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

fn is_elite_dangerous_running() -> bool {
    #[cfg(target_os = "windows")]
    {
        return Command::new("tasklist")
            .args(["/FI", "IMAGENAME eq EliteDangerous64.exe", "/FO", "CSV", "/NH"])
            .output()
            .map(|output| {
                output.status.success()
                    && String::from_utf8_lossy(&output.stdout)
                        .to_ascii_lowercase()
                        .contains("elitedangerous64.exe")
            })
            .unwrap_or(false);
    }

    #[cfg(not(target_os = "windows"))]
    false
}

fn localized(locale: &str, de: &str, en: &str) -> String {
    if locale == "en" { en.to_string() } else { de.to_string() }
}

fn find_journal_directory(locale: &str) -> Result<PathBuf, String> {
    let user_profile =
        env::var("USERPROFILE").map_err(|_| localized(locale, "Windows-Benutzerordner nicht gefunden.", "Windows user folder was not found."))?;

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
        .ok_or_else(|| localized(locale, "Der Elite-Dangerous-Journalordner wurde nicht gefunden.", "The Elite Dangerous journal folder was not found."))
}

fn newest_journal_file(directory: &Path, locale: &str) -> Result<PathBuf, String> {
    let mut journals = fs::read_dir(directory)
        .map_err(|error| format!("{}: {error}", localized(locale, "Journalordner konnte nicht gelesen werden", "The journal folder could not be read")))?
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

    journals
        .pop()
        .ok_or_else(|| localized(locale, "Keine Journal-Datei gefunden.", "No journal file was found."))
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
    let file = File::open(journal_path)
        .map_err(|error| format!("{}: {error}", localized(locale, "Journal-Datei konnte nicht geöffnet werden", "The journal file could not be opened")))?;

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
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

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

            let (mut events, child) = app.shell().sidecar("ogg-voice-server")?.spawn()?;
            app.manage(VoiceServer(Mutex::new(Some(child))));

            tauri::async_runtime::spawn(async move {
                while events.recv().await.is_some() {}
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_elite_snapshot])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            if let tauri::RunEvent::Exit = event {
                if let Ok(mut child) = app.state::<VoiceServer>().0.lock() {
                    if let Some(child) = child.take() {
                        let _ = child.kill();
                    }
                }
            }
        });
}
