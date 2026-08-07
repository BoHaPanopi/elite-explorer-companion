import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getVersion } from "@tauri-apps/api/app";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { exit } from "@tauri-apps/plugin-process";

import "./App.css";
import AssistantPanel from "./components/AssistantPanel";
import BordcomputerSetup from "./components/BordcomputerSetup";
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
import { speechService } from "./services/SpeechService";
import { downloadUpdateInBackground, installDownloadedUpdateOnExit } from "./services/DeferredUpdateService";
import { createStartupGreeting } from "ogg-core";
import { createExplorationMessage, type ExplorationObservationKind } from "ogg-core";
import { createTonyStartupGreeting, isTonySeason, resolveOggMode, selectCommanderIdentity, tonySeasonalStorageKey, tonyWelcomeStorageKey, type TonyMessageType } from "./features/tonyEdition";

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
    } | null;
  };
  journalPath: string;
  navigationProgress: NavigationProgress;
};

type UpdateReadiness = {
  ready: boolean;
  blocker: "voice_server_running" | "voice_server_locked" | "another_ogg_instance" | "installer_running" | "voice_server_missing" | null;
};

type StartupGreetingState = "idle" | "scheduled" | "playing" | "completed";

const BORDCOMPUTER_NAME_KEY = "eec.bordcomputerName";
let updateCheckStartedForSession = false;
let updateNoticeDismissedForSession = false;
const LAST_COCKPIT_SESSION_KEY = "eec.lastCockpitSession";
const LAST_KNOWN_COMMANDER_KEY = "eec.lastKnownCommander";
const RETURNING_AFTER_MS = 30 * 60 * 1000;

function PlaceholderPage({
  title,
}: {
  title: string;
}) {
  const { t } = useI18n();
  return (
    <section className="panel module-settings-panel">
      <span>{t("module")}</span>
      <h2>{title}</h2>
      <button type="button" disabled>{t("moduleHint")}</button>
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
  const explorationBaselineReady = useRef(false);
  const lastExplorationObservation = useRef<string | null>(null);
  const activeCommander = selectCommanderIdentity(snapshot?.commander, lastKnownCommander);
  const oggMode = resolveOggMode(activeCommander, language);
  const { language: oggLanguage, mode: languageMode, tonyProfile } = oggMode;

  const loadEliteSnapshot = useCallback(async () => {
    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot", { locale: language });
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
      if (!update || updatePhaseRef.current !== "ready") return;

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
        );
        pendingUpdate.current = null;
        void invoke("log_update_phase", { phase: "install_started", cause: "application_exit", technical: null });
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
    } else {
      setShowSetup(true);
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

    if (!explorationBaselineReady.current) {
      explorationBaselineReady.current = true;
      lastExplorationObservation.current = observation?.id ?? null;
      return;
    }

    if (!observation || observation.id === lastExplorationObservation.current) return;
    lastExplorationObservation.current = observation.id;
    void speechService.speak(createExplorationMessage(observation.kind, oggLanguage)).catch((error) => {
      console.error(oggLanguage === "en" ? "Exploration voice output failed:" : "Explorations-Sprachausgabe fehlgeschlagen:", error);
    });
  }, [isLoading, oggLanguage, snapshot?.exploration.latestObservation]);

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
        await speechService.speak(greetingText, { preRollMs: 650 });
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
    [activeCommander, bordcomputerName, language, tonyProfile],
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
        const serverReady = await speechService.waitUntilReady(30_000);
        if (cancelled) return;
        if (!serverReady) {
          startupGreetingState.current = "idle";
          void invoke("log_audio_event", {
            event: "startup_greeting_suppressed",
            technical: "reason=voice_server_not_ready retryMs=1000",
          });
          window.setTimeout(() => setGreetingRetryNonce((value) => value + 1), 1000);
          return;
        }

        void invoke("log_audio_event", {
          event: "startup_voice_server_ready",
          technical: "health=ok",
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
        status={isLoading ? t("loading") : !snapshot?.eliteConnected ? t("eliteDisconnected") : snapshot.docked === true ? t("docked") : snapshot.docked === false ? t("inFlight") : t("unknown")}
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
            <div className="settings-language"><LanguageSettings /></div>
            <div className="settings-journal">
            <JournalPanel
              journalPath={snapshot?.journalPath ?? ""}
              onRefresh={() => void loadEliteSnapshot()}
              onOpenFolder={() => void invoke("open_journal_directory")}
              showPath
            />
            </div>
            <div className="settings-computer">
            <AssistantPanel
              name={bordcomputerName}
              onTestGreeting={() => {
                speechService.logTestButtonClick();
                void speakGreeting(true);
              }}
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

      <main className="content">
        <OggBrand journalState={journalError ? "error" : isLoading ? "initializing" : "normal"} />
        {page !== "dashboard" && (
          <TopBar
            title={page === "navigation" ? t("navigation") : t("settings")}
          />
        )}

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
              onCancel={
                bordcomputerName
                  ? () => setShowSetup(false)
                  : undefined
              }
            />
          </div>
        </div>
      )}
      {availableUpdate && <UpdateDialog version={availableUpdate.version} phase={updatePhase} error={updateError} onDismiss={dismissUpdateNotice} />}
      {startupHealth && !startupHealth.ready && <StartupRecoveryDialog health={startupHealth} onHealthChange={(health) => setStartupHealth(health.ready ? null : health)} />}
      {tonyProfile && tonyMessage && !showSetup && !availableUpdate && <TonyMessageDialog profile={tonyProfile} type={tonyMessage} onContinue={closeTonyMessage} />}
    </div>
  );
}

export default App;
