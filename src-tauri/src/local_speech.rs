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
    use std::sync::{Arc, Condvar, Mutex};
    use windows::{
        core::{HSTRING, IInspectable},
        Foundation::TypedEventHandler,
        Media::{
            Core::MediaSource,
            Playback::{MediaPlayer, MediaPlayerFailedEventArgs},
            SpeechSynthesis::{SpeechSynthesizer, VoiceGender, VoiceInformation},
        },
        Win32::System::WinRT::{RoInitialize, RoUninitialize, RO_INIT_MULTITHREADED},
    };

    struct RoApartment;

    impl RoApartment {
        fn initialize() -> Result<Self, String> {
            unsafe { RoInitialize(RO_INIT_MULTITHREADED) }
                .map_err(|error| windows_error("WinRT initialization failed", error))?;
            Ok(Self)
        }
    }

    impl Drop for RoApartment {
        fn drop(&mut self) {
            unsafe { RoUninitialize() };
        }
    }

    struct ActiveSpeech {
        player: MediaPlayer,
        completion: Arc<(Mutex<bool>, Condvar)>,
    }

    #[derive(Clone, Default)]
    pub struct LocalSpeechState {
        active: Arc<Mutex<Option<ActiveSpeech>>>,
    }

    fn windows_error(context: &str, error: windows::core::Error) -> String {
        format!("{context}: {error}")
    }

    fn voices() -> Result<Vec<VoiceInformation>, String> {
        let installed = SpeechSynthesizer::AllVoices()
            .map_err(|error| windows_error("Windows voice enumeration failed", error))?;
        let size = installed
            .Size()
            .map_err(|error| windows_error("Windows voice count failed", error))?;
        (0..size)
            .map(|index| installed.GetAt(index).map_err(|error| windows_error("Windows voice lookup failed", error)))
            .collect()
    }

    fn voice_id(voice: &VoiceInformation) -> Result<String, String> {
        voice
            .Id()
            .map(|value| value.to_string())
            .map_err(|error| windows_error("Windows voice id failed", error))
    }

    pub fn list_local_voices() -> Result<Vec<LocalVoice>, String> {
        let _apartment = RoApartment::initialize()?;
        voices()?
            .into_iter()
            .map(|voice| {
                let gender = match voice
                    .Gender()
                    .map_err(|error| windows_error("Windows voice gender failed", error))?
                {
                    VoiceGender::Male => "male",
                    VoiceGender::Female => "female",
                    _ => "unknown",
                };
                Ok(LocalVoice {
                    id: voice_id(&voice)?,
                    display_name: voice
                        .DisplayName()
                        .map_err(|error| windows_error("Windows voice name failed", error))?
                        .to_string(),
                    locale: voice
                        .Language()
                        .map_err(|error| windows_error("Windows voice locale failed", error))?
                        .to_string(),
                    gender: gender.into(),
                    api: "Windows OneCore/WinRT".into(),
                    available: true,
                })
            })
            .collect()
    }

    fn signal(completion: &Arc<(Mutex<bool>, Condvar)>) {
        let (done, condition) = &**completion;
        if let Ok(mut finished) = done.lock() {
            *finished = true;
            condition.notify_all();
        }
    }

    pub fn stop_local_speech(state: &LocalSpeechState) -> Result<(), String> {
        let active = state
            .active
            .lock()
            .map_err(|_| "Local speech state is unavailable".to_string())?
            .take();
        if let Some(active) = active {
            let _ = active.player.Pause();
            let _ = active.player.Close();
            signal(&active.completion);
        }
        Ok(())
    }

    pub fn speak_local(state: &LocalSpeechState, request: SpeakLocalRequest) -> Result<(), String> {
        let text = request.text.trim();
        if text.is_empty() {
            return Err("No speech text was provided".into());
        }
        if !(0.0..=1.0).contains(&request.volume) {
            return Err("Volume must be between 0 and 1".into());
        }
        if !(-50.0..=50.0).contains(&request.rate) || !(-50.0..=50.0).contains(&request.pitch) {
            return Err("Rate and pitch must be between -50 and 50 percent".into());
        }

        stop_local_speech(state)?;
        let _apartment = RoApartment::initialize()?;
        let voice = voices()?
            .into_iter()
            .find(|voice| voice_id(voice).as_deref() == Ok(request.voice_id.as_str()))
            .ok_or_else(|| format!("Local Windows voice is not installed: {}", request.voice_id))?;

        let synthesizer = SpeechSynthesizer::new()
            .map_err(|error| windows_error("Windows speech synthesizer creation failed", error))?;
        synthesizer
            .SetVoice(&voice)
            .map_err(|error| windows_error("Windows voice selection failed", error))?;
        let options = synthesizer
            .Options()
            .map_err(|error| windows_error("Windows speech options failed", error))?;
        options
            .SetSpeakingRate(1.0 + request.rate / 100.0)
            .map_err(|error| windows_error("Windows speech rate failed", error))?;
        options
            .SetAudioPitch(1.0 + request.pitch / 100.0)
            .map_err(|error| windows_error("Windows speech pitch failed", error))?;
        options
            .SetAudioVolume(request.volume)
            .map_err(|error| windows_error("Windows speech volume failed", error))?;

        let stream = synthesizer
            .SynthesizeTextToStreamAsync(&HSTRING::from(text))
            .and_then(|operation| operation.get())
            .map_err(|error| windows_error("Local Windows speech synthesis failed", error))?;
        let content_type = stream
            .ContentType()
            .map_err(|error| windows_error("Windows speech stream type failed", error))?;
        let source = MediaSource::CreateFromStream(&stream, &content_type)
            .map_err(|error| windows_error("Windows speech media source failed", error))?;
        let player = MediaPlayer::new()
            .map_err(|error| windows_error("Windows speech player creation failed", error))?;
        player
            .SetVolume(request.volume)
            .map_err(|error| windows_error("Windows speech playback volume failed", error))?;
        player
            .SetSource(&source)
            .map_err(|error| windows_error("Windows speech source selection failed", error))?;

        let completion = Arc::new((Mutex::new(false), Condvar::new()));
        let ended_completion = completion.clone();
        let ended = TypedEventHandler::<MediaPlayer, IInspectable>::new(move |_, _| {
            signal(&ended_completion);
            Ok(())
        });
        let failed_completion = completion.clone();
        let failed = TypedEventHandler::<MediaPlayer, MediaPlayerFailedEventArgs>::new(move |_, _| {
            signal(&failed_completion);
            Ok(())
        });
        let ended_token = player
            .MediaEnded(&ended)
            .map_err(|error| windows_error("Windows speech completion handler failed", error))?;
        let failed_token = player
            .MediaFailed(&failed)
            .map_err(|error| windows_error("Windows speech failure handler failed", error))?;

        {
            let mut active = state
                .active
                .lock()
                .map_err(|_| "Local speech state is unavailable".to_string())?;
            *active = Some(ActiveSpeech {
                player: player.clone(),
                completion: completion.clone(),
            });
        }
        player
            .Play()
            .map_err(|error| windows_error("Local Windows speech playback failed", error))?;

        let (done, condition) = &*completion;
        let mut finished = done
            .lock()
            .map_err(|_| "Local speech completion state is unavailable".to_string())?;
        while !*finished {
            finished = condition
                .wait(finished)
                .map_err(|_| "Local speech completion wait failed".to_string())?;
        }
        let _ = player.RemoveMediaEnded(ended_token);
        let _ = player.RemoveMediaFailed(failed_token);
        let _ = player.Close();
        let _ = synthesizer.Close();
        if let Ok(mut active) = state.active.lock() {
            if active
                .as_ref()
                .is_some_and(|current| current.player == player)
            {
                *active = None;
            }
        }
        Ok(())
    }
}

#[cfg(not(target_os = "windows"))]
mod platform {
    use super::{LocalVoice, SpeakLocalRequest};

    #[derive(Clone, Default)]
    pub struct LocalSpeechState;

    pub fn list_local_voices() -> Result<Vec<LocalVoice>, String> {
        Ok(Vec::new())
    }

    pub fn speak_local(_: &LocalSpeechState, _: SpeakLocalRequest) -> Result<(), String> {
        Err("Local Windows speech is only available on Windows".into())
    }

    pub fn stop_local_speech(_: &LocalSpeechState) -> Result<(), String> {
        Ok(())
    }
}

pub use platform::{list_local_voices, speak_local, stop_local_speech, LocalSpeechState};
