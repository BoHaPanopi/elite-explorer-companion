use serde_json::{json, Value};
use std::{
    fs::{self, File, OpenOptions},
    io::{BufWriter, Write},
    path::PathBuf,
    sync::{
        atomic::{AtomicU64, Ordering},
        mpsc::{sync_channel, Receiver, SyncSender, TrySendError},
        Arc, OnceLock,
    },
    thread,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

const CHANNEL_CAPACITY: usize = 4096;
const DEFAULT_MAX_FILE_SIZE_BYTES: u64 = 2_000_000;
const DEFAULT_MAX_FILE_COUNT: usize = 16;
const FLUSH_EVERY_LINES: u64 = 32;
const FLUSH_INTERVAL: Duration = Duration::from_millis(1_500);
const BASE_FILE_NAME: &str = "ogg-diagnostics";

#[derive(Clone)]
pub struct DiagnosticLogger {
    sender: SyncSender<String>,
    session_id: String,
    directory: PathBuf,
    dropped: Arc<AtomicU64>,
}

pub struct DiagnosticConfig {
    pub directory: PathBuf,
    pub max_file_size_bytes: u64,
    pub max_file_count: usize,
}

impl DiagnosticConfig {
    pub fn default_in(directory: PathBuf) -> Self {
        Self {
            directory,
            max_file_size_bytes: DEFAULT_MAX_FILE_SIZE_BYTES,
            max_file_count: DEFAULT_MAX_FILE_COUNT,
        }
    }
}

static LOGGER: OnceLock<DiagnosticLogger> = OnceLock::new();

fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_millis() as u64)
        .unwrap_or_default()
}

fn session_id() -> String {
    format!("{}-{}", now_ms(), std::process::id())
}

fn session_file_path(directory: &PathBuf, id: &str, part: usize) -> PathBuf {
    if part == 0 {
        return directory.join(format!("{BASE_FILE_NAME}-{id}.log"));
    }
    directory.join(format!("{BASE_FILE_NAME}-{id}-part-{part:03}.log"))
}

fn append_line(path: &PathBuf, line: &str) -> std::io::Result<u64> {
    let file = OpenOptions::new().create(true).append(true).open(path)?;
    let mut writer = BufWriter::new(file);
    writer.write_all(line.as_bytes())?;
    writer.write_all(b"\n")?;
    writer.flush()?;
    Ok((line.len() + 1) as u64)
}

fn prune(directory: &PathBuf, max_file_count: usize) {
    let mut candidates = match fs::read_dir(directory) {
        Ok(entries) => entries
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| {
                path.file_name()
                    .and_then(|name| name.to_str())
                    .is_some_and(|name| {
                        name.starts_with(BASE_FILE_NAME) && name.ends_with(".log")
                    })
            })
            .collect::<Vec<_>>(),
        Err(_) => return,
    };

    if candidates.len() <= max_file_count {
        return;
    }

    candidates.sort_by_key(|path| {
        fs::metadata(path)
            .and_then(|metadata| metadata.modified())
            .ok()
            .unwrap_or(UNIX_EPOCH)
    });

    let remove_count = candidates.len().saturating_sub(max_file_count);
    for path in candidates.into_iter().take(remove_count) {
        let _ = fs::remove_file(path);
    }
}

fn ensure_directory(directory: &PathBuf) -> Result<(), String> {
    fs::create_dir_all(directory).map_err(|error| error.to_string())
}

fn open_writer(path: &PathBuf) -> std::io::Result<(BufWriter<File>, u64)> {
    let file = OpenOptions::new().create(true).append(true).open(path)?;
    let bytes = file.metadata().map(|metadata| metadata.len()).unwrap_or(0);
    Ok((BufWriter::new(file), bytes))
}

fn write_internal_event(
    writer: &mut BufWriter<File>,
    session: &str,
    kind: &str,
    payload: Value,
) -> std::io::Result<u64> {
    let line = serde_json::to_string(&json!({
        "tsMs": now_ms(),
        "session": session,
        "kind": kind,
        "payload": payload,
    }))
    .unwrap_or_else(|_| {
        format!(
            "{{\"tsMs\":{},\"session\":\"{}\",\"kind\":\"{}\",\"payload\":{{\"fallback\":true}}}}",
            now_ms(),
            session,
            kind
        )
    });
    writer.write_all(line.as_bytes())?;
    writer.write_all(b"\n")?;
    Ok((line.len() + 1) as u64)
}

