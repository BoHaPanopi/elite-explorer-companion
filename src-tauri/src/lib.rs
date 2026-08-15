mod diagnostics;
mod exploration;
mod local_speech;
mod runtime_health;

use exploration::{journal_commander_name, ExplorationSnapshot, ExplorationTracker};
use chrono::DateTime;
use local_speech::{LocalSpeechState, LocalVoice, SpeakLocalRequest};
use runtime_health::{StartupHealth, UpdateReadiness};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{
    collections::HashMap,
    env,
    fs::{self, File},
    io::{BufRead, BufReader, Seek, SeekFrom},
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Mutex, OnceLock,
    },
    time::{Instant, SystemTime, UNIX_EPOCH},
};
use tauri::{LogicalSize, Manager};
use tauri_plugin_window_state::StateFlags;


#[cfg(target_os = "windows")]
use windows::Win32::UI::Input::KeyboardAndMouse::GetFocus as WinGetFocus;
#[cfg(target_os = "windows")]
use windows_sys::Win32::UI::Shell::SetCurrentProcessExplicitAppUserModelID;
#[cfg(target_os = "windows")]
use windows_sys::Win32::{
    Foundation::{HWND, LPARAM, LRESULT, WPARAM},
    UI::{
        Shell::{DefSubclassProc, SetWindowSubclass},
        WindowsAndMessaging::{
            EnumChildWindows, GetClassNameW, GetForegroundWindow, GetParent, GetWindow, GW_OWNER,
            IsWindowVisible, WM_ACTIVATE, WM_ACTIVATEAPP, WM_KILLFOCUS, WM_SETFOCUS,
        },
    },
};

struct StartupStatus(Mutex<StartupHealth>);
struct FrontendHeartbeat {
    ready: AtomicBool,
    last_seen_ms: std::sync::atomic::AtomicU64,
    last_logged_ms: std::sync::atomic::AtomicU64,
    stall_reported: AtomicBool,
}

static LAST_LOGGED_COMMANDER: OnceLock<Mutex<Option<(PathBuf, Option<String>)>>> = OnceLock::new();
static KNOWN_STAR_CLASSES: OnceLock<Mutex<HashMap<u64, String>>> = OnceLock::new();
static JOURNAL_DIAG_CURSOR: OnceLock<Mutex<HashMap<PathBuf, usize>>> = OnceLock::new();
static JOURNAL_SNAPSHOT_REQUEST_LOCK: OnceLock<Mutex<()>> = OnceLock::new();
static JOURNAL_SNAPSHOT_CACHE: OnceLock<Mutex<Option<JournalSnapshotCacheEntry>>> = OnceLock::new();
static ANNA_LIVE_JOURNAL_CURSOR: OnceLock<Mutex<Option<AnnaLiveJournalCursor>>> = OnceLock::new();
static CORE_SHADOW_JOURNAL_CURSOR: OnceLock<Mutex<Option<AnnaLiveJournalCursor>>> = OnceLock::new();
static JOURNEY_HISTORY_CACHE: OnceLock<Mutex<JourneyHistoryCache>> = OnceLock::new();

#[derive(Clone, Debug)]
struct AnnaLiveJournalCursor {
    path: PathBuf,
    line_number: usize,
}
static LAST_WINDOW_STATE: OnceLock<Mutex<HashMap<String, WindowSnapshot>>> = OnceLock::new();
#[cfg(target_os = "windows")]
static INSTALLED_WINDOW_SUBCLASSES: OnceLock<Mutex<Vec<isize>>> = OnceLock::new();

#[derive(Clone, Debug)]
struct JournalCacheState {
    path: PathBuf,
    size_bytes: u64,
    modified_ms: u128,
}

#[derive(Debug)]
struct JournalSnapshotCacheEntry {
    journal_state: JournalCacheState,
    snapshot_json: String,
}

#[derive(Debug, Default)]
struct JourneyHistoryCache {
    running: bool,
    index: Option<JourneyHistoryIndex>,
    observed_latest_path: Option<PathBuf>,
    observed_latest_size: u64,
}

#[derive(Clone, Debug, Default)]
struct JourneyHistoryIndex {
    files: Vec<JourneyFileCursor>,
    parser: JourneyParser,
}

#[derive(Clone, Debug)]
struct JourneyFileCursor {
    path: PathBuf,
    complete_bytes: u64,
    observed_size: u64,
}

fn persisted_window_state_flags() -> StateFlags {
    StateFlags::SIZE | StateFlags::POSITION | StateFlags::MAXIMIZED
}

#[derive(Clone, Debug, Default)]
struct JourneyParser {
    current_system: Option<String>,
    pending_jump: Option<(String, Option<String>, String)>,
    last_journey: Option<LastJourney>,
    star_classes: HashMap<u64, String>,
}

fn journal_cache_state(path: &Path) -> Option<JournalCacheState> {
    let metadata = fs::metadata(path).ok()?;
    let modified_ms = metadata
        .modified()
        .ok()?
        .duration_since(UNIX_EPOCH)
        .ok()?
        .as_millis();

    Some(JournalCacheState {
        path: path.to_path_buf(),
        size_bytes: metadata.len(),
        modified_ms,
    })
}

fn journal_changed(previous: &JournalCacheState, current: &JournalCacheState) -> bool {
    previous.path != current.path
        || previous.size_bytes != current.size_bytes
        || previous.modified_ms != current.modified_ms
}

fn with_elite_connection_state(mut snapshot: EliteSnapshot, elite_connected: bool) -> EliteSnapshot {
    snapshot.elite_connected = elite_connected;

    if !snapshot.elite_connected {
        snapshot.docked = None;
        snapshot.ship_state = None;
        snapshot.station_name = None;
        snapshot.planet_name = None;
    }

    snapshot
}

const RELEVANT_JOURNAL_EVENTS: &[&str] = &[
    "FSDJump",
    "StartJump",
    "SupercruiseEntry",
    "SupercruiseExit",
    "SupercruiseDestinationDrop",
    "FSSDiscoveryScan",
    "FSSBodySignals",
    "SAASignalsFound",
    "SAAScanComplete",
    "Scan",
    "CodexEntry",
    "ScanOrganic",
    "Loadout",
    "DockingRequested",
    "DockingGranted",
    "DockingDenied",
    "Docked",
    "Undocked",
    "Location",
    "Status",
    "LoadGame",
];

fn unix_time_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

#[derive(Clone, Debug, Default)]
struct LandingDiagState {
    armed: bool,
    reminded: bool,
    has_docking_permission: bool,
    target_station_name: Option<String>,
    target_market_id: Option<u64>,
}

fn ship_state_label(value: Option<ShipState>) -> &'static str {
    match value {
        Some(ShipState::Supercruise) => "supercruise",
        Some(ShipState::NormalSpace) => "normal_space",
        Some(ShipState::Docked) => "docked",
        Some(ShipState::Landed) => "landed",
        None => "unknown",
    }
}

fn is_relevant_journal_event(event_name: &str) -> bool {
    RELEVANT_JOURNAL_EVENTS
        .iter()
        .any(|candidate| candidate.eq_ignore_ascii_case(event_name))
}

fn event_as_string(event: &Value, key: &str) -> Option<String> {
    event.get(key).and_then(Value::as_str).map(str::to_string)
}

fn event_as_u64(event: &Value, key: &str) -> Option<u64> {
    event.get(key).and_then(Value::as_u64)
}

fn event_as_bool(event: &Value, key: &str) -> Option<bool> {
    event.get(key).and_then(Value::as_bool)
}

