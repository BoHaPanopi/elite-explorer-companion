import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { exit } from "@tauri-apps/plugin-process";

import "./App.css";
import AlphaTestingNotice from "./components/AlphaTestingNotice";
import AssistantPanel from "./components/AssistantPanel";
import BordcomputerSetup from "./components/BordcomputerSetup";
import CrewConfigDialog from "./components/CrewConfigDialog";
import Dashboard from "./components/Dashboard";
import JournalPanel from "./components/JournalPanel";
import LanguageSettings from "./components/LanguageSettings";
import Navigation from "./components/Navigation";
import OggBrand from "./components/OggBrand";
import Sidebar from "./components/Sidebar";
import StartupRecoveryDialog, { type StartupHealth } from "./components/StartupRecoveryDialog";
import TopBar from "./components/TopBar";
import { TonyAbout, TonyMessageDialog } from "./components/TonyEdition";
import UpdateDialog, { type UpdatePhase } from "./components/UpdateDialog";
import { useI18n } from "./i18n";
import {
  defaultCrewLocaleForUiLanguage,
  readCrewSelections,
  type CrewSelectionMap,
} from "./features/crewProfiles";
import { formatCurrentJumpRange, selectDisplayedCurrentJumpRange } from "./features/currentJumpRange";
import { resolveCrewVoicePreview } from "./features/crewVoicePreview";
import {
  alphaTestingNoticeAlreadySeen,
  markAlphaTestingNoticeSeen,
} from "./features/alphaTestingNotice";
import { advanceObservationProcessingState, type ObservationProcessingState } from "./features/exploration/observationProcessingGuard";
import { speechService } from "./services/SpeechService";
import { downloadUpdateInBackground, installDownloadedUpdateOnExit } from "./services/DeferredUpdateService";
import { createStartupGreeting } from "ogg-core";
import { createExplorationMessage, type ExplorationObservationKind } from "ogg-core";
import { createTonyStartupGreeting, isTonySeason, resolveOggMode, selectCommanderIdentity, tonySeasonalStorageKey, tonyWelcomeStorageKey, type TonyMessageType } from "ogg-core";
import type { AnnaLiveJournalEvent } from "ogg-core";
import { AnnaEvidenceService } from "./services/AnnaEvidenceService";

type Page =
  | "dashboard"
  | "navigation"
  | "settings";

type RouteStep = {
  system: string;
  starClass: string | null;
  position: [number, number, number] | null;
};

type NavigationProgress = {
  currentSystem: string | null;
  nextSystem: string | null;
  remainingJumps: number;
  remainingDistance: number | null;
  activeRoute: RouteStep[];
};

type EliteSnapshot = {
  commander: string | null;
  system: string | null;
  ship: string | null;
  shipName: string | null;
  docked: boolean | null;
  shipState: "supercruise" | "normal_space" | "docked" | "landed" | null;
  stationName: string | null;
  planetName: string | null;
  currentJumpRange: number | null;
  maxJumpRange: number | null;
  eliteConnected: boolean;
  exploration: {
    systemScan: "undiscovered" | "partially_discovered" | "fully_discovered";
    bodies: Array<{
      bodyId: number;
      bodyName: string;
      discovery: "undiscovered" | "discovered_by_other_commander" | "first_discovered_by_current_commander" | "previously_discovered_ownership_unknown";
      mapping: "not_mapped" | "scanned_not_mapped" | "mapped_by_other_commander" | "first_mapped_by_current_commander" | "previously_mapped_ownership_unknown";
      biology: "none_detected" | "signals_present";
      biologyFinding: "none" | "unknown" | "known" | "new";
    }>;
    latestObservation: {
      id: string;
      kind: ExplorationObservationKind;
      bodyId: number | null;
      bodyName: string | null;
      details?: {
        biologicalSignalCount?: number | null;
        confirmedGenera?: string[];
        compositionSpecies?: string | null;
        codexEntryName?: string | null;
        voucherAmount?: number | null;
        remainingBiologicalBodies?: number | null;
        probeStage?: 1 | 2 | 3 | null;
      };
    } | null;
  };
  journalPath: string;
  navigationProgress: NavigationProgress;
};