fn run_writer(
    receiver: Receiver<String>,
    directory: PathBuf,
    session: String,
    max_file_size_bytes: u64,
    max_file_count: usize,
    dropped: Arc<AtomicU64>,
) {
    if ensure_directory(&directory).is_err() {
        return;
    }

    let mut part = 0_usize;
    let mut path = session_file_path(&directory, &session, part);
    let mut opened = open_writer(&path).ok();
    let mut pending_lines = 0_u64;
    let mut last_flush = Instant::now();

    loop {
        let message = match receiver.recv_timeout(Duration::from_millis(500)) {
            Ok(message) => Some(message),
            Err(std::sync::mpsc::RecvTimeoutError::Timeout) => None,
            Err(std::sync::mpsc::RecvTimeoutError::Disconnected) => break,
        };

        let dropped_count = dropped.swap(0, Ordering::Relaxed);

        if let Some((writer, bytes_written)) = opened.as_mut() {
            if dropped_count > 0 {
                if let Ok(written) = write_internal_event(
                    writer,
                    &session,
                    "LOGGER_DROP",
                    json!({ "droppedCount": dropped_count }),
                ) {
                    *bytes_written = bytes_written.saturating_add(written);
                    pending_lines = pending_lines.saturating_add(1);
                }
            }
        }

        if let Some(line) = message {
            let expected = (line.len() + 1) as u64;

            if let Some((_, bytes_written)) = opened.as_ref() {
                if bytes_written.saturating_add(expected) > max_file_size_bytes {
                    if let Some((mut writer, _)) = opened.take() {
                        let _ = writer.flush();
                    }
                    part = part.saturating_add(1);
                    path = session_file_path(&directory, &session, part);
                    opened = open_writer(&path).ok();
                    prune(&directory, max_file_count);
                }
            }

            if opened.is_none() {
                opened = open_writer(&path).ok();
            }

            if let Some((writer, bytes_written)) = opened.as_mut() {
                if writer.write_all(line.as_bytes()).is_ok() && writer.write_all(b"\n").is_ok() {
                    *bytes_written = bytes_written.saturating_add(expected);
                    pending_lines = pending_lines.saturating_add(1);
                } else {
                    let _ = append_line(
                        &path,
                        &serde_json::to_string(&json!({
                            "tsMs": now_ms(),
                            "session": session,
                            "kind": "LOGGER_ERROR",
                            "payload": {"reason": "write_failed"}
                        }))
                        .unwrap_or_else(|_| "{}".into()),
                    );
                    opened = None;
                }
            }
        }

        if let Some((writer, _)) = opened.as_mut() {
            if pending_lines >= FLUSH_EVERY_LINES || last_flush.elapsed() >= FLUSH_INTERVAL {
                let _ = writer.flush();
                pending_lines = 0;
                last_flush = Instant::now();
            }
        }
    }

    if let Some((mut writer, _)) = opened {
        let _ = writer.flush();
    }
}

impl DiagnosticLogger {
    pub fn initialize(config: DiagnosticConfig) -> Result<Self, String> {
        ensure_directory(&config.directory)?;

        let session = session_id();
        let (sender, receiver) = sync_channel(CHANNEL_CAPACITY);
        let dropped = Arc::new(AtomicU64::new(0));

        let logger = Self {
            sender,
            session_id: session.clone(),
            directory: config.directory.clone(),
            dropped: dropped.clone(),
        };

        thread::Builder::new()
            .name("ogg-diagnostics-writer".into())
            .spawn(move || {
                run_writer(
                    receiver,
                    config.directory,
                    session,
                    config.max_file_size_bytes,
                    config.max_file_count,
                    dropped,
                )
            })
            .map_err(|error| error.to_string())?;

        Ok(logger)
    }

    pub fn install_global(self) {
        let _ = LOGGER.set(self);
    }

    pub fn session(&self) -> &str {
        &self.session_id
    }

    pub fn directory(&self) -> &PathBuf {
        &self.directory
    }

    pub fn log(&self, kind: &str, payload: Value) {
        let line = serde_json::to_string(&json!({
            "tsMs": now_ms(),
            "session": self.session_id,
            "kind": kind,
            "payload": payload,
        }));

        let Ok(line) = line else {
            return;
        };

        if let Err(error) = self.sender.try_send(line) {
            if matches!(error, TrySendError::Full(_)) {
                self.dropped.fetch_add(1, Ordering::Relaxed);
            }
        }
    }
}

pub fn with_logger<F: FnOnce(&DiagnosticLogger)>(action: F) {
    if let Some(logger) = LOGGER.get() {
        action(logger);
    }
}

pub fn log(kind: &str, payload: Value) {
    with_logger(|logger| logger.log(kind, payload));
}

pub fn global_metadata() -> Option<(PathBuf, String)> {
    LOGGER
        .get()
        .map(|logger| (logger.directory().clone(), logger.session().to_string()))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn unique_test_dir(name: &str) -> PathBuf {
        let mut path = std::env::temp_dir();
        path.push(format!("ogg-diagnostics-test-{name}-{}", now_ms()));
        path
    }

    #[test]
    fn rotates_when_max_size_is_reached() {
        let directory = unique_test_dir("rotation");
        let logger = DiagnosticLogger::initialize(DiagnosticConfig {
            directory: directory.clone(),
            max_file_size_bytes: 400,
            max_file_count: 16,
        })
        .expect("logger should initialize");

        for _ in 0..40 {
            logger.log(
                "TEST_EVENT",
                json!({"text": "abcdefghijklmnopqrstuvwxyz0123456789"}),
            );
        }

        std::thread::sleep(Duration::from_millis(400));

        let files = fs::read_dir(&directory)
            .expect("read diagnostics directory")
            .filter_map(Result::ok)
            .map(|entry| entry.path())
            .filter(|path| {
                path.file_name()
                    .and_then(|name| name.to_str())
                    .is_some_and(|name| name.starts_with(BASE_FILE_NAME) && name.ends_with(".log"))
            })
            .collect::<Vec<_>>();

        assert!(files.len() >= 2);

        let _ = fs::remove_dir_all(directory);
    }

    #[test]
    fn logging_without_global_logger_is_safe() {
        log("TEST_EVENT", json!({"ok": true}));
    }
}