fn event_string_trimmed(event: &Value, key: &str) -> Option<String> {
    event
        .get(key)
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn event_biological_signal_count(event: &Value) -> Option<u64> {
    event
        .get("Signals")
        .and_then(Value::as_array)
        .map(|signals| {
            signals.iter().fold(0_u64, |total, signal| {
                let is_bio = signal
                    .get("Type")
                    .and_then(Value::as_str)
                    .map(|kind| kind.to_ascii_lowercase().contains("biological"))
                    .unwrap_or(false);
                if !is_bio {
                    return total;
                }
                total
                    + signal
                        .get("Count")
                        .and_then(Value::as_u64)
                        .unwrap_or(1)
            })
        })
}

fn event_signal_types(event: &Value) -> Vec<String> {
    event
        .get("Signals")
        .and_then(Value::as_array)
        .map(|signals| {
            signals
                .iter()
                .filter_map(|signal| signal.get("Type").and_then(Value::as_str))
                .map(str::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default()
}

fn event_genuses(event: &Value) -> Vec<String> {
    event
        .get("Genuses")
        .and_then(Value::as_array)
        .map(|genuses| {
            genuses
                .iter()
                .filter_map(|genus| {
                    genus
                        .as_str()
                        .or_else(|| genus.get("Genus_Localised").and_then(Value::as_str))
                        .or_else(|| genus.get("Genus").and_then(Value::as_str))
                })
                .map(str::to_string)
                .collect::<Vec<_>>()
        })
        .unwrap_or_default()
}

fn extract_distance_km(event: &Value) -> Option<f64> {
    ["DistanceKm", "Distance", "DistanceFromStationKm", "StationDistanceKm"]
        .iter()
        .find_map(|key| event.get(*key).and_then(Value::as_f64))
}

fn journal_event_payload(event: &Value, snapshot: &EliteSnapshot) -> Value {
    json!({
        "timestamp": event_as_string(event, "timestamp"),
        "event": event_as_string(event, "event"),
        "systemAddress": event_as_u64(event, "SystemAddress"),
        "starSystem": event_as_string(event, "StarSystem"),
        "bodyId": event_as_u64(event, "BodyID"),
        "bodyName": event_as_string(event, "BodyName"),
        "biologicalSignalCount": event_biological_signal_count(event),
        "signalTypes": event_signal_types(event),
        "genuses": event_genuses(event),
        "wasDiscovered": event_as_bool(event, "WasDiscovered"),
        "wasMapped": event_as_bool(event, "WasMapped"),
        "wasFootfalled": event_as_bool(event, "WasFootfalled"),
        "stationName": event_as_string(event, "StationName"),
        "docked": event_as_bool(event, "Docked"),
        "starClass": event_as_string(event, "StarClass").or_else(|| event_as_string(event, "StarType")),
        "mode": ship_state_label(snapshot.ship_state),
        "hasWakeScanner": snapshot.has_wake_scanner,
        "ship": snapshot.ship,
        "shipName": snapshot.ship_name,
    })
}

fn log_diagnostic(kind: &str, payload: Value) {
    diagnostics::log(kind, payload);
}

#[derive(Clone, Copy, Debug, Default)]
struct WindowSnapshot {
    focused: Option<bool>,
    visible: Option<bool>,
    minimized: Option<bool>,
    maximized: Option<bool>,
}

fn window_snapshot(window: &tauri::WebviewWindow) -> WindowSnapshot {
    WindowSnapshot {
        focused: window.is_focused().ok(),
        visible: window.is_visible().ok(),
        minimized: window.is_minimized().ok(),
        maximized: window.is_maximized().ok(),
    }
}

fn thread_payload() -> Value {
    json!({
        "threadName": std::thread::current().name(),
        "threadId": format!("{:?}", std::thread::current().id()),
    })
}

fn window_payload(window: &tauri::WebviewWindow, extra: Value) -> Value {
    let snapshot = window_snapshot(window);
    json!({
        "windowLabel": window.label(),
        "focused": snapshot.focused,
        "visible": snapshot.visible,
        "minimized": snapshot.minimized,
        "maximized": snapshot.maximized,
        "extra": extra,
        "thread": thread_payload(),
    })
}

#[cfg(target_os = "windows")]
fn hwnd_text(hwnd: HWND) -> String {
    if hwnd.is_null() {
        "0x0".to_string()
    } else {
        format!("0x{:X}", hwnd as usize)
    }
}

#[cfg(target_os = "windows")]
fn window_class_name(hwnd: HWND) -> Option<String> {
    if hwnd.is_null() {
        return None;
    }

    let mut buffer = [0_u16; 256];
    let length = unsafe { GetClassNameW(hwnd, buffer.as_mut_ptr(), buffer.len() as i32) };
    if length <= 0 {
        return None;
    }
    String::from_utf16(&buffer[..length as usize]).ok()
}

#[cfg(target_os = "windows")]
fn hwnd_is_descendant_of(candidate: HWND, ancestor: HWND) -> bool {
    if candidate.is_null() || ancestor.is_null() {
        return false;
    }

    let mut current = candidate;
    for _ in 0..32 {
        if current == ancestor {
            return true;
        }
        let parent = unsafe { GetParent(current) };
        if parent.is_null() || parent == current {
            return false;
        }
        current = parent;
    }

    false
}

#[cfg(target_os = "windows")]
fn wm_name(message: u32) -> &'static str {
    match message {
        WM_ACTIVATE => "WM_ACTIVATE",
        WM_ACTIVATEAPP => "WM_ACTIVATEAPP",
        WM_SETFOCUS => "WM_SETFOCUS",
        WM_KILLFOCUS => "WM_KILLFOCUS",
        _ => "UNKNOWN",
    }
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn enumerate_child_windows(hwnd: HWND, lparam: LPARAM) -> i32 {
    let Some(children) = (lparam as *mut Vec<Value>).as_mut() else {
        return 0;
    };

    children.push(json!({
        "hwnd": hwnd_text(hwnd),
        "className": window_class_name(hwnd),
        "visible": unsafe { IsWindowVisible(hwnd) != 0 },
    }));
    1
}

#[cfg(target_os = "windows")]
unsafe extern "system" fn main_window_subclass_proc(
    hwnd: HWND,
    message: u32,
    wparam: WPARAM,
    lparam: LPARAM,
    _id_subclass: usize,
    _ref_data: usize,
) -> LRESULT {
    if matches!(message, WM_ACTIVATE | WM_ACTIVATEAPP | WM_SETFOCUS | WM_KILLFOCUS) {
        let focus_hwnd = unsafe { WinGetFocus() }.0 as HWND;
        let focus_parent = if !focus_hwnd.is_null() {
            unsafe { GetParent(focus_hwnd) }
        } else {
            std::ptr::null_mut()
        };
        let focus_owner = if !focus_hwnd.is_null() {
            unsafe { GetWindow(focus_hwnd, GW_OWNER) }
        } else {
            std::ptr::null_mut()
        };
        let wparam_hwnd = wparam as HWND;
        let foreground = unsafe { GetForegroundWindow() };
        log_diagnostic(
            "WINDOW_WIN32_ACTIVATION_MESSAGE",
            json!({
                "message": wm_name(message),
                "messageId": message,
                "hwnd": hwnd_text(hwnd),
                "focusHwnd": hwnd_text(focus_hwnd),
                "focusClassName": window_class_name(focus_hwnd),
                "focusParentHwnd": hwnd_text(focus_parent),
                "focusParentClassName": window_class_name(focus_parent),
                "focusOwnerHwnd": hwnd_text(focus_owner),
                "focusOwnerClassName": window_class_name(focus_owner),
                "focusChildOfMain": hwnd_is_descendant_of(focus_hwnd, hwnd),
                "wParamHwnd": hwnd_text(wparam_hwnd),
                "wParamClassName": window_class_name(wparam_hwnd),
                "wParam": wparam as u64,
                "lParam": lparam as i64,
                "foregroundHwnd": hwnd_text(foreground),
                "isForegroundMain": foreground == hwnd,
                "mainClassName": window_class_name(hwnd),
                "foregroundClassName": window_class_name(foreground),
                "thread": thread_payload(),
            }),
        );
    }
    unsafe { DefSubclassProc(hwnd, message, wparam, lparam) }
}

#[cfg(target_os = "windows")]
fn log_window_hwnd_identity(main_hwnd: HWND) {
    let mut children = Vec::<Value>::new();
    unsafe {
        EnumChildWindows(
            main_hwnd,
            Some(enumerate_child_windows),
            (&mut children as *mut Vec<Value>) as LPARAM,
        );
    }

    let foreground = unsafe { GetForegroundWindow() };
    log_diagnostic(
        "WINDOW_HWND_IDENTITY",
        json!({
            "mainHwnd": hwnd_text(main_hwnd),
            "mainClassName": window_class_name(main_hwnd),
            "foregroundHwnd": hwnd_text(foreground),
            "foregroundClassName": window_class_name(foreground),
            "isForegroundMain": foreground == main_hwnd,
            "childWindows": children,
            "thread": thread_payload(),
        }),
    );
}

#[cfg(target_os = "windows")]
fn install_main_window_activation_probe(main_hwnd: HWND) -> Result<(), String> {
    let key = main_hwnd as isize;
    let registry = INSTALLED_WINDOW_SUBCLASSES.get_or_init(|| Mutex::new(Vec::new()));
    if let Ok(mut installed) = registry.lock() {
        if installed.contains(&key) {
            return Ok(());
        }
        let result = unsafe { SetWindowSubclass(main_hwnd, Some(main_window_subclass_proc), 1, 0) };
        if result == 0 {
            return Err("SetWindowSubclass failed for main window".to_string());
        }
        installed.push(key);
        log_diagnostic(
            "WINDOW_NATIVE_HOOK_INSTALLED",
            json!({
                "mainHwnd": hwnd_text(main_hwnd),
                "mainClassName": window_class_name(main_hwnd),
                "thread": thread_payload(),
            }),
        );
        Ok(())
    } else {
        Err("Failed to acquire window subclass registry lock".to_string())
    }
}

#[cfg(target_os = "windows")]
fn set_process_app_user_model_id(app_id: &str) -> Result<(), String> {
    let mut id: Vec<u16> = app_id.encode_utf16().collect();
    id.push(0);
    let result = unsafe { SetCurrentProcessExplicitAppUserModelID(id.as_ptr()) };
    if result >= 0 {
        Ok(())
    } else {
        Err(format!("SetCurrentProcessExplicitAppUserModelID failed with HRESULT {result}"))
    }
}

#[cfg(not(target_os = "windows"))]
fn set_process_app_user_model_id(_app_id: &str) -> Result<(), String> {
    Ok(())
}

fn update_landing_state_for_event(
    state: &mut LandingDiagState,
    event_name: &str,
    event: &Value,
    snapshot: &EliteSnapshot,
) {
    match event_name {
        "SupercruiseDestinationDrop" => {
            state.target_station_name = event_string_trimmed(event, "Type");
            state.target_market_id = event_as_u64(event, "MarketID");
            state.has_docking_permission = false;
            state.armed = true;
            state.reminded = false;
        }
        "SupercruiseExit" => {
            let is_station_exit = event
                .get("BodyType")
                .and_then(Value::as_str)
                .is_some_and(|body_type| body_type.eq_ignore_ascii_case("Station"));
            if is_station_exit {
                if state.target_station_name.is_none() {
                    state.target_station_name = event_string_trimmed(event, "Body");
                }
                if state.target_market_id.is_none() {
                    state.target_market_id = event_as_u64(event, "MarketID");
                }
            }
        }
        _ => {}
    }

    match event_name {
        "DockingRequested" | "DockingGranted" => {
            state.has_docking_permission = true;
        }
        "Docked" => {
            state.has_docking_permission = true;
            state.target_station_name = None;
            state.target_market_id = None;
            state.armed = true;
            state.reminded = false;
        }
        "DockingDenied" | "Undocked" | "FSDJump" | "StartJump" => {
            state.has_docking_permission = false;
            if matches!(event_name, "FSDJump" | "StartJump") {
                state.target_station_name = None;
                state.target_market_id = None;
                state.armed = true;
                state.reminded = false;
            }
        }
        _ => {}
    }

    if snapshot.has_wake_scanner {
        state.armed = false;
        state.reminded = false;
    }
}

fn evaluate_landing_reminder_for_event(
    state: &mut LandingDiagState,
    event: &Value,
    snapshot: &EliteSnapshot,
) -> (bool, &'static str, Option<f64>) {
    if snapshot.has_wake_scanner {
        state.armed = false;
        state.reminded = false;
        return (false, "wake_scanner_present", extract_distance_km(event));
    }

    if state.target_station_name.is_none() {
        return (false, "target_station_unknown", extract_distance_km(event));
    }

    let Some(distance_km) = extract_distance_km(event) else {
        return (false, "distance_unknown", None);
    };

    if distance_km > 7.5 {
        state.armed = true;
        state.reminded = false;
        return (false, "outside_7_5km", Some(distance_km));
    }

    let within_reminder_band = distance_km <= 4.0 && distance_km >= 3.5;
    if !within_reminder_band {
        return (false, "outside_reminder_band", Some(distance_km));
    }

    if state.has_docking_permission {
        return (
            false,
            "docking_permission_already_requested_or_granted",
            Some(distance_km),
        );
    }

    if !state.armed {
        return (false, "reminder_not_armed", Some(distance_km));
    }

    if state.reminded {
        return (false, "reminder_already_spoken_for_approach", Some(distance_km));
    }

    state.armed = false;
    state.reminded = true;
    (true, "reminder_triggered", Some(distance_km))
}

fn landing_decision_payload(
    event_name: &str,
    event: &Value,
    snapshot: &EliteSnapshot,
    state_before: &LandingDiagState,
    state_after: &LandingDiagState,
    reminder_triggered: bool,
    skip_reason: &str,
    distance_km: Option<f64>,
) -> Value {
    let inside_7_5km = distance_km.map(|distance| distance <= 7.5);

    json!({
        "event": event_name,
        "stationName": state_after
            .target_station_name
            .clone()
            .or_else(|| event_as_string(event, "StationName"))
            .or_else(|| snapshot.station_name.clone()),
        "marketId": state_after.target_market_id,
        "distanceToStationKm": distance_km,
        "inside7_5km": inside_7_5km,
        "stateBefore": {
            "armed": state_before.armed,
            "reminded": state_before.reminded,
            "hasDockingPermission": state_before.has_docking_permission,
            "targetStationName": state_before.target_station_name,
            "targetMarketId": state_before.target_market_id,
        },
        "stateAfter": {
            "armed": state_after.armed,
            "reminded": state_after.reminded,
            "hasDockingPermission": state_after.has_docking_permission,
            "targetStationName": state_after.target_station_name,
            "targetMarketId": state_after.target_market_id,
        },
        "hasWakeScanner": snapshot.has_wake_scanner,
        "reminderTriggered": reminder_triggered,
        "skipReason": skip_reason,
    })
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RouteStep {
    system: String,
    star_class: Option<String>,
    position: Option<[f64; 3]>,
}

#[derive(Clone, Debug, Default, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct NavigationProgress {
    current_system: Option<String>,
    next_system: Option<String>,
    remaining_jumps: usize,
    remaining_distance: Option<f64>,
    active_route: Vec<RouteStep>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CareerRank {
    level: u64,
    progress: Option<u64>,
}

#[derive(Debug, Default, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CommanderRanks {
    explore: Option<CareerRank>,
    exobiologist: Option<CareerRank>,
    trade: Option<CareerRank>,
    combat: Option<CareerRank>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct LastJourney {
    start_system: String,
    destination_system: String,
    started_at: String,
    arrived_at: String,
    duration_seconds: u64,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
enum ShipState {
    Supercruise,
    NormalSpace,
    Docked,
    Landed,
}

#[derive(Debug, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct EliteSnapshot {
    commander: Option<String>,
    ranks: CommanderRanks,
    system: Option<String>,
    ship: Option<String>,
    ship_name: Option<String>,
    ship_ident: Option<String>,
    docked: Option<bool>,
    ship_state: Option<ShipState>,
    station_name: Option<String>,
    planet_name: Option<String>,
    current_jump_range: Option<f64>,
    max_jump_range: Option<f64>,
    has_wake_scanner: bool,
    elite_connected: bool,
    current_telemetry_confirmed: bool,
    exploration: ExplorationSnapshot,
    journal_path: String,
    navigation_progress: NavigationProgress,
    last_journey: Option<LastJourney>,
}

#[tauri::command]
fn is_elite_dangerous_running() -> bool {
    runtime_health::process_running("EliteDangerous64.exe")
}

#[tauri::command]
fn list_local_voices(state: tauri::State<'_, LocalSpeechState>) -> Result<Vec<LocalVoice>, String> {
    local_speech::list_local_voices(state.inner())
}

#[tauri::command]
async fn speak_local(
    state: tauri::State<'_, LocalSpeechState>,
    request: SpeakLocalRequest,
) -> Result<(), String> {
    let speech = state.inner().clone();
    tauri::async_runtime::spawn_blocking(move || local_speech::speak_local(&speech, request))
        .await
        .map_err(|error| error.to_string())?
}

#[tauri::command]
fn stop_local_speech(state: tauri::State<'_, LocalSpeechState>) -> Result<(), String> {
    local_speech::stop_local_speech(state.inner())
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
    let task_started = std::time::Instant::now();
    let window = app
        .get_webview_window("main")
        .ok_or_else(|| "main window is unavailable".to_string())?;
    log_diagnostic(
        "WINDOW_MAIN_THREAD_TASK_START",
        window_payload(&window, json!({ "task": "show_main_window", "phase": phase })),
    );
    log_diagnostic(
        "WINDOW_SHOW_REQUESTED",
        window_payload(&window, json!({ "phase": phase })),
    );
    let show_started = std::time::Instant::now();
    window.show().map_err(|error| error.to_string())?;
    log_diagnostic(
        "WINDOW_SHOW_COMPLETED",
        window_payload(
            &window,
            json!({
                "phase": phase,
                "durationMs": show_started.elapsed().as_millis() as u64,
            }),
        ),
    );
    log_diagnostic(
        "WINDOW_FOCUS_REQUESTED",
        window_payload(&window, json!({ "phase": phase })),
    );
    let focus_started = std::time::Instant::now();
    window.set_focus().map_err(|error| error.to_string())?;
    log_diagnostic(
        "WINDOW_FOCUS_COMPLETED",
        window_payload(
            &window,
            json!({
                "phase": phase,
                "durationMs": focus_started.elapsed().as_millis() as u64,
            }),
        ),
    );
    log_diagnostic(
        "WINDOW_MAIN_THREAD_TASK_END",
        window_payload(
            &window,
            json!({
                "task": "show_main_window",
                "phase": phase,
                "durationMs": task_started.elapsed().as_millis() as u64,
            }),
        ),
    );
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
    let heartbeat = app.state::<FrontendHeartbeat>();
    let now = unix_time_ms();
    heartbeat.last_seen_ms.store(now, Ordering::Relaxed);
    heartbeat.stall_reported.store(false, Ordering::Relaxed);

    let last_logged = heartbeat.last_logged_ms.load(Ordering::Relaxed);
    if now.saturating_sub(last_logged) >= 4_000 {
        heartbeat.last_logged_ms.store(now, Ordering::Relaxed);
        log_diagnostic("FRONTEND_HEARTBEAT", json!({ "lastSeenMs": now }));
    }
}

#[tauri::command]
fn log_diagnostic_event(kind: String, payload: Option<Value>) {
    log_diagnostic(&kind, payload.unwrap_or_else(|| json!({})));
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
fn updater_distribution() -> &'static str {
    if option_env!("OGG_LOCAL_TEST_BUILD").is_some() {
        "local-test"
    } else {
        "official"
    }
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
fn prepare_for_update() -> UpdateReadiness {
    log::info!(
        "version={} phase=update_prepare process=app.exe cause=preflight",
        env!("CARGO_PKG_VERSION")
    );
    let readiness = runtime_health::update_readiness();
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
    let health = StartupHealth::ready();
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

#[tauri::command]
fn open_journal_directory() -> Result<(), String> {
    let directory = find_journal_directory("de")?;
    runtime_health::hidden_output("explorer.exe", &[directory.to_string_lossy().as_ref()])
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

fn journal_files(directory: &Path) -> Vec<PathBuf> {
    let mut journals = fs::read_dir(directory)
        .into_iter()
        .flatten()
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .is_some_and(|name| name.starts_with("Journal.") && name.ends_with(".log"))
        })
        .collect::<Vec<_>>();

    journals.sort_by_key(|path| journal_sort_key(path));
    journals
}

fn journal_sort_key(path: &Path) -> String {
    let name = path.file_name().and_then(|name| name.to_str()).unwrap_or_default();
    let timestamp = name.strip_prefix("Journal.").and_then(|value| value.split('.').next()).unwrap_or_default();
    let digits = timestamp.chars().filter(char::is_ascii_digit).collect::<String>();
    match digits.len() {
        12 => format!("20{digits}"),
        14 => digits,
        _ => format!("9999{name}"),
    }
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

impl JourneyParser {
    fn apply_line(&mut self, line: &[u8]) {
        let Ok(event) = serde_json::from_slice::<Value>(line) else { return };
        if let Some((address, star_class)) = primary_star_class(&event) {
            self.star_classes.insert(address, star_class);
        }
        match event.get("event").and_then(Value::as_str).unwrap_or_default() {
            "Location" => {
                self.current_system = event.get("StarSystem").and_then(Value::as_str).map(str::to_string);
                self.pending_jump = None;
            }
            "StartJump" if event.get("JumpType").and_then(Value::as_str) == Some("Hyperspace") => {
                let (Some(origin), Some(started_at)) = (
                    self.current_system.clone(),
                    event.get("timestamp").and_then(Value::as_str),
                ) else {
                    self.pending_jump = None;
                    return;
                };
                self.pending_jump = Some((
                    origin,
                    event.get("StarSystem").and_then(Value::as_str).map(str::to_string),
                    started_at.to_string(),
                ));
            }
            "FSDJump" | "CarrierJump" => {
                let destination = event.get("StarSystem").and_then(Value::as_str).map(str::to_string);
                let arrived_at = event.get("timestamp").and_then(Value::as_str).map(str::to_string);
                if let (Some((origin, expected, started_at)), Some(destination), Some(arrived_at)) =
                    (self.pending_jump.take(), destination.clone(), arrived_at)
                {
                    let matches = expected.as_deref().is_none_or(|value| value.eq_ignore_ascii_case(&destination));
                    let duration_seconds = DateTime::parse_from_rfc3339(&started_at)
                        .ok()
                        .zip(DateTime::parse_from_rfc3339(&arrived_at).ok())
                        .and_then(|(start, end)| (end >= start).then(|| (end - start).num_seconds() as u64));
                    if matches && !origin.eq_ignore_ascii_case(&destination) {
                        if let Some(duration_seconds) = duration_seconds {
                            self.last_journey = Some(LastJourney {
                                start_system: origin,
                                destination_system: destination.clone(),
                                started_at,
                                arrived_at,
                                duration_seconds,
                            });
                        }
                    }
                }
                self.current_system = destination;
            }
            "Shutdown" => self.pending_jump = None,
            _ => {}
        }
    }
}

fn read_complete_journey_lines(path: &Path, offset: u64, parser: &mut JourneyParser) -> Result<u64, String> {
    let mut file = File::open(path).map_err(|error| error.to_string())?;
    file.seek(SeekFrom::Start(offset)).map_err(|error| error.to_string())?;
    let mut reader = BufReader::new(file);
    let mut complete_bytes = offset;
    loop {
        let mut line = Vec::new();
        let bytes = reader.read_until(b'\n', &mut line).map_err(|error| error.to_string())?;
        if bytes == 0 || !line.ends_with(b"\n") {
            break;
        }
        complete_bytes = complete_bytes.saturating_add(bytes as u64);
        parser.apply_line(&line);
    }
    Ok(complete_bytes)
}

fn build_journey_index(directory: &Path, previous: Option<&JourneyHistoryIndex>) -> JourneyHistoryIndex {
    let files = journal_files(directory);
    let incremental = previous.filter(|index| {
        index.files.len() <= files.len()
            && index.files.iter().zip(&files).all(|(old, path)| {
                old.path == *path && fs::metadata(path).is_ok_and(|metadata| metadata.len() >= old.observed_size)
            })
    });
    let mut index = incremental.cloned().unwrap_or_default();
    if incremental.is_none() {
        index.files.clear();
        index.parser = JourneyParser::default();
    }

    for (position, path) in files.into_iter().enumerate() {
        let observed_size = fs::metadata(&path).map(|metadata| metadata.len()).unwrap_or(0);
        if index.files.get(position).is_some_and(|file| file.observed_size == observed_size) {
            continue;
        }
        let offset = index.files.get(position).map(|file| file.complete_bytes).unwrap_or(0);
        let complete_bytes = read_complete_journey_lines(&path, offset, &mut index.parser).unwrap_or(offset);
        let cursor = JourneyFileCursor { path, complete_bytes, observed_size };
        if position < index.files.len() { index.files[position] = cursor } else { index.files.push(cursor) }
    }
    index
}

#[cfg(test)]
fn reconstruct_last_journey(directory: &Path) -> Option<LastJourney> {
    build_journey_index(directory, None).parser.last_journey
}

fn cached_last_journey(journal_directory: &Path, journal_path: &Path, journal_size: u64) -> Option<LastJourney> {
    let cache = JOURNEY_HISTORY_CACHE.get_or_init(|| Mutex::new(JourneyHistoryCache::default()));
    let (journey, previous, should_start) = match cache.lock() {
        Ok(mut cache) => {
            let journey = cache.index.as_ref().and_then(|index| index.parser.last_journey.clone());
            let previous = cache.index.clone();
            let needs_refresh = cache.index.is_none()
                || cache.observed_latest_path.as_deref() != Some(journal_path)
                || cache.observed_latest_size != journal_size;
            let should_start = !cache.running && needs_refresh;
            if should_start {
                cache.running = true;
                cache.observed_latest_path = Some(journal_path.to_path_buf());
                cache.observed_latest_size = journal_size;
            }
            (journey, previous, should_start)
        }
        Err(_) => return None,
    };
    if should_start {
        let directory = journal_directory.to_path_buf();
        std::thread::spawn(move || {
            let started = Instant::now();
            log_diagnostic("WILLI_JOURNEY_ANALYSIS_START", json!({ "mode": if previous.is_some() { "incremental" } else { "initial" } }));
            let index = build_journey_index(&directory, previous.as_ref());
            let file_count = index.files.len();
            if let Ok(mut classes) = KNOWN_STAR_CLASSES.get_or_init(|| Mutex::new(HashMap::new())).lock() {
                classes.extend(index.parser.star_classes.clone());
            }
            if let Ok(mut cache) = JOURNEY_HISTORY_CACHE.get().expect("journey cache initialized").lock() {
                cache.index = Some(index);
                cache.running = false;
            }
            log_diagnostic("WILLI_JOURNEY_ANALYSIS_END", json!({ "durationMs": started.elapsed().as_millis() as u64, "journalFileCount": file_count }));
        });
    }
    journey
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

fn primary_star_class(event: &Value) -> Option<(u64, String)> {
    let address = event.get("SystemAddress")?.as_u64()?;
    let event_name = event.get("event")?.as_str()?;
    let star_class = match event_name {
        "Location" | "FSDJump" | "CarrierJump" => event.get("StarClass")?.as_str()?,
        "Scan" if event.get("BodyID").and_then(Value::as_u64) == Some(0) => {
            event.get("StarType")?.as_str()?
        }
        _ => return None,
    };
    (!star_class.trim().is_empty()).then(|| (address, star_class.to_string()))
}

fn known_star_class(journal_directory: &Path, system_address: u64) -> Option<String> {
    let _ = journal_directory;
    let cache = KNOWN_STAR_CLASSES.get_or_init(|| Mutex::new(HashMap::new()));
    cache.lock().ok().and_then(|classes| classes.get(&system_address).cloned())
}

fn active_navigation_route(
    route: Vec<RouteStep>,
    current_system: Option<&str>,
    journal_systems: &[String],
) -> Vec<RouteStep> {
    let Some(current_system) = current_system.filter(|system| !system.is_empty()) else {
        return route;
    };

    let candidates: Vec<usize> = route
        .iter()
        .enumerate()
        .filter_map(|(index, step)| {
            step.system
                .eq_ignore_ascii_case(current_system)
                .then_some(index)
        })
        .collect();

    let Some(mut best_index) = candidates.first().copied() else {
        let mut active = Vec::with_capacity(route.len() + 1);
        active.push(RouteStep {
            system: current_system.to_string(),
            star_class: None,
            position: None,
        });
        active.extend(route);
        return active;
    };

    let mut best_score = 0;
    for candidate in candidates {
        let mut score = 0;
        let mut route_index = candidate;
        let mut history_index = journal_systems.len();

        while history_index > 0 {
            history_index -= 1;
            if !route[route_index]
                .system
                .eq_ignore_ascii_case(&journal_systems[history_index])
            {
                break;
            }
            score += 1;
            if route_index == 0 {
                break;
            }
            route_index -= 1;
        }

        if score > best_score {
            best_score = score;
            best_index = candidate;
        }
    }

    route.into_iter().skip(best_index).collect()
}

fn navigation_progress(
    route: Vec<RouteStep>,
    current_system: Option<&str>,
    current_star_class: Option<&str>,
    journal_systems: &[String],
) -> NavigationProgress {
    let mut active_route = active_navigation_route(route, current_system, journal_systems);
    if let Some(current_step) = active_route.first_mut().filter(|step| {
        current_system.is_some_and(|system| step.system.eq_ignore_ascii_case(system))
    }) {
        if let Some(star_class) = current_star_class.filter(|value| !value.trim().is_empty()) {
            current_step.star_class = Some(star_class.to_string());
        }
    }
    let remaining_distance = active_route
        .windows(2)
        .try_fold(0.0, |total, pair| {
            let [start, end] = pair else { return None };
            let start = start.position?;
            let end = end.position?;
            Some(
                total
                    + ((end[0] - start[0]).powi(2)
                        + (end[1] - start[1]).powi(2)
                        + (end[2] - start[2]).powi(2))
                    .sqrt(),
            )
        })
        .filter(|_| active_route.len() > 1);

    NavigationProgress {
        current_system: current_system.map(str::to_string),
        next_system: active_route.get(1).map(|step| step.system.clone()),
        remaining_jumps: active_route.len().saturating_sub(1),
        remaining_distance,
        active_route,
    }
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
    let mut journal_systems = Vec::new();
    let mut current_star_class: Option<String> = None;
    let mut current_system_address: Option<u64> = None;

    let planned_route = read_navigation_route(journal_directory);
    let mut snapshot = EliteSnapshot {
        journal_path: journal_path.display().to_string(),
        ..EliteSnapshot::default()
    };
    let mut line_number = 0_usize;
    let cursor_store = JOURNAL_DIAG_CURSOR.get_or_init(|| Mutex::new(HashMap::new()));
    let previously_logged_line = cursor_store
        .lock()
        .ok()
        .and_then(|cursor| cursor.get(journal_path).copied())
        .unwrap_or(0);
    let mut landing_state = LandingDiagState {
        armed: true,
        reminded: false,
        has_docking_permission: false,
        target_station_name: None,
        target_market_id: None,
    };

    for line in reader.lines() {
        let line = match line {
            Ok(line) => line,
            Err(_) => continue,
        };
        line_number = line_number.saturating_add(1);

        let event: Value = match serde_json::from_str(&line) {
            Ok(event) => event,
            Err(_) => continue,
        };

        let event_name = event
            .get("event")
            .and_then(Value::as_str)
            .unwrap_or_default();
        let should_log_event =
            line_number > previously_logged_line && is_relevant_journal_event(event_name);

        if should_log_event {
            log_diagnostic("EVENT_RECEIVED", journal_event_payload(&event, &snapshot));
        }

        let processing_started = std::time::Instant::now();

        exploration.apply(&event);
        apply_snapshot_event(
            &mut snapshot,
            &event,
            &mut journal_systems,
            &mut current_system_address,
            &mut current_star_class,
        );

        let state_before = landing_state.clone();
        update_landing_state_for_event(&mut landing_state, event_name, &event, &snapshot);
        let (reminder_triggered, skip_reason, decision_distance_km) =
            evaluate_landing_reminder_for_event(&mut landing_state, &event, &snapshot);

        if should_log_event {
            log_diagnostic(
                "EVENT_PROCESSED",
                json!({
                    "event": event_name,
                    "durationMs": processing_started.elapsed().as_millis() as u64,
                    "mode": ship_state_label(snapshot.ship_state),
                    "docked": snapshot.docked,
                    "stationName": snapshot.station_name,
                    "landingTargetStation": landing_state.target_station_name,
                    "landingTargetMarketId": landing_state.target_market_id,
                    "hasWakeScanner": snapshot.has_wake_scanner,
                }),
            );
        }

        if should_log_event && event_name == "SupercruiseDestinationDrop" {
            log_diagnostic(
                "LANDING_TARGET_SET",
                json!({
                    "stationName": landing_state.target_station_name,
                    "marketId": landing_state.target_market_id,
                    "source": "SupercruiseDestinationDrop",
                }),
            );
        }

        if should_log_event
            && matches!(
                event_name,
                "SupercruiseDestinationDrop"
                    | "SupercruiseExit"
                    | "Status"
                    | "DockingRequested"
                    | "DockingGranted"
                    | "DockingDenied"
                    | "Docked"
                    | "Undocked"
            )
        {
            log_diagnostic(
                "LANDING_STATE",
                json!({
                    "event": event_name,
                    "armed": landing_state.armed,
                    "reminded": landing_state.reminded,
                    "hasDockingPermission": landing_state.has_docking_permission,
                    "hasWakeScanner": snapshot.has_wake_scanner,
                    "stationName": snapshot.station_name,
                    "targetStationName": landing_state.target_station_name,
                    "targetMarketId": landing_state.target_market_id,
                }),
            );
            log_diagnostic(
                "LANDING_DECISION",
                landing_decision_payload(
                    event_name,
                    &event,
                    &snapshot,
                    &state_before,
                    &landing_state,
                    reminder_triggered,
                    skip_reason,
                    decision_distance_km,
                ),
            );
        }
    }

    if let Ok(mut cursor) = cursor_store.lock() {
        cursor.insert(journal_path.to_path_buf(), line_number);
    }

    if current_star_class.is_none() {
        current_star_class = current_system_address
            .and_then(|address| known_star_class(journal_directory, address));
    }

    snapshot.navigation_progress = navigation_progress(
        planned_route,
        snapshot.system.as_deref(),
        current_star_class.as_deref(),
        &journal_systems,
    );
    let history_started = Instant::now();
    log_diagnostic("HISTORY_ANALYSIS_START", json!({ "cachedSnapshot": false }));
    let journal_size = fs::metadata(journal_path).map(|metadata| metadata.len()).unwrap_or(0);
    snapshot.last_journey = cached_last_journey(journal_directory, journal_path, journal_size);
    log_diagnostic("HISTORY_ANALYSIS_END", json!({
        "durationMs": history_started.elapsed().as_millis() as u64,
        "available": snapshot.last_journey.is_some(),
    }));
    snapshot.exploration = exploration.finish();

    Ok(snapshot)
}

fn apply_snapshot_event(
    snapshot: &mut EliteSnapshot,
    event: &Value,
    journal_systems: &mut Vec<String>,
    current_system_address: &mut Option<u64>,
    current_star_class: &mut Option<String>,
) {
    if let Some((address, star_class)) = primary_star_class(event) {
        if let Ok(mut classes) = KNOWN_STAR_CLASSES
            .get_or_init(|| Mutex::new(HashMap::new()))
            .lock()
        {
            classes.insert(address, star_class.clone());
        }
        if *current_system_address == Some(address) {
            *current_star_class = Some(star_class);
        }
    }

    let event_name = event
        .get("event")
        .and_then(Value::as_str)
        .unwrap_or_default();

    match event_name {
        "Commander" | "LoadGame" => {
            snapshot.current_telemetry_confirmed = false;
            if let Some(name) = journal_commander_name(event) {
                snapshot.commander = Some(name.to_string());
            }

            if let Some(ship) = event.get("Ship").and_then(Value::as_str) {
                snapshot.ship = Some(ship.to_string());
            }

            if let Some(ship_name) = event.get("ShipName").and_then(Value::as_str) {
                snapshot.ship_name = Some(ship_name.to_string());
            }

            if let Some(ship_ident) = event.get("ShipIdent").and_then(Value::as_str) {
                snapshot.ship_ident = (!ship_ident.trim().is_empty()).then(|| ship_ident.to_string());
            }
        }

        "Rank" => {
            snapshot.ranks.explore = event.get("Explore").and_then(Value::as_u64).map(|level| CareerRank { level, progress: None });
            snapshot.ranks.exobiologist = event.get("Exobiologist").and_then(Value::as_u64).map(|level| CareerRank { level, progress: None });
            snapshot.ranks.trade = event.get("Trade").and_then(Value::as_u64).map(|level| CareerRank { level, progress: None });
            snapshot.ranks.combat = event.get("Combat").and_then(Value::as_u64).map(|level| CareerRank { level, progress: None });
        }

        "Progress" => {
            for (rank, field) in [
                (&mut snapshot.ranks.explore, "Explore"),
                (&mut snapshot.ranks.exobiologist, "Exobiologist"),
                (&mut snapshot.ranks.trade, "Trade"),
                (&mut snapshot.ranks.combat, "Combat"),
            ] {
                if let (Some(rank), Some(progress)) = (rank.as_mut(), event.get(field).and_then(Value::as_u64)) {
                    rank.progress = Some(progress.min(100));
                }
            }
        }

        "Loadout" => {
            if let Some(ship) = event.get("Ship").and_then(Value::as_str) {
                snapshot.ship = Some(ship.to_string());
            }

            if let Some(ship_name) = event.get("ShipName").and_then(Value::as_str) {
                snapshot.ship_name = Some(ship_name.to_string());
            }

            if let Some(ship_ident) = event.get("ShipIdent").and_then(Value::as_str) {
                snapshot.ship_ident = (!ship_ident.trim().is_empty()).then(|| ship_ident.to_string());
            }

            if let Some(max_jump_range) = event.get("MaxJumpRange").and_then(Value::as_f64) {
                snapshot.max_jump_range = Some(max_jump_range);
            }

            snapshot.has_wake_scanner = loadout_has_wake_scanner(event);
        }

        "Location" | "FSDJump" | "CarrierJump" => {
            snapshot.current_telemetry_confirmed = true;
            *current_system_address = event.get("SystemAddress").and_then(Value::as_u64);
            *current_star_class = current_system_address.as_ref().and_then(|address| {
                KNOWN_STAR_CLASSES
                    .get_or_init(|| Mutex::new(HashMap::new()))
                    .lock()
                    .ok()
                    .and_then(|classes| classes.get(address).cloned())
            });
            if let Some(system) = event.get("StarSystem").and_then(Value::as_str) {
                snapshot.system = Some(system.to_string());
                if journal_systems
                    .last()
                    .is_none_or(|previous: &String| !previous.eq_ignore_ascii_case(system))
                {
                    journal_systems.push(system.to_string());
                }
            }

            apply_location_state(snapshot, event_name, event);
        }

        "Docked" => {
            snapshot.docked = Some(true);
            snapshot.ship_state = Some(ShipState::Docked);
            snapshot.station_name = station_name_from_event(event)
                .or_else(|| snapshot.station_name.clone());
            snapshot.planet_name = None;
        }
        "Undocked" => {
            snapshot.docked = Some(false);
            snapshot.ship_state = Some(ShipState::NormalSpace);
            snapshot.station_name = None;
            snapshot.planet_name = None;
        }
        "SupercruiseEntry" => {
            snapshot.docked = Some(false);
            snapshot.ship_state = Some(ShipState::Supercruise);
            snapshot.station_name = None;
            snapshot.planet_name = None;
        }
        "SupercruiseExit" => {
            snapshot.docked = Some(false);
            snapshot.ship_state = Some(ShipState::NormalSpace);
            snapshot.station_name = None;
            snapshot.planet_name = None;
        }
        "Touchdown" => {
            snapshot.docked = Some(false);
            snapshot.ship_state = Some(ShipState::Landed);
            snapshot.station_name = None;
            if let Some(planet_name) = planet_name_from_event(event) {
                snapshot.planet_name = Some(planet_name);
            }
        }
        "Liftoff" => {
            snapshot.docked = Some(false);
            snapshot.ship_state = Some(ShipState::NormalSpace);
            snapshot.planet_name = None;
        }

        _ => {}
    }
}

fn apply_location_state(snapshot: &mut EliteSnapshot, event_name: &str, event: &Value) {
    if matches!(event_name, "FSDJump" | "CarrierJump") {
        snapshot.docked = Some(false);
        snapshot.ship_state = Some(ShipState::NormalSpace);
        snapshot.station_name = None;
        snapshot.planet_name = None;
        return;
    }

    let Some(docked) = event.get("Docked").and_then(Value::as_bool) else {
        return;
    };

    snapshot.docked = Some(docked);

    if docked {
        snapshot.ship_state = Some(ShipState::Docked);
        snapshot.station_name = station_name_from_event(event)
            .or_else(|| snapshot.station_name.clone());
        snapshot.planet_name = None;
        return;
    }

    snapshot.station_name = None;

    if snapshot.ship_state == Some(ShipState::Landed) {
        if let Some(planet_name) = planet_name_from_event(event) {
            snapshot.planet_name = Some(planet_name);
        }
        return;
    }

    snapshot.ship_state = Some(ShipState::NormalSpace);
    snapshot.planet_name = None;
}

fn station_name_from_event(event: &Value) -> Option<String> {
    event
        .get("StationName")
        .and_then(Value::as_str)
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(str::to_string)
}

fn loadout_has_wake_scanner(event: &Value) -> bool {
    event
        .get("Modules")
        .and_then(Value::as_array)
        .is_some_and(|modules| {
            modules.iter().any(|module| {
                let item = module
                    .get("Item")
                    .and_then(Value::as_str)
                    .or_else(|| module.get("Name").and_then(Value::as_str))
                    .or_else(|| module.get("ModuleName").and_then(Value::as_str))
                    .unwrap_or_default()
                    .to_ascii_lowercase();
                item.contains("wake") && item.contains("scanner")
            })
        })
}

fn planet_name_from_event(event: &Value) -> Option<String> {
    ["BodyName", "Body"]
        .into_iter()
        .find_map(|key| {
            event
                .get(key)
                .and_then(Value::as_str)
                .map(str::trim)
                .filter(|value| !value.is_empty())
                .map(str::to_string)
        })
}

#[cfg(test)]
mod snapshot_cache_tests {
    use super::*;

    #[test]
    fn window_state_persists_size_position_and_maximization() {
        let flags = persisted_window_state_flags();
        assert!(flags.contains(StateFlags::SIZE));
        assert!(flags.contains(StateFlags::POSITION));
        assert!(flags.contains(StateFlags::MAXIMIZED));
    }

    #[test]
    fn unchanged_journal_is_not_marked_as_changed() {
        let previous = JournalCacheState {
            path: PathBuf::from("C:/Games/Journal.00001.log"),
            size_bytes: 1200,
            modified_ms: 999,
        };
        let current = JournalCacheState {
            path: PathBuf::from("C:/Games/Journal.00001.log"),
            size_bytes: 1200,
            modified_ms: 999,
        };

        assert!(!journal_changed(&previous, &current));
    }

    #[test]
    fn changed_journal_is_marked_as_changed() {
        let previous = JournalCacheState {
            path: PathBuf::from("C:/Games/Journal.00001.log"),
            size_bytes: 1200,
            modified_ms: 999,
        };
        let current = JournalCacheState {
            path: PathBuf::from("C:/Games/Journal.00001.log"),
            size_bytes: 1500,
            modified_ms: 1000,
        };

        assert!(journal_changed(&previous, &current));
    }

    #[test]
    fn cached_journal_snapshot_rechecks_the_live_elite_process_state() {
        let mut journal_snapshot = EliteSnapshot::default();
        journal_snapshot.system = Some("HIP 49485".into());
        journal_snapshot.current_telemetry_confirmed = true;
        journal_snapshot.docked = Some(false);
        journal_snapshot.ship_state = Some(ShipState::Supercruise);

        let disconnected = with_elite_connection_state(journal_snapshot, false);
        assert!(!disconnected.elite_connected);
        assert_eq!(disconnected.ship_state, None);

        let mut cached_journal_snapshot = EliteSnapshot::default();
        cached_journal_snapshot.system = Some("HIP 49485".into());
        cached_journal_snapshot.current_telemetry_confirmed = true;
        cached_journal_snapshot.docked = Some(false);
        cached_journal_snapshot.ship_state = Some(ShipState::Supercruise);
        let reconnected = with_elite_connection_state(cached_journal_snapshot, true);

        assert!(reconnected.elite_connected);
        assert_eq!(reconnected.ship_state, Some(ShipState::Supercruise));
    }
}

#[cfg(test)]
mod navigation_tests {
    use super::*;
    use std::io::Write as _;

    fn route(systems: &[&str]) -> Vec<RouteStep> {
        systems
            .iter()
            .map(|system| RouteStep {
                system: (*system).into(),
                star_class: Some("K".into()),
                position: None,
            })
            .collect()
    }

    fn names(route: &[RouteStep]) -> Vec<&str> {
        route.iter().map(|step| step.system.as_str()).collect()
    }

    #[test]
    fn keeps_a_newly_loaded_route_at_its_start() {
        let active = active_navigation_route(route(&["A", "B", "C"]), Some("A"), &["A".into()]);
        assert_eq!(names(&active), ["A", "B", "C"]);
    }

    #[test]
    fn advances_the_route_after_one_jump() {
        let active = active_navigation_route(
            route(&["A", "B", "C"]),
            Some("B"),
            &["A".into(), "B".into()],
        );
        assert_eq!(names(&active), ["B", "C"]);
    }

    #[test]
    fn advances_the_route_after_multiple_jumps() {
        let active = active_navigation_route(
            route(&["A", "B", "C", "D"]),
            Some("C"),
            &["A".into(), "B".into(), "C".into()],
        );
        assert_eq!(names(&active), ["C", "D"]);
    }

    #[test]
    fn restores_progress_from_the_current_system_after_an_app_restart() {
        let active =
            active_navigation_route(route(&["A", "B", "C", "D"]), Some("C"), &["C".into()]);
        assert_eq!(names(&active), ["C", "D"]);
    }

    #[test]
    fn manual_refresh_produces_the_same_active_route() {
        let planned = route(&["A", "B", "C", "D"]);
        let history = ["A".into(), "B".into(), "C".into()];
        let automatic = active_navigation_route(planned.clone(), Some("C"), &history);
        let manual = active_navigation_route(planned, Some("C"), &history);
        assert_eq!(manual, automatic);
    }

    #[test]
    fn fully_adopts_a_replanned_route() {
        let active = active_navigation_route(
            route(&["C", "X", "Y"]),
            Some("C"),
            &["A".into(), "B".into(), "C".into()],
        );
        assert_eq!(names(&active), ["C", "X", "Y"]);
    }

    #[test]
    fn leaves_only_the_current_system_when_the_route_is_complete() {
        let active = active_navigation_route(
            route(&["A", "B", "C"]),
            Some("C"),
            &["A".into(), "B".into(), "C".into()],
        );
        assert_eq!(names(&active), ["C"]);
    }

    #[test]
    fn uses_journal_history_to_choose_a_repeated_system() {
        let active = active_navigation_route(
            route(&["A", "B", "A", "C"]),
            Some("A"),
            &["A".into(), "B".into(), "A".into()],
        );
        assert_eq!(names(&active), ["A", "C"]);
    }

    #[test]
    fn prepends_the_current_position_when_elite_returns_only_future_steps() {
        let active = active_navigation_route(route(&["B", "C"]), Some("A"), &["A".into()]);
        assert_eq!(names(&active), ["A", "B", "C"]);
    }

    #[test]
    fn derives_every_navigation_kpi_from_the_same_active_route() {
        let planned = vec![
            RouteStep {
                system: "A".into(),
                star_class: None,
                position: Some([0.0, 0.0, 0.0]),
            },
            RouteStep {
                system: "B".into(),
                star_class: None,
                position: Some([3.0, 4.0, 0.0]),
            },
            RouteStep {
                system: "C".into(),
                star_class: None,
                position: Some([3.0, 4.0, 12.0]),
            },
        ];

        let progress = navigation_progress(planned, Some("B"), None, &["A".into(), "B".into()]);

        assert_eq!(progress.current_system.as_deref(), Some("B"));
        assert_eq!(progress.next_system.as_deref(), Some("C"));
        assert_eq!(progress.remaining_jumps, 1);
        assert_eq!(progress.remaining_distance, Some(12.0));
        assert_eq!(names(&progress.active_route), ["B", "C"]);
    }

    #[test]
    fn keeps_the_current_star_class_after_the_plotted_route_is_finished() {
        let progress = navigation_progress(
            Vec::new(),
            Some("Wregoe UB-Z b41-6"),
            Some("M"),
            &["Wregoe UB-Z b41-6".into()],
        );

        assert_eq!(progress.remaining_jumps, 0);
        assert_eq!(progress.active_route.len(), 1);
        assert_eq!(progress.active_route[0].system, "Wregoe UB-Z b41-6");
        assert_eq!(progress.active_route[0].star_class.as_deref(), Some("M"));
    }

    #[test]
    fn reads_the_primary_star_type_from_scan_data() {
        let event = serde_json::json!({
            "event": "Scan",
            "SystemAddress": 42,
            "BodyID": 0,
            "StarType": "M"
        });
        assert_eq!(primary_star_class(&event), Some((42, "M".into())));
    }

    #[test]
    fn ignores_non_primary_scan_bodies() {
        let event = serde_json::json!({
            "event": "Scan",
            "SystemAddress": 42,
            "BodyID": 3,
            "StarType": "T"
        });
        assert_eq!(primary_star_class(&event), None);
    }

    fn apply_events(events: &[Value]) -> EliteSnapshot {
        let mut snapshot = EliteSnapshot::default();
        let mut journal_systems = Vec::new();
        let mut current_system_address = None;
        let mut current_star_class = None;

        for event in events {
            apply_snapshot_event(
                &mut snapshot,
                event,
                &mut journal_systems,
                &mut current_system_address,
                &mut current_star_class,
            );
        }

        snapshot
    }

    #[test]
    fn marks_supercruise_from_the_journal() {
        let snapshot = apply_events(&[serde_json::json!({ "event": "SupercruiseEntry" })]);

        assert_eq!(snapshot.ship_state, Some(ShipState::Supercruise));
        assert_eq!(snapshot.docked, Some(false));
    }

    #[test]
    fn load_game_keeps_the_commander_but_does_not_invent_a_ship_status() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "LoadGame",
            "Commander": "helitony2",
            "Ship": "CobraMkIII",
            "ShipName": "Test Ship",
        })]);

        assert_eq!(snapshot.commander.as_deref(), Some("helitony2"));
        assert_eq!(snapshot.ship_state, None);
        assert!(!snapshot.current_telemetry_confirmed);
    }

    #[test]
    fn reads_exploration_rank_progress_and_visible_ship_ident() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "LoadGame",
                "Commander": "Panopi",
                "Ship": "Krait_MkII",
                "ShipName": "Fesches Schiff",
                "ShipIdent": "OGG-42",
                "ShipID": 123,
            }),
            serde_json::json!({ "event": "Rank", "Explore": 7, "Exobiologist": 5, "Trade": 4, "Combat": 3 }),
            serde_json::json!({ "event": "Progress", "Explore": 64, "Exobiologist": 27, "Trade": 81, "Combat": 12 }),
        ]);

        assert_eq!(snapshot.commander.as_deref(), Some("Panopi"));
        assert_eq!(snapshot.ship.as_deref(), Some("Krait_MkII"));
        assert_eq!(snapshot.ship_name.as_deref(), Some("Fesches Schiff"));
        assert_eq!(snapshot.ship_ident.as_deref(), Some("OGG-42"));
        assert_eq!(
            snapshot.ranks.explore,
            Some(CareerRank { level: 7, progress: Some(64) }),
        );
        assert_eq!(snapshot.ranks.exobiologist, Some(CareerRank { level: 5, progress: Some(27) }));
        assert_eq!(snapshot.ranks.trade, Some(CareerRank { level: 4, progress: Some(81) }));
        assert_eq!(snapshot.ranks.combat, Some(CareerRank { level: 3, progress: Some(12) }));
    }

    #[test]
    fn reconstructs_the_latest_complete_journey_across_journal_files() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-journey-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        fs::write(
            directory.join("Journal.2026-08-13T120000.01.log"),
            concat!(
                "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n",
                "{\"timestamp\":\"2026-08-13T12:01:00Z\",\"event\":\"StartJump\",\"JumpType\":\"Hyperspace\",\"StarSystem\":\"Barnard's Star\"}\n",
            ),
        ).unwrap();
        fs::write(
            directory.join("Journal.2026-08-13T120100.02.log"),
            "{\"timestamp\":\"2026-08-13T12:01:17Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Barnard's Star\"}\n",
        ).unwrap();

        let journey = reconstruct_last_journey(&directory).unwrap();
        assert_eq!(journey.start_system, "Sol");
        assert_eq!(journey.destination_system, "Barnard's Star");
        assert_eq!(journey.duration_seconds, 17);
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn does_not_invent_a_journey_from_an_unpaired_jump() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-incomplete-journey-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        fs::write(
            directory.join("Journal.2026-08-13T120000.01.log"),
            concat!(
                "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n",
                "{\"timestamp\":\"2026-08-13T12:01:17Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Barnard's Star\"}\n",
            ),
        ).unwrap();

        assert_eq!(reconstruct_last_journey(&directory), None);
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn ignores_an_incomplete_last_journal_line_until_it_is_completed() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-growing-journey-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        let path = directory.join("Journal.2026-08-13T120000.01.log");
        fs::write(&path, concat!(
            "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n",
            "{\"timestamp\":\"2026-08-13T12:01:00Z\",\"event\":\"StartJump\",\"JumpType\":\"Hyperspace\",\"StarSystem\":\"Achenar\"}\n",
            "{\"timestamp\":\"2026-08-13T12:01:12Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Achenar\"}"
        )).unwrap();

        let first = build_journey_index(&directory, None);
        assert_eq!(first.parser.last_journey, None);
        fs::OpenOptions::new().append(true).open(&path).unwrap().write_all(b"\n").unwrap();
        let second = build_journey_index(&directory, Some(&first));
        assert_eq!(second.parser.last_journey.unwrap().destination_system, "Achenar");
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn incrementally_reads_only_appended_bytes_from_an_active_journal() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-active-journey-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        let path = directory.join("Journal.2026-08-13T120000.01.log");
        fs::write(&path, concat!(
            "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n",
            "{\"timestamp\":\"2026-08-13T12:01:00Z\",\"event\":\"StartJump\",\"JumpType\":\"Hyperspace\",\"StarSystem\":\"Achenar\"}\n"
        )).unwrap();
        let first = build_journey_index(&directory, None);
        let first_cursor = first.files[0].complete_bytes;
        fs::OpenOptions::new().append(true).open(&path).unwrap().write_all(
            b"{\"timestamp\":\"2026-08-13T12:01:12Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Achenar\"}\n"
        ).unwrap();
        let second = build_journey_index(&directory, Some(&first));
        assert!(second.files[0].complete_bytes > first_cursor);
        assert_eq!(second.parser.last_journey.unwrap().duration_seconds, 12);
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn handles_many_files_a_large_file_and_multiple_jumps() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-many-journeys-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        let filler = "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Music\"}\n".repeat(2_000);
        for number in 0..120 {
            fs::write(directory.join(format!("Journal.2026-08-12T12{number:04}.01.log")), &filler).unwrap();
        }
        fs::write(directory.join("Journal.2026-08-13T120000.01.log"), concat!(
            "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n",
            "{\"timestamp\":\"2026-08-13T12:01:00Z\",\"event\":\"StartJump\",\"JumpType\":\"Hyperspace\",\"StarSystem\":\"Achenar\"}\n",
            "{\"timestamp\":\"2026-08-13T12:01:12Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Achenar\"}\n",
            "{\"timestamp\":\"2026-08-13T12:02:00Z\",\"event\":\"StartJump\",\"JumpType\":\"Hyperspace\",\"StarSystem\":\"Alioth\"}\n",
            "{\"timestamp\":\"2026-08-13T12:02:19Z\",\"event\":\"FSDJump\",\"StarSystem\":\"Alioth\"}\n"
        )).unwrap();
        let started = Instant::now();
        let journey = reconstruct_last_journey(&directory).unwrap();
        assert_eq!(journey.start_system, "Achenar");
        assert_eq!(journey.destination_system, "Alioth");
        assert!(started.elapsed() < std::time::Duration::from_secs(5));
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn snapshot_returns_current_data_without_waiting_for_history() {
        let directory = std::env::temp_dir().join(format!(
            "ogg-fail-soft-snapshot-{}",
            SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_nanos()
        ));
        fs::create_dir_all(&directory).unwrap();
        let filler = "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"Music\"}\n".repeat(10_000);
        for number in 0..80 {
            fs::write(directory.join(format!("Journal.2026-08-12T12{number:04}.01.log")), &filler).unwrap();
        }
        let latest = directory.join("Journal.2026-08-13T120000.01.log");
        fs::write(&latest, concat!(
            "{\"timestamp\":\"2026-08-13T12:00:00Z\",\"event\":\"LoadGame\",\"Commander\":\"Test\",\"Ship\":\"Krait_MkII\",\"ShipName\":\"Test Ship\"}\n",
            "{\"timestamp\":\"2026-08-13T12:00:01Z\",\"event\":\"Rank\",\"Explore\":7}\n",
            "{\"timestamp\":\"2026-08-13T12:00:02Z\",\"event\":\"Location\",\"StarSystem\":\"Sol\"}\n"
        )).unwrap();
        let started = Instant::now();
        let snapshot = read_latest_snapshot(&latest, &directory, "de").unwrap();
        assert!(started.elapsed() < std::time::Duration::from_secs(2));
        assert_eq!(snapshot.commander.as_deref(), Some("Test"));
        assert_eq!(snapshot.ship.as_deref(), Some("Krait_MkII"));
        assert_eq!(snapshot.ranks.explore.as_ref().map(|rank| rank.level), Some(7));
        assert_eq!(snapshot.system.as_deref(), Some("Sol"));
        fs::remove_dir_all(directory).unwrap();
    }

    #[test]
    fn location_after_load_game_confirms_the_current_telemetry() {
        let snapshot = apply_events(&[
            serde_json::json!({ "event": "LoadGame", "Commander": "helitony" }),
            serde_json::json!({
                "event": "Location",
                "StarSystem": "HIP 49485",
                "SystemAddress": 908888937178u64,
                "Docked": false,
            }),
        ]);

        assert_eq!(snapshot.commander.as_deref(), Some("helitony"));
        assert_eq!(snapshot.system.as_deref(), Some("HIP 49485"));
        assert!(snapshot.current_telemetry_confirmed);
    }

    #[test]
    fn returns_to_normal_space_after_supercruise_exit() {
        let snapshot = apply_events(&[
            serde_json::json!({ "event": "SupercruiseEntry" }),
            serde_json::json!({ "event": "SupercruiseExit" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::NormalSpace));
        assert_eq!(snapshot.docked, Some(false));
    }

    #[test]
    fn preserves_supercruise_until_the_matching_exit_event_arrives() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "Location",
                "StarSystem": "HIP 49485",
                "SystemAddress": 908888937178u64,
                "Docked": false,
            }),
            serde_json::json!({ "event": "SupercruiseEntry" }),
            serde_json::json!({ "event": "Status" }),
            serde_json::json!({ "event": "Status" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::Supercruise));
        assert_eq!(snapshot.docked, Some(false));
    }

    #[test]
    fn supercruise_exit_remains_normal_space_through_following_status_events() {
        let snapshot = apply_events(&[
            serde_json::json!({ "event": "SupercruiseEntry" }),
            serde_json::json!({ "event": "SupercruiseExit" }),
            serde_json::json!({ "event": "Status" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::NormalSpace));
        assert_eq!(snapshot.docked, Some(false));
    }

    #[test]
    fn location_recovers_docked_state_and_station_name() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "Location",
            "Docked": true,
            "StationName": "Panopi City",
            "StationType": "Dodec",
            "StarSystem": "Antliae Sector MR-W b1-6"
        })]);

        assert_eq!(snapshot.system.as_deref(), Some("Antliae Sector MR-W b1-6"));
        assert_eq!(snapshot.ship_state, Some(ShipState::Docked));
        assert_eq!(snapshot.station_name.as_deref(), Some("Panopi City"));
    }

    #[test]
    fn startup_rebuild_keeps_the_last_confirmed_station_name_when_later_docked_events_omit_it() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "Location",
                "Docked": true,
                "StationName": "Panopi City",
                "StarSystem": "Antliae Sector MR-W b1-6"
            }),
            serde_json::json!({
                "event": "Docked",
                "StationType": "Dodec"
            }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::Docked));
        assert_eq!(snapshot.station_name.as_deref(), Some("Panopi City"));
    }

    #[test]
    fn location_without_docking_defaults_to_normal_space() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "Location",
            "Docked": false,
            "StarSystem": "Antliae Sector MR-W b1-6"
        })]);

        assert_eq!(snapshot.ship_state, Some(ShipState::NormalSpace));
        assert_eq!(snapshot.station_name, None);
        assert_eq!(snapshot.planet_name, None);
    }

    #[test]
    fn undocking_clears_the_previous_station_context() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "Docked",
                "StationName": "Panopi City"
            }),
            serde_json::json!({ "event": "Undocked" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::NormalSpace));
        assert_eq!(snapshot.docked, Some(false));
        assert_eq!(snapshot.station_name, None);
    }

    #[test]
    fn touchdown_marks_the_ship_as_landed_with_planet_context() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "Touchdown",
            "Body": "Antliae Sector MR-W b1-6 3"
        })]);

        assert_eq!(snapshot.ship_state, Some(ShipState::Landed));
        assert_eq!(snapshot.planet_name.as_deref(), Some("Antliae Sector MR-W b1-6 3"));
    }

    #[test]
    fn liftoff_clears_the_landed_state_and_planet_context() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "Touchdown",
                "Body": "Antliae Sector MR-W b1-6 3"
            }),
            serde_json::json!({ "event": "Liftoff" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::NormalSpace));
        assert_eq!(snapshot.docked, Some(false));
        assert_eq!(snapshot.planet_name, None);
    }

    #[test]
    fn stale_station_and_planet_context_do_not_survive_state_changes() {
        let snapshot = apply_events(&[
            serde_json::json!({
                "event": "Docked",
                "StationName": "Panopi City"
            }),
            serde_json::json!({ "event": "Undocked" }),
            serde_json::json!({
                "event": "Touchdown",
                "Body": "Antliae Sector MR-W b1-6 3"
            }),
            serde_json::json!({ "event": "SupercruiseEntry" }),
        ]);

        assert_eq!(snapshot.ship_state, Some(ShipState::Supercruise));
        assert_eq!(snapshot.station_name, None);
        assert_eq!(snapshot.planet_name, None);
    }

    #[test]
    fn loadout_max_jump_range_is_recorded_without_becoming_the_current_range() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "Loadout",
            "Ship": "KraitMkII",
            "ShipName": "Panopi Runner",
            "MaxJumpRange": 72.80,
            "UnladenMass": 412.5,
            "FuelCapacity": { "Main": 32.0, "Reserve": 1.0 },
            "CargoCapacity": 16
        })]);

        assert_eq!(snapshot.max_jump_range, Some(72.80));
        assert_eq!(snapshot.current_jump_range, None);
    }

    #[test]
    fn loadout_detects_a_wake_scanner_from_modules() {
        let snapshot = apply_events(&[serde_json::json!({
            "event": "Loadout",
            "Modules": [
                { "Item": "Int_WakeScanner_Size0" },
                { "Item": "Int_DetailedSurfaceScanner_Size1" }
            ]
        })]);

        assert!(snapshot.has_wake_scanner);
    }

    fn apply_landing_events(events: &[Value], has_wake_scanner: bool) -> LandingDiagState {
        let mut snapshot = EliteSnapshot {
            has_wake_scanner,
            ..EliteSnapshot::default()
        };
        let mut landing_state = LandingDiagState {
            armed: true,
            reminded: false,
            has_docking_permission: false,
            target_station_name: None,
            target_market_id: None,
        };
        let mut journal_systems = Vec::new();
        let mut current_system_address = None;
        let mut current_star_class = None;

        for event in events {
            let event_name = event
                .get("event")
                .and_then(Value::as_str)
                .unwrap_or_default();

            apply_snapshot_event(
                &mut snapshot,
                event,
                &mut journal_systems,
                &mut current_system_address,
                &mut current_star_class,
            );
            update_landing_state_for_event(&mut landing_state, event_name, event, &snapshot);
            let _ = evaluate_landing_reminder_for_event(&mut landing_state, event, &snapshot);
        }

        landing_state
    }

    #[test]
    fn supercruise_destination_drop_sets_landing_target_and_market_id() {
        let landing_state = apply_landing_events(&[serde_json::json!({
            "event": "SupercruiseDestinationDrop",
            "Type": "Celsius Reach",
            "MarketID": 4239284739u64,
        })], false);

        assert_eq!(landing_state.target_station_name.as_deref(), Some("Celsius Reach"));
        assert_eq!(landing_state.target_market_id, Some(4239284739u64));
        assert!(landing_state.armed);
        assert!(!landing_state.reminded);
    }

    #[test]
    fn reminder_does_not_trigger_on_drop_event_itself() {
        let mut snapshot = EliteSnapshot::default();
        let mut landing_state = LandingDiagState {
            armed: true,
            reminded: false,
            has_docking_permission: false,
            target_station_name: None,
            target_market_id: None,
        };
        let drop_event = serde_json::json!({
            "event": "SupercruiseDestinationDrop",
            "Type": "Celsius Reach",
            "MarketID": 4239284739u64,
        });
        apply_snapshot_event(
            &mut snapshot,
            &drop_event,
            &mut Vec::new(),
            &mut None,
            &mut None,
        );
        update_landing_state_for_event(
            &mut landing_state,
            "SupercruiseDestinationDrop",
            &drop_event,
            &snapshot,
        );

        let (triggered, reason, _) =
            evaluate_landing_reminder_for_event(&mut landing_state, &drop_event, &snapshot);
        assert!(!triggered);
        assert_eq!(reason, "distance_unknown");
    }

    #[test]
    fn reminder_works_with_and_without_supercruise_exit_confirmation() {
        let without_exit = apply_landing_events(
            &[
                serde_json::json!({
                    "event": "SupercruiseDestinationDrop",
                    "Type": "Celsius Reach",
                    "MarketID": 4239284739u64,
                }),
                serde_json::json!({
                    "event": "Status",
                    "DistanceKm": 3.8,
                }),
            ],
            false,
        );

        let with_exit = apply_landing_events(
            &[
                serde_json::json!({
                    "event": "SupercruiseDestinationDrop",
                    "Type": "Celsius Reach",
                    "MarketID": 4239284739u64,
                }),
                serde_json::json!({
                    "event": "SupercruiseExit",
                    "BodyType": "Station",
                    "Body": "Celsius Reach",
                }),
                serde_json::json!({
                    "event": "Status",
                    "DistanceKm": 3.8,
                }),
            ],
            false,
        );

        assert!(without_exit.reminded);
        assert!(with_exit.reminded);
    }

    #[test]
    fn docking_requested_or_granted_suppresses_reminder() {
        let after_requested = apply_landing_events(
            &[
                serde_json::json!({
                    "event": "SupercruiseDestinationDrop",
                    "Type": "Celsius Reach",
                    "MarketID": 4239284739u64,
                }),
                serde_json::json!({ "event": "DockingRequested" }),
                serde_json::json!({ "event": "Status", "DistanceKm": 3.8 }),
            ],
            false,
        );

        let after_granted = apply_landing_events(
            &[
                serde_json::json!({
                    "event": "SupercruiseDestinationDrop",
                    "Type": "Celsius Reach",
                    "MarketID": 4239284739u64,
                }),
                serde_json::json!({ "event": "DockingGranted" }),
                serde_json::json!({ "event": "Status", "DistanceKm": 3.8 }),
            ],
            false,
        );

        assert!(!after_requested.reminded);
        assert!(after_requested.has_docking_permission);
        assert!(!after_granted.reminded);
        assert!(after_granted.has_docking_permission);
    }

    #[test]
    fn reminder_is_spoken_at_most_once_per_station_approach() {
        let landing_state = apply_landing_events(
            &[
                serde_json::json!({
                    "event": "SupercruiseDestinationDrop",
                    "Type": "Celsius Reach",
                    "MarketID": 4239284739u64,
                }),
                serde_json::json!({ "event": "Status", "DistanceKm": 3.8 }),
                serde_json::json!({ "event": "Status", "DistanceKm": 3.7 }),
            ],
            false,
        );

        assert!(landing_state.reminded);
        assert!(!landing_state.armed);
    }
}

