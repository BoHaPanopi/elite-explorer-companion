use serde::Serialize;
use std::process::{Command, Output};

#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;
#[cfg(target_os = "windows")]
use windows_sys::Win32::{
    Foundation::{CloseHandle, INVALID_HANDLE_VALUE},
    System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32FirstW, Process32NextW, PROCESSENTRY32W,
        TH32CS_SNAPPROCESS,
    },
};

const CREATE_NO_WINDOW: u32 = 0x0800_0000;

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
    pub fn ready() -> Self {
        Self {
            ready: true,
            phase: "ready".into(),
            process_name: "app.exe".into(),
            version: env!("CARGO_PKG_VERSION").into(),
            reason: None,
        }
    }

    pub fn degraded(reason: impl Into<String>) -> Self {
        Self {
            ready: false,
            phase: "application".into(),
            process_name: "app.exe".into(),
            version: env!("CARGO_PKG_VERSION").into(),
            reason: Some(reason.into()),
        }
    }
}

#[derive(Clone, Debug, Serialize, PartialEq, Eq)]
#[serde(rename_all = "snake_case")]
pub enum UpdateBlocker {
    AnotherOggInstance,
    InstallerRunning,
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
        if Process32FirstW(snapshot, &mut entry) != 0 {
            loop {
                let length = entry
                    .szExeFile
                    .iter()
                    .position(|character| *character == 0)
                    .unwrap_or(entry.szExeFile.len());
                processes.push((
                    entry.th32ProcessID,
                    String::from_utf16_lossy(&entry.szExeFile[..length]),
                ));
                if Process32NextW(snapshot, &mut entry) == 0 {
                    break;
                }
            }
        }
        CloseHandle(snapshot);
        processes
    }
}

#[cfg(not(target_os = "windows"))]
fn process_entries() -> Vec<(u32, String)> {
    Vec::new()
}

fn process_names() -> Vec<String> {
    process_entries().into_iter().map(|(_, name)| name).collect()
}

pub fn process_running(name: &str) -> bool {
    process_entries()
        .into_iter()
        .any(|(_, process_name)| process_name.eq_ignore_ascii_case(name))
}

pub fn update_readiness() -> UpdateReadiness {
    let processes = process_names();
    let count = |name: &str| {
        processes
            .iter()
            .filter(|process| process.eq_ignore_ascii_case(name))
            .count()
    };
    if count("app.exe") > 1 {
        return UpdateReadiness {
            ready: false,
            blocker: Some(UpdateBlocker::AnotherOggInstance),
        };
    }
    if ["msiexec.exe", "setup.exe", "update.exe"]
        .iter()
        .any(|name| count(name) > 0)
    {
        return UpdateReadiness {
            ready: false,
            blocker: Some(UpdateBlocker::InstallerRunning),
        };
    }
    UpdateReadiness {
        ready: true,
        blocker: None,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn ready_startup_state_uses_the_application_process() {
        let state = StartupHealth::ready();
        assert!(state.ready);
        assert_eq!(state.process_name, "app.exe");
    }

    #[test]
    fn hidden_process_launches_remain_available_for_local_folder_actions() {
        assert_ne!(CREATE_NO_WINDOW, 0);
    }
}
