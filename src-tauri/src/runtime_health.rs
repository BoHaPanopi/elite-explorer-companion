use serde::Serialize;
use std::{
    fs::{self, OpenOptions},
    path::Path,
    process::{Command, Output},
    thread,
    time::{Duration, Instant},
};

#[cfg(target_os = "windows")]
use std::os::windows::{fs::OpenOptionsExt, process::CommandExt};

#[cfg(target_os = "windows")]
use windows_sys::Win32::{
    Foundation::{CloseHandle, INVALID_HANDLE_VALUE},
    System::{
        Diagnostics::ToolHelp::{
            CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
            TH32CS_SNAPPROCESS,
        },
        Threading::{OpenProcess, TerminateProcess, PROCESS_TERMINATE},
    },
};

const CREATE_NO_WINDOW: u32 = 0x0800_0000;
pub const VOICE_PROCESS: &str = "ogg-voice-server.exe";
pub const VOICE_BUNDLE_BINARY: &str = "ogg-voice-server-x86_64-pc-windows-msvc.exe";

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartupHealth {
    pub ready: bool,
    pub phase: String,
    pub process_name: String,
    pub version: String,
    pub reason: Option<String>,
}

impl StartupHealth {
    pub fn starting() -> Self {
        Self {
            ready: true,
            phase: "starting".into(),
            process_name: "app.exe".into(),
            version: env!("CARGO_PKG_VERSION").into(),
            reason: None,
        }
    }