#[tauri::command]
fn get_elite_snapshot(locale: Option<String>) -> Result<EliteSnapshot, String> {
    let request_started = Instant::now();
    log_diagnostic("GET_SNAPSHOT_ENTER", json!({}));
    let _in_flight = JOURNAL_SNAPSHOT_REQUEST_LOCK
        .get_or_init(|| Mutex::new(()))
        .lock()
        .map_err(|error| format!("snapshot request lock poisoned: {error}"))?;

    let locale = locale.as_deref().unwrap_or("de");
    let journal_directory = find_journal_directory(locale)?;
    let search_started = Instant::now();
    log_diagnostic("JOURNAL_FILE_SEARCH_START", json!({}));
    let journal_file_count = journal_files(&journal_directory).len();
    let journal_path = newest_journal_file(&journal_directory, locale)?;
    log_diagnostic("JOURNAL_FILE_SEARCH_END", json!({
        "durationMs": search_started.elapsed().as_millis() as u64,
        "journalFileCount": journal_file_count,
    }));
    let journal_state = journal_cache_state(&journal_path).unwrap_or_else(|| JournalCacheState {
        path: journal_path.clone(),
        size_bytes: 0,
        modified_ms: 0,
    });

    let cache = JOURNAL_SNAPSHOT_CACHE.get_or_init(|| Mutex::new(None));
    if let Ok(cache_lock) = cache.lock() {
        if let Some(cached) = cache_lock.as_ref() {
            if !journal_changed(&cached.journal_state, &journal_state) {
                let mut snapshot: EliteSnapshot = serde_json::from_str(&cached.snapshot_json)
                    .map_err(|error| format!("snapshot cache is invalid: {error}"))?;
                let history_started = Instant::now();
                log_diagnostic("HISTORY_ANALYSIS_START", json!({ "cachedSnapshot": true }));
                snapshot.last_journey = cached_last_journey(
                    &journal_directory,
                    &journal_path,
                    journal_state.size_bytes,
                );
                log_diagnostic("HISTORY_ANALYSIS_END", json!({
                    "durationMs": history_started.elapsed().as_millis() as u64,
                    "available": snapshot.last_journey.is_some(),
                }));
                let snapshot = with_elite_connection_state(
                    snapshot,
                    is_elite_dangerous_running(),
                );
                log_diagnostic("SNAPSHOT_FINALIZED", json!({ "cachedSnapshot": true }));
                log_diagnostic("GET_SNAPSHOT_RETURN", json!({
                    "durationMs": request_started.elapsed().as_millis() as u64,
                }));
                return Ok(snapshot);
            }
        }
    }

    let current_started = Instant::now();
    log_diagnostic("RANK_SHIP_ANALYSIS_START", json!({}));
    let snapshot = read_latest_snapshot(&journal_path, &journal_directory, locale)?;
    log_diagnostic("RANK_SHIP_ANALYSIS_END", json!({
        "durationMs": current_started.elapsed().as_millis() as u64,
    }));
    let commander_key = (journal_path.clone(), snapshot.commander.clone());
    let last_logged = LAST_LOGGED_COMMANDER.get_or_init(|| Mutex::new(None));
    if let Ok(mut previous) = last_logged.lock() {
        if previous.as_ref() != Some(&commander_key) {
            let commander = snapshot.commander.as_deref().unwrap_or("<not-found>");
            log::info!(
                "version={} phase=journal process=app.exe event=commander_read technical=path={} commander={}",
                env!("CARGO_PKG_VERSION"),
                journal_path.display(),
                serde_json::to_string(commander).unwrap_or_else(|_| "\"<invalid>\"".into()),
            );
            *previous = Some(commander_key);
        }
    }
    let snapshot_json = serde_json::to_string(&snapshot)
        .map_err(|error| format!("snapshot serialization failed: {error}"))?;

    if let Ok(mut cache_lock) = cache.lock() {
        *cache_lock = Some(JournalSnapshotCacheEntry {
            journal_state: journal_state.clone(),
            snapshot_json,
        });
    }

    let snapshot = with_elite_connection_state(
        snapshot,
        is_elite_dangerous_running(),
    );
    log_diagnostic("SNAPSHOT_FINALIZED", json!({ "cachedSnapshot": false }));
    log_diagnostic("GET_SNAPSHOT_RETURN", json!({
        "durationMs": request_started.elapsed().as_millis() as u64,
    }));
    Ok(snapshot)
}

