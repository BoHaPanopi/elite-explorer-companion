use serde::Serialize;
use serde_json::Value;
use std::{
    env,
    fs::{self, File},
    io::{BufRead, BufReader},
    path::{Path, PathBuf},
};

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
    journal_path: String,
    route: Vec<RouteStep>,
}

fn find_journal_directory() -> Result<PathBuf, String> {
    let user_profile =
        env::var("USERPROFILE").map_err(|_| "Windows-Benutzerordner nicht gefunden.")?;

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
        .ok_or_else(|| "Der Elite-Dangerous-Journalordner wurde nicht gefunden.".to_string())
}

fn newest_journal_file(directory: &Path) -> Result<PathBuf, String> {
    let mut journals = fs::read_dir(directory)
        .map_err(|error| format!("Journalordner konnte nicht gelesen werden: {error}"))?
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
        .ok_or_else(|| "Keine Journal-Datei gefunden.".to_string())
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
) -> Result<EliteSnapshot, String> {
    let file = File::open(journal_path)
        .map_err(|error| format!("Journal-Datei konnte nicht geöffnet werden: {error}"))?;

    let reader = BufReader::new(file);

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

    Ok(snapshot)
}

#[tauri::command]
fn get_elite_snapshot() -> Result<EliteSnapshot, String> {
    let journal_directory = find_journal_directory()?;
    let journal_path = newest_journal_file(&journal_directory)?;

    read_latest_snapshot(&journal_path, &journal_directory)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_window_state::Builder::new().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_elite_snapshot])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