type UpdateReadiness = {
  ready: boolean;
  blocker: "another_ogg_instance" | "installer_running" | null;
};

type StartupGreetingState = "idle" | "scheduled" | "playing" | "completed";

const BORDCOMPUTER_NAME_KEY = "eec.bordcomputerName";
let updateCheckStartedForSession = false;
let updateNoticeDismissedForSession = false;
const LAST_COCKPIT_SESSION_KEY = "eec.lastCockpitSession";
const LAST_KNOWN_COMMANDER_KEY = "eec.lastKnownCommander";
const RETURNING_AFTER_MS = 30 * 60 * 1000;
const annaEvidenceService = new AnnaEvidenceService(localStorage);

type DashboardStatusTone = "flight" | "docked" | "landed" | "idle";

function resolveShipStatus(snapshot: EliteSnapshot | null, isLoading: boolean, t: (key: "loading" | "eliteDisconnected" | "supercruise" | "normalSpace" | "docked" | "landed" | "unknown") => string) {
  if (isLoading) {
    return { label: t("loading"), tone: "idle" as DashboardStatusTone };
  }

  if (!snapshot?.eliteConnected) {
    return { label: t("eliteDisconnected"), tone: "idle" as DashboardStatusTone };
  }

  switch (snapshot.shipState) {
    case "supercruise":
      return { label: t("supercruise"), tone: "flight" as DashboardStatusTone };
    case "normal_space":
      return { label: t("normalSpace"), tone: "flight" as DashboardStatusTone };
    case "docked":
      return { label: t("docked"), tone: "docked" as DashboardStatusTone };
    case "landed":
      return { label: t("landed"), tone: "landed" as DashboardStatusTone };
    default:
      if (snapshot.docked === true) {
        return { label: t("docked"), tone: "docked" as DashboardStatusTone };
      }
      if (snapshot.docked === false) {
        return { label: t("normalSpace"), tone: "flight" as DashboardStatusTone };
      }
      return { label: t("unknown"), tone: "idle" as DashboardStatusTone };
  }
}

function resolveShipContext(snapshot: EliteSnapshot | null, t: (key: "station" | "planet") => string) {
  if (!snapshot?.eliteConnected) {
    return null;
  }

  if ((snapshot.shipState === "docked" || snapshot.docked === true) && snapshot.stationName) {
    return { label: t("station"), value: snapshot.stationName };
  }

  if (snapshot.shipState === "landed" && snapshot.planetName) {
    return { label: t("planet"), value: snapshot.planetName };
  }

  return null;
}

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  const { t } = useI18n();

  const profileLabels = [
    t("automatic"),
    t("explorationProfile"),
    t("miningProfile"),
    t("combatProfile"),
    t("tradeProfile"),
  ];

  return (
    <section className="panel module-settings-panel">
      <span>{t("module")}</span>
      <h2>{title}</h2>
      <p className="muted">{t("moduleProfileHint")}</p>
      <div className="module-profile-options" aria-label={t("activeProfile")}>
        {profileLabels.map((label, index) => (
          <span
            className={index === 0 ? "module-profile-options__chip module-profile-options__chip--active" : "module-profile-options__chip"}
            key={label}
          >
            {label}
          </span>
        ))}
      </div>
    </section>
  );
}