#[tauri::command]
fn get_live_anna_journal_events(locale: Option<String>) -> Result<Vec<Value>, String> {
    let locale = locale.as_deref().unwrap_or("de");
    let directory = find_journal_directory(locale)?;
    let path = newest_journal_file(&directory, locale)?;
    let file = File::open(&path).map_err(|error| error.to_string())?;
    let lines = BufReader::new(file).lines().collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    let cursor = ANNA_LIVE_JOURNAL_CURSOR.get_or_init(|| Mutex::new(None));
    let mut cursor = cursor.lock().map_err(|error| error.to_string())?;

    let Some(previous) = cursor.as_ref() else {
        *cursor = Some(AnnaLiveJournalCursor { path, line_number: lines.len() });
        return Ok(Vec::new());
    };
    let start = if previous.path == path { previous.line_number.min(lines.len()) } else { 0 };
    let events = lines[start..]
        .iter()
        .filter_map(|line| serde_json::from_str::<Value>(line).ok())
        .filter_map(anna_live_event_payload)
        .collect();
    *cursor = Some(AnnaLiveJournalCursor { path, line_number: lines.len() });
    Ok(events)
}

#[tauri::command]
fn get_live_core_journal_events(locale: Option<String>) -> Result<Vec<Value>, String> {
    let locale = locale.as_deref().unwrap_or("de");
    let directory = find_journal_directory(locale)?;
    let path = newest_journal_file(&directory, locale)?;
    let file = File::open(&path).map_err(|error| error.to_string())?;
    let lines = BufReader::new(file).lines().collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    let cursor = CORE_SHADOW_JOURNAL_CURSOR.get_or_init(|| Mutex::new(None));
    let mut cursor = cursor.lock().map_err(|error| error.to_string())?;
    let start = cursor.as_ref()
        .filter(|previous| previous.path == path)
        .map(|previous| previous.line_number.min(lines.len()))
        .unwrap_or(0);
    let events = lines[start..]
        .iter()
        .filter_map(|line| serde_json::from_str::<Value>(line).ok())
        .filter(|event| matches!(
            event.get("event").and_then(Value::as_str),
            Some("Commander" | "LoadGame" | "Loadout" | "FSDJump" | "CarrierJump" | "FSSDiscoveryScan" | "FSSBodySignals" | "SAASignalsFound" | "Scan" | "SupercruiseEntry" | "SupercruiseExit" | "Docked" | "Undocked" | "Touchdown" | "Liftoff" | "Location")
        ))
        .collect();
    *cursor = Some(AnnaLiveJournalCursor { path, line_number: lines.len() });
    Ok(events)
}