    pub fn degraded(reason: impl Into<String>) -> Self {
        Self {
            ready: false,
            phase: "background_service".into(),
            process_name: VOICE_PROCESS.into(),
            version: env!("CARGO_PKG_VERSION").into(),
            reason: Some(reason.into()),
        }
    }
}

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum UpdateBlocker {
    VoiceServerRunning,
    VoiceServerLocked,
    AnotherOggInstance,
    InstallerRunning,
    VoiceServerMissing,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateReadiness {
    pub ready: bool,
    pub blocker: Option<UpdateBlocker>,
}

pub fn hidden_output(program: &str, args: &[&str]) -> std::io::Result<Output> {
    let mut command = Command::new(program);
    command.args(args);
    #[cfg(target_os = "windows")]
    command.creation_flags(CREATE_NO_WINDOW);
    command.output()
}

pub fn process_names() -> Vec<String> {
    process_entries()
        .into_iter()
        .map(|(_, name)| name)
        .collect()
}

pub fn process_count(name: &str) -> usize {
    process_names()
        .iter()
        .filter(|process| process.eq_ignore_ascii_case(name))
        .count()
}

pub fn process_running(name: &str) -> bool {
    process_count(name) > 0
}

pub fn terminate_voice_servers() {
    for (pid, name) in process_entries() {
        if name.eq_ignore_ascii_case(VOICE_PROCESS) {
            #[cfg(target_os = "windows")]
            unsafe {
                let process = OpenProcess(PROCESS_TERMINATE, 0, pid);
                if !process.is_null() {
                    TerminateProcess(process, 1);
                    CloseHandle(process);
                }
            }
        }
    }
}

#[cfg(target_os = "windows")]
fn process_entries() -> Vec<(u32, String)> {
    unsafe {
        let snapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
        if snapshot == INVALID_HANDLE_VALUE {
            return Vec::new();
        }

        let mut entry: PROCESSENTRY32W = std::mem::zeroed();
        entry.dwSize = std::mem::size_of::<PROCESSENTRY32W>() as u32;
        let mut processes = Vec::new();
        let mut has_entry = Process32FirstW(snapshot, &mut entry) != 0;
        while has_entry {
            let length = entry
                .szExeFile
                .iter()
                .position(|character| *character == 0)
                .unwrap_or(entry.szExeFile.len());
            processes.push((
                entry.th32ProcessID,
                String::from_utf16_lossy(&entry.szExeFile[..length]),
            ));
            has_entry = Process32NextW(snapshot, &mut entry) != 0;
        }
        CloseHandle(snapshot);
        processes
    }
}

#[cfg(not(target_os = "windows"))]
fn process_entries() -> Vec<(u32, String)> {
    Vec::new()
}

pub fn wait_for_voice_servers(timeout: Duration) -> bool {
    let deadline = Instant::now() + timeout;
    while process_running(VOICE_PROCESS) {
        if Instant::now() >= deadline {
            return false;
        }
        thread::sleep(Duration::from_millis(100));
    }
    true
}

pub fn exclusive_file_access(path: &Path) -> bool {
    if !path.is_file() {
        return false;
    }

    let mut options = OpenOptions::new();
    options.read(true).write(true);
    #[cfg(target_os = "windows")]
    options.share_mode(0);
    options.open(path).is_ok()
}

pub fn valid_windows_x64_executable(path: &Path) -> bool {
    let bytes = match fs::read(path) {
        Ok(bytes) => bytes,
        Err(_) => return false,
    };
    if bytes.len() < 0x40 || &bytes[..2] != b"MZ" {
        return false;
    }

    let pe_offset = u32::from_le_bytes(bytes[0x3c..0x40].try_into().unwrap()) as usize;
    bytes.get(pe_offset..pe_offset + 6).is_some_and(|header| {
        &header[..4] == b"PE\0\0" && u16::from_le_bytes([header[4], header[5]]) == 0x8664
    })
}

pub fn update_readiness(sidecar_path: &Path) -> UpdateReadiness {
    let processes = process_names();
    let count = |name: &str| {
        processes
            .iter()
            .filter(|process| process.eq_ignore_ascii_case(name))
            .count()
    };

    if count(VOICE_PROCESS) > 0 {
        return blocked(UpdateBlocker::VoiceServerRunning);
    }
    if count("app.exe") > 1 {
        return blocked(UpdateBlocker::AnotherOggInstance);
    }
    if processes.iter().any(|name| {
        let name = name.to_ascii_lowercase();
        name == "msiexec.exe" || (name.contains("old.guy.of.grumpy") && name.contains("setup"))
    }) {
        return blocked(UpdateBlocker::InstallerRunning);
    }
    if !sidecar_path.is_file() {
        return blocked(UpdateBlocker::VoiceServerMissing);
    }
    if !exclusive_file_access(sidecar_path) {
        return blocked(UpdateBlocker::VoiceServerLocked);
    }

    UpdateReadiness {
        ready: true,
        blocker: None,
    }
}

fn blocked(blocker: UpdateBlocker) -> UpdateReadiness {
    UpdateReadiness {
        ready: false,
        blocker: Some(blocker),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::{fs, sync::Mutex};

    static FILE_TEST: Mutex<()> = Mutex::new(());

    #[test]
    fn detects_missing_sidecar_file() {
        let _guard = FILE_TEST.lock().unwrap();
        let path = std::env::temp_dir().join("ogg-missing-sidecar-test.exe");
        let _ = fs::remove_file(&path);
        assert!(!exclusive_file_access(&path));
    }

    #[test]
    fn accepts_an_exclusively_accessible_sidecar_fixture() {
        let _guard = FILE_TEST.lock().unwrap();
        let path = std::env::temp_dir().join("ogg-sidecar-access-test.exe");
        fs::write(&path, b"fixture").unwrap();
        assert!(exclusive_file_access(&path));
        fs::remove_file(path).unwrap();
    }

    #[test]
    fn rejects_a_non_executable_sidecar_fixture() {
        let _guard = FILE_TEST.lock().unwrap();
        let path = std::env::temp_dir().join("ogg-invalid-sidecar-test.exe");
        fs::write(&path, b"not an executable").unwrap();
        assert!(!valid_windows_x64_executable(&path));
        fs::remove_file(path).unwrap();
    }

    #[cfg(target_os = "windows")]
    #[test]
    fn detects_a_sidecar_fixture_locked_by_another_handle() {
        let _guard = FILE_TEST.lock().unwrap();
        let path = std::env::temp_dir().join("ogg-sidecar-lock-test.exe");
        fs::write(&path, b"fixture").unwrap();

        let mut options = OpenOptions::new();
        options.read(true).write(true).share_mode(0);
        let lock = options.open(&path).unwrap();
        assert!(!exclusive_file_access(&path));

        drop(lock);
        fs::remove_file(path).unwrap();
    }
}