function App() {
  const { language, t } = useI18n();
  const [page, setPage] = useState<Page>("dashboard");
  const [snapshot, setSnapshot] = useState<EliteSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [bordcomputerName, setBordcomputerName] = useState<string | null>(null);
  const [crewSelections, setCrewSelections] = useState<CrewSelectionMap>(() => readCrewSelections());
  const [showCrewConfig, setShowCrewConfig] = useState(false);
  const [showAlphaNotice, setShowAlphaNotice] = useState(() => !alphaTestingNoticeAlreadySeen());
  const [showSetup, setShowSetup] = useState(false);
  const [availableUpdate, setAvailableUpdate] = useState<Update | null>(null);
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>("downloading");
  const [, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [tonyMessage, setTonyMessage] = useState<TonyMessageType | null>(null);
  const [startupHealth, setStartupHealth] = useState<StartupHealth | null>(null);
  const [appVersion, setAppVersion] = useState("");
  const [lastKnownCommander, setLastKnownCommander] = useState<string | null>(
    () => localStorage.getItem(LAST_KNOWN_COMMANDER_KEY),
  );
  const startupGreetingState = useRef<StartupGreetingState>("idle");
  const lastGreetingSuppressionReason = useRef<string | null>(null);
  const [greetingRetryNonce, setGreetingRetryNonce] = useState(0);
  const startupModeLogged = useRef(false);
  const lastLoggedJournalCommander = useRef<string | null>(null);
  const pendingUpdate = useRef<Update | null>(null);
  const updatePhaseRef = useRef<UpdatePhase>("downloading");
  const observationProcessingState = useRef<ObservationProcessingState>({
    baselineReady: false,
    lastProcessedObservationId: null,
    lastAlreadyProcessedLoggedObservationId: null,
  });
  const lastLatestObservation = useRef<string | null>(null);
  const lastUiDiagnosticState = useRef<string>("");
  const activeCommander = selectCommanderIdentity(snapshot?.commander, lastKnownCommander);
  const oggMode = resolveOggMode(activeCommander, language);
  const { language: oggLanguage, mode: languageMode, tonyProfile } = oggMode;

  const logDiagnostic = useCallback((kind: string, payload: Record<string, unknown>) => {
    void invoke("log_diagnostic_event", { kind, payload }).catch(() => undefined);
  }, []);

  const snapshotRequestInFlight = useRef(false);

  const loadEliteSnapshot = useCallback(async () => {
    if (snapshotRequestInFlight.current) {
      return;
    }

    snapshotRequestInFlight.current = true;

    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot", { locale: language });
      const annaEvents = await invoke<AnnaLiveJournalEvent[]>("get_live_anna_journal_events", { locale: language });
      annaEvidenceService.process(result.commander
        ? [{ event: "Commander", name: result.commander }, ...annaEvents]
        : annaEvents);
      if (result.commander) {
        localStorage.setItem(LAST_KNOWN_COMMANDER_KEY, result.commander);
        setLastKnownCommander(result.commander);
        if (lastLoggedJournalCommander.current !== result.commander) {
          lastLoggedJournalCommander.current = result.commander;
          const detectedMode = resolveOggMode(result.commander, language);
          void invoke("log_audio_event", {
            event: "language_mode_after_commander_detection",
            technical: `mode=${detectedMode.mode} commander=${JSON.stringify(result.commander)}`,
          });
        }
      }
      setSnapshot(result);
      setJournalError(null);
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : String(error));
    } finally {
      snapshotRequestInFlight.current = false;
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    void getVersion().then(setAppVersion);
  }, []);

  useEffect(() => {
    if (startupModeLogged.current || (isLoading && !lastKnownCommander)) return;
    startupModeLogged.current = true;
    const source = snapshot?.commander ? "journal" : lastKnownCommander ? "persisted" : "none";
    void invoke("log_audio_event", {
      event: "language_mode_at_startup",
      technical: `mode=${languageMode} commander=${JSON.stringify(activeCommander)} source=${source}`,
    });
  }, [activeCommander, isLoading, languageMode, lastKnownCommander, snapshot?.commander]);

  useEffect(() => {
    void invoke("log_audio_event", {
      event: "startup_app_started",
      technical: "ui=ready",
    });
  }, []);

  useEffect(() => {
    let active = true;
    void invoke("mark_frontend_ready");
    const heartbeatInterval = window.setInterval(() => void invoke("frontend_heartbeat"), 2000);
    const refreshStartupHealth = () => void invoke<StartupHealth>("get_startup_health").then((health) => {
      if (active && !health.ready) setStartupHealth(health);
    });
    refreshStartupHealth();
    const healthInterval = window.setInterval(refreshStartupHealth, 2000);
    return () => { active = false; window.clearInterval(healthInterval); window.clearInterval(heartbeatInterval); };
  }, [language]);

  useEffect(() => {
    if (updateCheckStartedForSession) {
      void invoke("log_update_phase", { phase: "check_suppressed", cause: "duplicate_effect_initialization", technical: "scope=current_session" });
      return;
    }
    updateCheckStartedForSession = true;
    void invoke<string>("updater_distribution").then((distribution) => {
      if (distribution === "local-test") {
        void invoke("log_update_phase", { phase: "check_skipped", cause: "local_test_build", technical: "scope=this_installation_only" });
        return;
      }
      void invoke("log_update_phase", { phase: "check", cause: "startup", technical: "scope=official_distribution" });
      void check().then((update) => {
        if (update) void downloadUpdate(update);
      }).catch((error) => {
        void invoke("log_update_phase", { phase: "check_failed", cause: "request_failed", technical: error instanceof Error ? error.message : String(error) });
      });
    }).catch((error) => {
      void invoke("log_update_phase", { phase: "check_failed", cause: "distribution_detection_failed", technical: error instanceof Error ? error.message : String(error) });
    });
  }, []);

  async function downloadUpdate(update: Update) {
    pendingUpdate.current = update;
    if (!updateNoticeDismissedForSession) setAvailableUpdate(update);
    setUpdatePhase("downloading");
    updatePhaseRef.current = "downloading";
    setUpdateProgress(0);
    setUpdateError(null);
    void invoke("log_update_phase", { phase: "download_start", cause: "background_download", technical: null });
    try {
      await downloadUpdateInBackground(update, setUpdateProgress);
      void invoke("log_update_phase", { phase: "download_complete", cause: "package_cached", technical: null });
      setUpdateProgress(1);
      setUpdatePhase("ready");
      updatePhaseRef.current = "ready";
    } catch (error) {
      pendingUpdate.current = null;
      void invoke("log_update_phase", { phase: "failed", cause: "background_download_failed", technical: error instanceof Error ? error.message : String(error) });
      setUpdateError(error instanceof Error ? error.name : "update-error");
      setUpdatePhase("error");
      updatePhaseRef.current = "error";
    }
  }

  function dismissUpdateNotice() {
    updateNoticeDismissedForSession = true;
    setAvailableUpdate(null);
    void invoke("log_update_phase", { phase: "notice_dismissed", cause: "user_choice", technical: "scope=current_session" });
  }

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void getCurrentWindow().onCloseRequested(async (event) => {
      const update = pendingUpdate.current;
      if (!update) {
        await exit(0);
        return;
      }
      if (updatePhaseRef.current === "installing") {
        event.preventDefault();
        return;
      }
      if (updatePhaseRef.current !== "ready") return;

      event.preventDefault();
      updatePhaseRef.current = "installing";
      setUpdatePhase("installing");
      void invoke("log_update_phase", { phase: "install", cause: "application_exit", technical: null });
      try {
        await installDownloadedUpdateOnExit(
          update,
          () => invoke<UpdateReadiness>("prepare_for_update"),
          () => new Promise((resolve) => window.setTimeout(resolve, 500)),
          (blocker) => void invoke("log_update_phase", { phase: "waiting", cause: "file_or_process_lock", technical: blocker }),
          () => void invoke("log_update_phase", { phase: "install_started", cause: "application_exit", technical: null }),
        );
        pendingUpdate.current = null;
        await exit(0);
      } catch (error) {
        updatePhaseRef.current = "error";
        setUpdatePhase("error");
        setUpdateError(error instanceof Error ? error.name : "update-error");
        void invoke("log_update_phase", { phase: "failed", cause: "deferred_install_failed", technical: error instanceof Error ? error.message : String(error) });
      }
    }).then((stopListening) => { unlisten = stopListening; });
    return () => unlisten?.();
  }, []);

  useEffect(() => {
    const savedName = localStorage.getItem(BORDCOMPUTER_NAME_KEY)?.trim();

    if (savedName) {
      setBordcomputerName(savedName);
    }
  }, []);

  useEffect(() => {
    void loadEliteSnapshot();

    const intervalId = window.setInterval(() => {
      void loadEliteSnapshot();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
      speechService.stop();
    };
  }, [loadEliteSnapshot]);

  useEffect(() => {
    if (isLoading) return;
    const observation = snapshot?.exploration.latestObservation ?? null;
    const observationId = observation?.id ?? null;
    const annaVoice = resolveCrewVoicePreview("science", defaultCrewLocaleForUiLanguage(oggLanguage));
    const previousLatestObservation = lastLatestObservation.current;
    const nextLatestObservation = observationId;
    const transition = advanceObservationProcessingState(
      observationProcessingState.current,
      observationId,
    );
    observationProcessingState.current = transition.nextState;

    if (!previousLatestObservation && nextLatestObservation) {
      logDiagnostic("BIO_OBSERVATION_CREATED", {
        eventType: observation?.kind ?? null,
        observationId: nextLatestObservation,
        previousLatestObservation,
        newLatestObservation: nextLatestObservation,
        ignoreReason: null,
      });
    } else if (previousLatestObservation && nextLatestObservation && previousLatestObservation !== nextLatestObservation) {
      logDiagnostic("BIO_OBSERVATION_REPLACED", {
        eventType: observation?.kind ?? null,
        observationId: nextLatestObservation,
        previousLatestObservation,
        newLatestObservation: nextLatestObservation,
        ignoreReason: null,
      });
    }
    lastLatestObservation.current = nextLatestObservation;

    if (transition.decision === "baseline_initialization_skip") {
      if (observation?.id) {
        logDiagnostic("BIO_OBSERVATION_IGNORED", {
          eventType: observation.kind,
          observationId: observation.id,
          previousLatestObservation,
          newLatestObservation: observation.id,
          ignoreReason: "exploration_baseline_initialization",
        });
      }
      logDiagnostic("BIO_VOICE_SKIPPED", {
        reason: "exploration_baseline_initialization",
        speaker: "Anna",
      });
      return;
    }

    if (transition.decision === "no_latest_observation") {
      logDiagnostic("BIO_OBSERVATION_IGNORED", {
        eventType: null,
        observationId: null,
        previousLatestObservation,
        newLatestObservation: null,
        ignoreReason: "no_latest_observation",
      });
      logDiagnostic("BIO_VOICE_SKIPPED", {
        reason: "no_latest_observation",
        speaker: "Anna",
      });
      return;
    }

    if (transition.decision === "observation_already_processed") {
      if (!observation) return;
      logDiagnostic("BIO_OBSERVATION_IGNORED", {
        eventType: observation.kind,
        observationId: observation.id,
        previousLatestObservation,
        newLatestObservation: observation.id,
        ignoreReason: "observation_already_processed",
      });
      logDiagnostic("BIO_VOICE_SKIPPED", {
        reason: "observation_already_processed",
        observationId: observation.id,
        speaker: "Anna",
      });
      return;
    }

    if (transition.decision === "already_processed_suppressed" || !observation) {
      return;
    }

    const message = createExplorationMessage(observation, oggLanguage);
    const details = observation.details ?? {};

    logDiagnostic("BIO_INPUT", {
      observationId: observation.id,
      eventType: observation.kind,
      bodyId: observation.bodyId,
      bodyName: observation.bodyName,
      biologicalSignalCount: details.biologicalSignalCount ?? null,
      signalTypes: details.biologicalSignalCount ? ["biological"] : [],
      confirmedGenera: details.confirmedGenera ?? [],
      compositionSpecies: details.compositionSpecies ?? null,
      codexEntryName: details.codexEntryName ?? null,
      voucherAmount: details.voucherAmount ?? null,
      probeStage: details.probeStage ?? null,
      speaker: "Anna",
    });

    logDiagnostic("BIO_DECISION", {
      decision: "speak",
      reason: "new_exploration_observation",
      eventType: observation.kind,
      biologicalSignalCount: details.biologicalSignalCount ?? null,
      signalTypes: details.biologicalSignalCount ? ["biological"] : [],
      confirmedGenera: details.confirmedGenera ?? [],
      compositionSpecies: details.compositionSpecies ?? null,
      codexEntryName: details.codexEntryName ?? null,
      generatedSentence: message,
      speaker: "Anna",
      voiceConfig: annaVoice?.options ?? null,
      locale: oggLanguage,
    });

    logDiagnostic("BIO_VOICE_CREATED", {
      observationId: observation.id,
      eventType: observation.kind,
      speaker: "Anna",
      locale: oggLanguage,
      voiceConfig: annaVoice?.options ?? null,
      text: message,
    });

    void speechService.speak(message, {
      ...(annaVoice?.options ?? {}),
      speaker: "Anna",
      locale: oggLanguage,
    }).catch((error) => {
      logDiagnostic("BIO_VOICE_SKIPPED", {
        reason: "speech_service_error",
        observationId: observation.id,
        eventType: observation.kind,
        speaker: "Anna",
        error: error instanceof Error ? `${error.name}: ${error.message}` : String(error),
      });
      console.error(oggLanguage === "en" ? "Exploration voice output failed:" : "Explorations-Sprachausgabe fehlgeschlagen:", error);
    });
  }, [isLoading, logDiagnostic, oggLanguage, snapshot?.exploration.latestObservation?.id]);

  useEffect(() => {
    const state: Record<string, unknown> = {
      systemName: snapshot?.system ?? null,
      shipStatus: snapshot?.shipState ?? null,
      supercruise: snapshot?.shipState === "supercruise",
      docked: snapshot?.docked ?? null,
      station: snapshot?.stationName ?? null,
      mode: languageMode,
      knownStarClasses: (snapshot?.navigationProgress.activeRoute ?? [])
        .map((step) => step.starClass)
        .filter((value): value is string => Boolean(value)),
    };
    const serialized = JSON.stringify(state);
    if (serialized === lastUiDiagnosticState.current) return;
    lastUiDiagnosticState.current = serialized;
    logDiagnostic("UI_STATE_CHANGE", state);
  }, [languageMode, logDiagnostic, snapshot]);

  useEffect(() => {
    if (!tonyProfile || tonyMessage || showSetup || availableUpdate) return;
    if (localStorage.getItem(tonyWelcomeStorageKey(tonyProfile)) !== "read") {
      setTonyMessage("welcome");
      return;
    }

    const now = new Date();
    if (isTonySeason(now) && localStorage.getItem(tonySeasonalStorageKey(now.getFullYear())) !== "read") {
      setTonyMessage("seasonal");
    }
  }, [availableUpdate, showSetup, tonyMessage, tonyProfile]);

  const speakGreeting = useCallback(
    async (forceReturning?: boolean) => {
      if (!bordcomputerName) return false;

      const commanderName = activeCommander?.trim() || "Commander";

      const lastSession = Number(
        localStorage.getItem(LAST_COCKPIT_SESSION_KEY) ?? "0",
      );

      const isReturning =
        forceReturning ??
        (lastSession > 0 &&
          Date.now() - lastSession >= RETURNING_AFTER_MS);

      const greetingContext = {
        bordcomputerName,
        commanderName,
        isReturning,
      };
      const greeting = tonyProfile
        ? createTonyStartupGreeting(greetingContext)
        : createStartupGreeting(greetingContext);

      try {
        const greetingText = `${greeting
          .map((segment) => segment.replace(/[.!?]+$/, ""))
          .join(", ")}.`;
        await speechService.speak(greetingText, {
          preRollMs: 650,
          speaker: "OGG",
          locale: oggLanguage,
        });
        localStorage.setItem(
          LAST_COCKPIT_SESSION_KEY,
          String(Date.now()),
        );
        return true;
      } catch (error) {
        console.error(language === "en" ? "Voice output failed:" : "Sprachausgabe fehlgeschlagen:", error);
        return false;
      }
    },
    [activeCommander, bordcomputerName, language, oggLanguage, tonyProfile],
  );

  useEffect(() => {
    if (startupGreetingState.current !== "idle") return;

    const suppressionReason = !activeCommander
      ? "commander_unknown"
      : isLoading
        ? "journal_initializing"
        : !bordcomputerName
          ? "onboard_computer_name_missing"
          : showSetup
            ? "setup_open"
            : null;

    if (suppressionReason) {
      if (lastGreetingSuppressionReason.current !== suppressionReason) {
        lastGreetingSuppressionReason.current = suppressionReason;
        void invoke("log_audio_event", {
          event: "startup_greeting_suppressed",
          technical: `reason=${suppressionReason}`,
        });
      }
      return;
    }

    lastGreetingSuppressionReason.current = null;
    startupGreetingState.current = "scheduled";
    void invoke("log_audio_event", {
      event: "startup_greeting_scheduled",
      technical: `mode=${languageMode} commander=${JSON.stringify(activeCommander)}`,
    });

    let cancelled = false;

    void (async () => {
        const localVoiceReady = await speechService.waitUntilReady(30_000);
        if (cancelled) return;
        if (!localVoiceReady) {
          startupGreetingState.current = "idle";
          void invoke("log_audio_event", {
            event: "startup_greeting_suppressed",
            technical: "reason=local_windows_voice_not_ready retryMs=1000",
          });
          window.setTimeout(() => setGreetingRetryNonce((value) => value + 1), 1000);
          return;
        }

        void invoke("log_audio_event", {
          event: "startup_local_voice_ready",
          technical: "api=Windows OneCore/WinRT health=ok",
        });
        startupGreetingState.current = "playing";
        void invoke("log_audio_event", {
          event: "startup_greeting_started",
          technical: `mode=${languageMode} commander=${JSON.stringify(activeCommander)}`,
        });

        try {
          const greetingCompleted = await speakGreeting();
          if (!greetingCompleted) throw new Error("Greeting playback did not reach ended.");
          if (cancelled) return;
          startupGreetingState.current = "completed";
          void invoke("log_audio_event", {
            event: "startup_greeting_finished",
            technical: `mode=${languageMode}`,
          });
        } catch (error) {
          if (cancelled) return;
          startupGreetingState.current = "idle";
          const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
          void invoke("log_audio_event", {
            event: "startup_greeting_suppressed",
            technical: `reason=playback_failed error=${JSON.stringify(message)} retryMs=1000`,
          });
          window.setTimeout(() => setGreetingRetryNonce((value) => value + 1), 1000);
        }
    })();

    return () => {
      if (startupGreetingState.current === "scheduled") {
        cancelled = true;
        startupGreetingState.current = "idle";
        void invoke("log_audio_event", {
          event: "startup_greeting_suppressed",
          technical: "reason=schedule_invalidated",
        });
      }
    };
  }, [
    bordcomputerName,
    greetingRetryNonce,
    isLoading,
    languageMode,
    showSetup,
    activeCommander,
    speakGreeting,
  ]);

  function saveBordcomputerName(name: string) {
    localStorage.setItem(BORDCOMPUTER_NAME_KEY, name);
    setBordcomputerName(name);
    setShowSetup(false);
    startupGreetingState.current = "idle";
  }

  function closeTonyMessage() {
    if (!tonyProfile || !tonyMessage) return;
    if (tonyMessage === "welcome") {
      localStorage.setItem(tonyWelcomeStorageKey(tonyProfile), "read");
    } else {
      localStorage.setItem(tonySeasonalStorageKey(new Date().getFullYear()), "read");
    }
    setTonyMessage(null);
  }

  function confirmAlphaNotice() {
    markAlphaTestingNoticeSeen();
    setShowAlphaNotice(false);
  }

  async function testCrewVoicePreview(role: Parameters<typeof resolveCrewVoicePreview>[0], locale: Parameters<typeof resolveCrewVoicePreview>[1]) {
    const preview = resolveCrewVoicePreview(role, locale);
    if (!preview) return;

    await speechService.speak(preview.text, {
      ...preview.options,
      speaker: role === "science" ? "Anna" : role === "navigation" ? "Willi" : "OGG",
      locale,
    });
  }

  const shipStatus = resolveShipStatus(snapshot, isLoading, t);
  const shipContext = resolveShipContext(snapshot, t);
  const profileMeta = formatCurrentJumpRange(
    selectDisplayedCurrentJumpRange(snapshot),
    language,
  );

  const dashboard = (
    <>
        <Dashboard
        commander={
          isLoading
            ? t("loading")
            : activeCommander ?? t("unknown")
        }
        system={
          isLoading
            ? t("loading")
            : snapshot?.system ?? t("unknown")
        }
        status={shipStatus.label}
        statusTone={shipStatus.tone}
        profileMeta={profileMeta}
        contextLabel={shipContext?.label ?? null}
        contextValue={shipContext?.value ?? null}
      />
    </>
  );

  function renderPage() {
    switch (page) {
      case "navigation":
        return (
          <Navigation
            progress={snapshot?.navigationProgress ?? null}
          />
        );

      case "settings":
        return (
          <section className="settings-layout">
            <div className="settings-module">
              <PlaceholderPage title={t("moduleSettings")} />
            </div>
            <div className="settings-computer">
              <AssistantPanel
                name={bordcomputerName}
                onConfigureCrew={() => setShowCrewConfig(true)}
                onRename={() => setShowSetup(true)}
              />
            </div>
            <div className="settings-language">
              <LanguageSettings />
            </div>
            <div className="settings-journal">
              <JournalPanel
                journalPath={snapshot?.journalPath ?? ""}
                onRefresh={() => void loadEliteSnapshot()}
                onOpenFolder={() => void invoke("open_journal_directory")}
                showPath
              />
            </div>
            {tonyProfile && <div className="settings-tony"><TonyAbout onOpenWelcome={() => setTonyMessage("welcome")} /></div>}
          </section>
        );

      case "dashboard":
      default:
        return dashboard;
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={(nextPage) => setPage(nextPage as Page)}
      />

      {showAlphaNotice && <AlphaTestingNotice language={language} onConfirm={confirmAlphaNotice} />}

      <main className="content">
        <OggBrand journalState={journalError ? "error" : isLoading ? "initializing" : "normal"} />
        <TopBar
          title={
            page === "navigation"
              ? t("navigation")
              : page === "settings"
                ? t("settings")
                : t("commandCenter")
          }
        />

        {renderPage()}

        <footer>
          {t("footer")}
        </footer>
      </main>
      {appVersion && <span className="app-version">v{appVersion}</span>}

      {showSetup && (
        <div className="modal-backdrop">
          <div className="modal-dialog">
            <BordcomputerSetup
              initialName={bordcomputerName ?? ""}
              onSave={saveBordcomputerName}
              onCancel={() => setShowSetup(false)}
            />
          </div>
        </div>
      )}
      {showCrewConfig && (
        <CrewConfigDialog
          selections={crewSelections}
          onSelectionsChange={setCrewSelections}
          onTestVoicePreview={testCrewVoicePreview}
          onClose={() => setShowCrewConfig(false)}
        />
      )}
      {availableUpdate && <UpdateDialog version={availableUpdate.version} phase={updatePhase} error={updateError} onDismiss={dismissUpdateNotice} />}
      {startupHealth && !startupHealth.ready && <StartupRecoveryDialog health={startupHealth} onHealthChange={(health) => setStartupHealth(health.ready ? null : health)} />}
      {tonyProfile && tonyMessage && !showSetup && !availableUpdate && <TonyMessageDialog profile={tonyProfile} type={tonyMessage} onContinue={closeTonyMessage} />}
    </div>
  );
}

export default App;
