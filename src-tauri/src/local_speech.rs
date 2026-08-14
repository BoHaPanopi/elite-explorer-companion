use serde::{Deserialize, Serialize};

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LocalVoice {
    pub id: String,
    pub display_name: String,
    pub locale: String,
    pub gender: String,
    pub api: String,
    pub available: bool,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SpeakLocalRequest {
    pub voice_id: String,
    pub text: String,
    pub rate: f64,
    pub pitch: f64,
    pub volume: f64,
}

#[cfg(target_os = "windows")]
mod platform {
    use super::{LocalVoice, SpeakLocalRequest};
    use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
    use std::sync::{atomic::{AtomicBool, AtomicUsize, Ordering}, mpsc, Arc, Mutex, OnceLock};
    use std::{thread, time::Duration};
    use windows::{
        core::HSTRING,
        Media::SpeechSynthesis::{SpeechSynthesizer, VoiceGender, VoiceInformation},
        Storage::Streams::DataReader,
        Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED},
    };

    enum WorkerCommand {
        List(mpsc::SyncSender<Result<Vec<LocalVoice>, String>>),
        Speak(SpeakLocalRequest, mpsc::SyncSender<Result<Vec<u8>, String>>),
        Stop(mpsc::SyncSender<Result<(), String>>),
        Shutdown,
    }

    #[derive(Clone)]
    pub struct LocalSpeechState { sender: mpsc::Sender<WorkerCommand>, stop: Arc<Mutex<Option<Arc<AtomicBool>>>> }

    static DEFAULT_STATE: OnceLock<LocalSpeechState> = OnceLock::new();

    fn trace(step: &str, details: impl std::fmt::Display) {
        log::info!("local_tts step={} {}", step, details);
    }

    fn error(context: &str, value: windows::core::Error) -> String {
        format!("{context}: HRESULT={:#010X} {value}", value.code().0 as u32)
    }

    struct Apartment;
    impl Apartment {
        fn initialize() -> Result<Self, String> {
            unsafe { RoInitialize(RO_INIT_MULTITHREADED) }.map_err(|value| error("WINRT_INITIALIZED failed", value))?;
            Ok(Self)
        }
    }
    impl Drop for Apartment { fn drop(&mut self) { unsafe { RoUninitialize() }; } }

    impl Default for LocalSpeechState {
        fn default() -> Self {
            DEFAULT_STATE.get_or_init(start_worker).clone()
        }
    }

    fn start_worker() -> LocalSpeechState {
        let (sender, receiver) = mpsc::channel::<WorkerCommand>();
        thread::Builder::new().name("ogg-winrt-speech".into()).spawn(move || {
            trace("WINRT_WORKER_STARTED", "thread=ogg-winrt-speech");
            let apartment = match Apartment::initialize() {
                Ok(apartment) => { trace("WINRT_INITIALIZED", "apartment=MTA"); apartment }
                Err(reason) => { trace("WINRT_WORKER_ERROR", reason); return; }
            };
            trace("VOICE_ENUMERATION_STARTED", "api=Windows.OneCore");
            let voices = match enumerate_voices() {
                Ok(voices) => { trace("VOICE_ENUMERATION_FINISHED", format_args!("count={}", voices.len())); voices }
                Err(reason) => { trace("WINRT_WORKER_ERROR", reason); return; }
            };
            let metadata = voices.iter().map(voice_metadata).collect::<Result<Vec<_>, _>>();
            let metadata = match metadata { Ok(value) => value, Err(reason) => { trace("WINRT_WORKER_ERROR", reason); return; } };
            trace("VOICE_COUNT", metadata.len());
            while let Ok(command) = receiver.recv() {
                match command {
                    WorkerCommand::List(reply) => { let _ = reply.send(Ok(metadata.clone())); }
                    WorkerCommand::Speak(request, reply) => {
                        trace("SPEAK_REQUEST_RECEIVED", format_args!("voice_id={} text_length={}", request.voice_id, request.text.len()));
                        let result = synthesize(&voices, request);
                        if let Err(ref reason) = result { trace("WINRT_WORKER_ERROR", reason); }
                        let _ = reply.send(result);
                    }
                    WorkerCommand::Stop(reply) => { trace("WASAPI_STOP_REQUESTED", "playback_not_started"); let _ = reply.send(Ok(())); }
                    WorkerCommand::Shutdown => break,
                }
            }
            drop(apartment);
            trace("WINRT_WORKER_STOPPED", "ok");
        }).expect("start OGG WinRT worker");
        LocalSpeechState { sender, stop: Arc::new(Mutex::new(None)) }
    }

    fn enumerate_voices() -> Result<Vec<VoiceInformation>, String> {
        let list = SpeechSynthesizer::AllVoices().map_err(|value| error("OneCore voice enumeration failed", value))?;
        let count = list.Size().map_err(|value| error("OneCore voice count failed", value))?;
        (0..count).map(|index| list.GetAt(index).map_err(|value| error("OneCore voice lookup failed", value))).collect()
    }

    fn voice_metadata(voice: &VoiceInformation) -> Result<LocalVoice, String> {
        let gender = match voice.Gender().map_err(|value| error("OneCore voice gender failed", value))? {
            VoiceGender::Male => "male", VoiceGender::Female => "female", _ => "unknown",
        };
        Ok(LocalVoice {
            id: voice.Id().map_err(|value| error("OneCore voice id failed", value))?.to_string(),
            display_name: voice.DisplayName().map_err(|value| error("OneCore voice name failed", value))?.to_string(),
            locale: voice.Language().map_err(|value| error("OneCore voice locale failed", value))?.to_string(),
            gender: gender.into(), api: "Windows OneCore/WinRT".into(), available: true,
        })
    }

    fn synthesize(voices: &[VoiceInformation], request: SpeakLocalRequest) -> Result<Vec<u8>, String> {
        if request.text.trim().is_empty() { return Err("No speech text was provided".into()); }
        if !(0.0..=1.0).contains(&request.volume) || !(-50.0..=50.0).contains(&request.rate) || !(-50.0..=50.0).contains(&request.pitch) { return Err("Invalid local speech settings".into()); }
        let voice = voices.iter().find(|voice| voice.Id().ok().is_some_and(|id| id.to_string() == request.voice_id))
            .ok_or_else(|| format!("Local Windows voice is not installed: {}", request.voice_id))?;
        trace("VOICE_SELECTED", request.voice_id.as_str());
        let synthesizer = SpeechSynthesizer::new().map_err(|value| error("OneCore synthesizer creation failed", value))?;
        synthesizer.SetVoice(voice).map_err(|value| error("OneCore voice selection failed", value))?;
        let options = synthesizer.Options().map_err(|value| error("OneCore speech options failed", value))?;
        options.SetSpeakingRate(1.0 + request.rate / 100.0).map_err(|value| error("OneCore rate failed", value))?;
        options.SetAudioPitch(1.0 + request.pitch / 100.0).map_err(|value| error("OneCore pitch failed", value))?;
        options.SetAudioVolume(request.volume).map_err(|value| error("OneCore volume failed", value))?;
        trace("SYNTHESIS_STARTED", "api=Windows.OneCore");
        let stream = synthesizer.SynthesizeTextToStreamAsync(&HSTRING::from(request.text.trim())).and_then(|operation| operation.get()).map_err(|value| error("OneCore synthesis failed", value))?;
        let size = stream.Size().map_err(|value| error("OneCore stream size failed", value))?;
        stream.Seek(0).map_err(|value| error("OneCore stream seek failed", value))?;
        let reader = DataReader::CreateDataReader(&stream).map_err(|value| error("OneCore stream reader failed", value))?;
        reader.LoadAsync(size as u32).and_then(|operation| operation.get()).map_err(|value| error("OneCore stream read failed", value))?;
        let mut wave = vec![0; size as usize];
        reader.ReadBytes(&mut wave).map_err(|value| error("OneCore bytes read failed", value))?;
        let _ = synthesizer.Close();
        trace("SYNTHESIS_FINISHED", format_args!("wave_bytes={}", wave.len()));
        Ok(wave)
    }

    fn ask<T>(state: &LocalSpeechState, command: impl FnOnce(mpsc::SyncSender<Result<T, String>>) -> WorkerCommand) -> Result<T, String> {
        let (reply, result) = mpsc::sync_channel(1);
        state.sender.send(command(reply)).map_err(|_| "WinRT speech worker is unavailable".to_string())?;
        result.recv().map_err(|_| "WinRT speech worker stopped before replying".to_string())?
    }

    pub fn list_local_voices(state: &LocalSpeechState) -> Result<Vec<LocalVoice>, String> { ask(state, WorkerCommand::List) }
    pub fn speak_local(state: &LocalSpeechState, request: SpeakLocalRequest) -> Result<(), String> {
        stop_local_speech(state)?;
        let wave = ask(state, |reply| WorkerCommand::Speak(request, reply))?;
        play_wave(state, &wave)
    }

    pub fn stop_local_speech(state: &LocalSpeechState) -> Result<(), String> {
        if let Some(stop) = state.stop.lock().map_err(|_| "Local playback state is unavailable".to_string())?.as_ref() {
            stop.store(true, Ordering::Release);
            trace("WASAPI_STOP_REQUESTED", "active=true");
        }
        Ok(())
    }

    fn pcm_from_wave(wave: &[u8], output_rate: u32, output_channels: u16) -> Result<Vec<f32>, String> {
        if wave.len() < 44 || &wave[0..4] != b"RIFF" || &wave[8..12] != b"WAVE" { return Err("OneCore returned an invalid WAV stream".into()); }
        let mut cursor = 12; let mut source_rate = 0; let mut source_channels = 0; let mut bits = 0; let mut audio = None;
        while cursor + 8 <= wave.len() {
            let length = u32::from_le_bytes(wave[cursor + 4..cursor + 8].try_into().unwrap()) as usize;
            let payload = cursor + 8; if payload + length > wave.len() { break; }
            match &wave[cursor..cursor + 4] {
                b"fmt " if length >= 16 => { source_channels = u16::from_le_bytes(wave[payload + 2..payload + 4].try_into().unwrap()); source_rate = u32::from_le_bytes(wave[payload + 4..payload + 8].try_into().unwrap()); bits = u16::from_le_bytes(wave[payload + 14..payload + 16].try_into().unwrap()); }
                b"data" => audio = Some(&wave[payload..payload + length]), _ => {}
            } cursor = payload + length + (length % 2);
        }
        let audio = audio.ok_or_else(|| "OneCore WAV has no data chunk".to_string())?;
        if source_rate == 0 || source_channels == 0 || bits != 16 { return Err(format!("Unsupported OneCore WAV format: rate={source_rate} channels={source_channels} bits={bits}")); }
        let source: Vec<f32> = audio.chunks_exact(2).map(|sample| i16::from_le_bytes([sample[0], sample[1]]) as f32 / i16::MAX as f32).collect();
        let source_frames = source.len() / source_channels as usize;
        let output_frames = ((source_frames as u64 * output_rate as u64) / source_rate as u64) as usize;
        let mut converted = Vec::with_capacity(output_frames * output_channels as usize);
        for frame in 0..output_frames { let source_frame = ((frame as u64 * source_rate as u64) / output_rate as u64).min(source_frames.saturating_sub(1) as u64) as usize; for channel in 0..output_channels as usize { converted.push(source[source_frame * source_channels as usize + channel.min(source_channels as usize - 1)]); } }
        trace("PCM_READY", format_args!("source_rate={source_rate} source_channels={source_channels} output_rate={output_rate} output_channels={output_channels}"));
        Ok(converted)
    }

    fn play_wave(state: &LocalSpeechState, wave: &[u8]) -> Result<(), String> {
        let host = cpal::default_host();
        let device = host.default_output_device().ok_or_else(|| "WASAPI default output device is unavailable".to_string())?;
        let supported = device.default_output_config().map_err(|value| format!("WASAPI default output config failed: {value}"))?;
        let config = supported.config(); let pcm = pcm_from_wave(wave, config.sample_rate, config.channels)?;
        trace("WASAPI_DEVICE_RESOLVED", format_args!("backend=cpal/WASAPI rate={} channels={}", config.sample_rate, config.channels));
        let stop = Arc::new(AtomicBool::new(false)); let position = Arc::new(AtomicUsize::new(0));
        *state.stop.lock().map_err(|_| "Local playback state is unavailable".to_string())? = Some(stop.clone());
        let build_error = |value| log::error!("local_tts step=LOCAL_TTS_ERROR wasapi={value}");
        macro_rules! stream { ($type:ty, $convert:expr) => {{ let samples = pcm.clone(); let flag = stop.clone(); let cursor = position.clone(); device.build_output_stream(&config, move |output: &mut [$type], _| { let start = cursor.fetch_add(output.len(), Ordering::AcqRel); for (index, slot) in output.iter_mut().enumerate() { let value = if flag.load(Ordering::Acquire) { 0.0 } else { samples.get(start + index).copied().unwrap_or(0.0) }; *slot = $convert(value); } }, build_error, None).map_err(|value| format!("WASAPI stream creation failed: {value}"))? }}; }
        let stream = match supported.sample_format() { cpal::SampleFormat::F32 => stream!(f32, |v: f32| v), cpal::SampleFormat::I16 => stream!(i16, |v: f32| (v.clamp(-1.0, 1.0) * i16::MAX as f32) as i16), cpal::SampleFormat::U16 => stream!(u16, |v: f32| ((v.clamp(-1.0, 1.0) + 1.0) * 0.5 * u16::MAX as f32) as u16), format => return Err(format!("Unsupported WASAPI sample format: {format:?}")) };
        trace("WASAPI_SESSION_CREATED", "mode=shared process_session=Old Guy of Grumpy");
        stream.play().map_err(|value| format!("WASAPI playback start failed: {value}"))?;
        trace("WASAPI_PLAYBACK_STARTED", "api=cpal");
        while position.load(Ordering::Acquire) < pcm.len() && !stop.load(Ordering::Acquire) { thread::sleep(Duration::from_millis(10)); }
        drop(stream); *state.stop.lock().map_err(|_| "Local playback state is unavailable".to_string())? = None;
        trace("WASAPI_PLAYBACK_FINISHED", format_args!("stopped={}", stop.load(Ordering::Acquire)));
        Ok(())
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        fn request(voice: &LocalVoice, text: &str) -> SpeakLocalRequest { SpeakLocalRequest { voice_id: voice.id.clone(), text: text.into(), rate: 0.0, pitch: 0.0, volume: 1.0 } }
        #[test]
        #[ignore = "requires installed local Windows voices"]
        fn list_speak_list_speak_is_stable_twenty_times() {
            let state = LocalSpeechState::default();
            for _ in 0..20 {
                let voices = list_local_voices(&state).expect("list local voices");
                let katja = voices.iter().find(|voice| voice.display_name == "Microsoft Katja").expect("Katja");
                let stefan = voices.iter().find(|voice| voice.display_name == "Microsoft Stefan").expect("Stefan");
                speak_local(&state, SpeakLocalRequest { voice_id: katja.id.clone(), text: "OGG lokale Sprachausgabe funktioniert.".into(), rate: 0.0, pitch: 0.0, volume: 1.0 }).expect("Katja synthesis");
                speak_local(&state, SpeakLocalRequest { voice_id: stefan.id.clone(), text: "OGG lokale Sprachausgabe funktioniert.".into(), rate: 0.0, pitch: 0.0, volume: 1.0 }).expect("Stefan synthesis");
                let _ = list_local_voices(&state).expect("list again");
                speak_local(&state, SpeakLocalRequest { voice_id: katja.id.clone(), text: "OGG lokale Sprachausgabe funktioniert.".into(), rate: 0.0, pitch: 0.0, volume: 1.0 }).expect("Katja synthesis again");
            }
        }

        #[test]
        #[ignore = "requires a local Windows output device"]
        fn plays_katja_stefan_and_george_through_wasapi() {
            let state = LocalSpeechState::default(); let voices = list_local_voices(&state).expect("voices");
            for name in ["Microsoft Katja", "Microsoft Stefan", "Microsoft George"] {
                let voice = voices.iter().find(|voice| voice.display_name == name).expect("required local voice");
                speak_local(&state, request(voice, "OGG lokale Sprachausgabe funktioniert.")).expect("WASAPI playback");
            }
        }

        #[test]
        #[ignore = "requires a local Windows output device"]
        fn stops_a_running_wasapi_playback() {
            let state = LocalSpeechState::default(); let voices = list_local_voices(&state).expect("voices");
            let katja = voices.iter().find(|voice| voice.display_name == "Microsoft Katja").expect("Katja").clone();
            let playback = state.clone(); let task = thread::spawn(move || speak_local(&playback, request(&katja, "OGG lokale Sprachausgabe funktioniert. OGG lokale Sprachausgabe funktioniert. OGG lokale Sprachausgabe funktioniert. OGG lokale Sprachausgabe funktioniert.")));
            thread::sleep(Duration::from_millis(250)); stop_local_speech(&state).expect("stop playback");
            task.join().expect("playback thread").expect("stopped playback completes");
        }

        #[test]
        #[ignore = "direct local OGG hearing test"]
        fn plays_the_ogg_rate_three_hearing_test() {
            let state = LocalSpeechState::default();
            let stefan = list_local_voices(&state).expect("voices").into_iter()
                .find(|voice| voice.display_name == "Microsoft Stefan" && voice.locale.eq_ignore_ascii_case("de-DE"))
                .expect("Stefan");
            speak_local(&state, SpeakLocalRequest {
                voice_id: stefan.id,
                text: "Dem koma a de Schua dobben bei'm Laffa.".into(),
                rate: 3.0, pitch: -16.0, volume: 1.0,
            }).expect("OGG local hearing test");
        }
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    use super::{LocalVoice, SpeakLocalRequest};
    #[derive(Clone, Default)] pub struct LocalSpeechState;
    pub fn list_local_voices(_: &LocalSpeechState) -> Result<Vec<LocalVoice>, String> { Ok(Vec::new()) }
    pub fn speak_local(_: &LocalSpeechState, _: SpeakLocalRequest) -> Result<(), String> { Err("Local Windows speech is only available on Windows".into()) }
    pub fn stop_local_speech(_: &LocalSpeechState) -> Result<(), String> { Ok(()) }
}

pub use platform::{list_local_voices, speak_local, stop_local_speech, LocalSpeechState};