fn anna_live_event_payload(event: Value) -> Option<Value> {
    let name = event.get("event")?.as_str()?;
    if !matches!(name, "Commander" | "LoadGame" | "Location" | "FSDJump" | "Scan" | "FSSBodySignals" | "SAASignalsFound" | "ScanOrganic") {
        return None;
    }
    Some(json!({
        "event": name,
        "commander": event.get("Commander").and_then(Value::as_str),
        "name": event.get("Name").and_then(Value::as_str),
        "systemAddress": event.get("SystemAddress"),
        "bodyId": event.get("BodyID").and_then(Value::as_u64),
        "body": event.get("Body").and_then(Value::as_u64),
        "bodyName": event.get("BodyName").and_then(Value::as_str),
        "planetClass": event.get("PlanetClass").and_then(Value::as_str),
        "atmosphere": event.get("Atmosphere").and_then(Value::as_str).or_else(|| event.get("AtmosphereType").and_then(Value::as_str)),
        "surfaceTemperature": event.get("SurfaceTemperature").and_then(Value::as_f64),
        "surfaceGravity": event.get("SurfaceGravity").and_then(Value::as_f64),
        "surfacePressure": event.get("SurfacePressure").and_then(Value::as_f64),
        "volcanism": event.get("Volcanism").and_then(Value::as_str),
        "biologicalSignalCount": event_biological_signal_count(&event),
        "species": event.get("Species").and_then(Value::as_str),
        "variant": event.get("Variant").and_then(Value::as_str),
    }))
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
        .plugin(
            tauri_plugin_window_state::Builder::new()
                .with_state_flags(persisted_window_state_flags())
                .build(),
        )
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            let app_id_task_started = std::time::Instant::now();
            let app_id = app.config().identifier.clone();
            log_diagnostic(
                "WINDOW_MAIN_THREAD_TASK_START",
                json!({
                    "task": "set_process_app_user_model_id",
                    "appUserModelId": app_id,
                    "thread": thread_payload(),
                }),
            );
            if let Err(error) = set_process_app_user_model_id(&app_id) {
                log_diagnostic(
                    "WINDOW_MAIN_THREAD_TASK_END",
                    json!({
                        "task": "set_process_app_user_model_id",
                        "durationMs": app_id_task_started.elapsed().as_millis() as u64,
                        "error": error,
                        "thread": thread_payload(),
                    }),
                );
                log::error!(
                    "version={} phase=window_identity process=app.exe cause=app_user_model_id_failed technical={}",
                    env!("CARGO_PKG_VERSION"),
                    error
                );
            } else {
                log_diagnostic(
                    "WINDOW_MAIN_THREAD_TASK_END",
                    json!({
                        "task": "set_process_app_user_model_id",
                        "durationMs": app_id_task_started.elapsed().as_millis() as u64,
                        "thread": thread_payload(),
                    }),
                );
            }

            let diagnostics_directory = app.path().app_local_data_dir()?.join("diagnostics");
            if let Ok(logger) = diagnostics::DiagnosticLogger::initialize(
                diagnostics::DiagnosticConfig::default_in(diagnostics_directory.clone()),
            ) {
                let session = logger.session().to_string();
                logger.install_global();
                log_diagnostic(
                    "DIAGNOSTICS_SESSION_STARTED",
                    json!({
                        "session": session,
                        "directory": diagnostics_directory,
                        "version": env!("CARGO_PKG_VERSION"),
                    }),
                );
            } else {
                log::error!(
                    "version={} phase=diagnostics_init process=app.exe cause=failed",
                    env!("CARGO_PKG_VERSION")
                );
            }

            app.manage(LocalSpeechState::default());
            app.manage(StartupStatus(Mutex::new(StartupHealth::ready())));
            app.manage(FrontendHeartbeat {
                ready: AtomicBool::new(false),
                last_seen_ms: std::sync::atomic::AtomicU64::new(unix_time_ms()),
                last_logged_ms: std::sync::atomic::AtomicU64::new(0),
                stall_reported: AtomicBool::new(false),
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

            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "windows")]
                {
                    match window.hwnd() {
                        Ok(hwnd) => {
                            let main_hwnd = hwnd.0 as HWND;
                            log_window_hwnd_identity(main_hwnd);
                            if let Err(error) = install_main_window_activation_probe(main_hwnd) {
                                log_diagnostic(
                                    "WINDOW_NATIVE_HOOK_INSTALL_FAILED",
                                    json!({
                                        "error": error,
                                        "thread": thread_payload(),
                                    }),
                                );
                            }
                        }
                        Err(error) => {
                            log_diagnostic(
                                "WINDOW_HWND_IDENTITY_UNAVAILABLE",
                                json!({
                                    "error": error.to_string(),
                                    "thread": thread_payload(),
                                }),
                            );
                        }
                    }
                }

                let tracked_window = window.clone();
                window.on_window_event(move |event| {
                    let event_name = match event {
                        tauri::WindowEvent::CloseRequested { .. } => "CloseRequested",
                        tauri::WindowEvent::Destroyed => "Destroyed",
                        tauri::WindowEvent::Focused(_) => "Focused",
                        tauri::WindowEvent::Moved(_) => "Moved",
                        tauri::WindowEvent::Resized(_) => "Resized",
                        tauri::WindowEvent::ScaleFactorChanged { .. } => "ScaleFactorChanged",
                        tauri::WindowEvent::ThemeChanged(_) => "ThemeChanged",
                        _ => "Other",
                    };

                    log_diagnostic(
                        "WINDOW_EVENT_RECEIVED",
                        window_payload(&tracked_window, json!({ "event": event_name })),
                    );

                    if let tauri::WindowEvent::Focused(focused) = event {
                        log_diagnostic(
                            "WINDOW_FOCUS_CHANGED",
                            window_payload(
                                &tracked_window,
                                json!({
                                    "event": event_name,
                                    "focused": focused,
                                }),
                            ),
                        );
                    }

                    let current = window_snapshot(&tracked_window);
                    let tracker = LAST_WINDOW_STATE.get_or_init(|| Mutex::new(HashMap::new()));
                    if let Ok(mut state) = tracker.lock() {
                        let label = tracked_window.label().to_string();
                        let previous = state.get(&label).copied().unwrap_or_default();
                        if previous.visible != current.visible
                            || previous.minimized != current.minimized
                            || previous.maximized != current.maximized
                        {
                            log_diagnostic(
                                "WINDOW_VISIBILITY_CHANGED",
                                window_payload(
                                    &tracked_window,
                                    json!({
                                        "event": event_name,
                                        "previous": {
                                            "visible": previous.visible,
                                            "minimized": previous.minimized,
                                            "maximized": previous.maximized,
                                        },
                                    }),
                                ),
                            );
                        }
                        state.insert(label, current);
                    }

                    if matches!(event, tauri::WindowEvent::CloseRequested { .. }) {
                        log_diagnostic(
                            "WINDOW_CLOSE_REQUESTED",
                            window_payload(&tracked_window, json!({ "event": event_name })),
                        );
                        log::info!("version={} phase=window_close process=app.exe cause=user_requested", env!("CARGO_PKG_VERSION"));
                    }
                });
            }

            let watchdog_app = app.handle().clone();
            std::thread::spawn(move || {
                loop {
                    std::thread::sleep(std::time::Duration::from_secs(3));
                    let heartbeat = watchdog_app.state::<FrontendHeartbeat>();
                    if heartbeat.ready.load(Ordering::Relaxed)
                        && unix_time_ms().saturating_sub(heartbeat.last_seen_ms.load(Ordering::Relaxed)) > 12_000
                    {
                        if !heartbeat.stall_reported.swap(true, Ordering::Relaxed) {
                            log_diagnostic(
                                "FRONTEND_STALL_DETECTED",
                                json!({
                                    "lastSeenMs": heartbeat.last_seen_ms.load(Ordering::Relaxed),
                                    "nowMs": unix_time_ms(),
                                    "timeoutMs": 12_000,
                                }),
                            );
                        }
                        log::error!("version={} phase=frontend_watchdog process=msedgewebview2.exe cause=heartbeat_timeout technical=automatic_restart", env!("CARGO_PKG_VERSION"));
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
            updater_distribution,
            prepare_for_update,
            repair_runtime,
            open_log_directory,
            open_journal_directory,
            get_live_anna_journal_events,
            get_live_core_journal_events,
            list_local_voices,
            speak_local,
            stop_local_speech,
            log_diagnostic_event
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app, event| {
            match event {
                tauri::RunEvent::ExitRequested { .. } => {
                    if let Some(window) = app.get_webview_window("main") {
                        log_diagnostic(
                            "WINDOW_CLOSE_COMPLETED",
                            window_payload(&window, json!({ "event": "ExitRequested" })),
                        );
                    }
                    log::info!("version={} phase=exit_requested process=app.exe cause=application_exit", env!("CARGO_PKG_VERSION"));
                }
                tauri::RunEvent::Exit => {
                    if let Some(window) = app.get_webview_window("main") {
                        log_diagnostic(
                            "WINDOW_CLOSE_COMPLETED",
                            window_payload(&window, json!({ "event": "Exit" })),
                        );
                    }
                    log::info!("version={} phase=exit process=app.exe cause=application_exit", env!("CARGO_PKG_VERSION"));
                }
                _ => {}
            }
        });
}
