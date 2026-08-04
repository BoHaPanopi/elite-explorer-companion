import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { check, type Update } from "@tauri-apps/plugin-updater";
import { relaunch } from "@tauri-apps/plugin-process";

import "./App.css";
import AssistantPanel from "./components/AssistantPanel";
import BordcomputerSetup from "./components/BordcomputerSetup";
import Dashboard from "./components/Dashboard";
import JournalPanel from "./components/JournalPanel";
import LanguageSettings from "./components/LanguageSettings";
import Navigation from "./components/Navigation";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import UpdateDialog, { type UpdatePhase } from "./components/UpdateDialog";
import { useI18n } from "./i18n";
import { speechService } from "./services/SpeechService";
import { createStartupGreeting } from "./voices/greetings";

type Page =
  | "dashboard"
  | "navigation"
  | "settings";

type RouteStep = {
  system: string;
  starClass: string | null;
  position: [number, number, number] | null;
};

type EliteSnapshot = {
  commander: string | null;
  system: string | null;
  ship: string | null;
  shipName: string | null;
  docked: boolean | null;
  journalPath: string;
  route: RouteStep[];
};

const BORDCOMPUTER_NAME_KEY = "eec.bordcomputerName";
const LAST_COCKPIT_SESSION_KEY = "eec.lastCockpitSession";
const RETURNING_AFTER_MS = 30 * 60 * 1000;

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  const { t } = useI18n();
  return (
    <section className="panel">
      <span>{t("module")}</span>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
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
  const [updatePhase, setUpdatePhase] = useState<UpdatePhase>("available");
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const greetingPlayed = useRef(false);

  const loadEliteSnapshot = useCallback(async () => {
    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot", { locale: language });
      setSnapshot(result);
      setJournalError(null);
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  }, [language]);

  useEffect(() => {
    let active = true;
    void check().then((update) => { if (active && update) setAvailableUpdate(update); }).catch((error) => console.error(language === "en" ? "Update check failed:" : "Update-Prüfung fehlgeschlagen:", error));
    return () => { active = false; };
  }, [language]);

  async function installUpdate() {
    if (!availableUpdate) return;
    setUpdatePhase("downloading");
    setUpdateProgress(0);
    setUpdateError(null);
    let downloaded = 0;
    let total: number | undefined;
    try {
      await availableUpdate.download((event) => {
        if (event.event === "Started") {
          total = event.data.contentLength;
          downloaded = 0;
        } else if (event.event === "Progress") {
          downloaded += event.data.chunkLength;
          if (total && total > 0) setUpdateProgress(downloaded / total);
        } else {
          setUpdateProgress(1);
        }
      });
      setUpdateProgress(1);
      setUpdatePhase("installing");
      await availableUpdate.install();
      setUpdatePhase("restarting");
      await new Promise((resolve) => window.setTimeout(resolve, 900));
      await relaunch();
    } catch (error) {
      setUpdateError(error instanceof Error ? error.message : String(error));
      setUpdatePhase("error");
    }
  }

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

  const speakGreeting = useCallback(
    async (forceReturning?: boolean) => {
      if (!bordcomputerName || !snapshot?.commander) return;

      const lastSession = Number(
        localStorage.getItem(LAST_COCKPIT_SESSION_KEY) ?? "0",
      );

      const isReturning =
        forceReturning ??
        (lastSession > 0 &&
          Date.now() - lastSession >= RETURNING_AFTER_MS);

      const greeting = createStartupGreeting({
        bordcomputerName,
        commanderName: snapshot.commander,
        isReturning,
      });

      localStorage.setItem(
        LAST_COCKPIT_SESSION_KEY,
        String(Date.now()),
      );

      try {
        await speechService.speakSequence(greeting, 650);
      } catch (error) {
        console.error(language === "en" ? "Voice output failed:" : "Sprachausgabe fehlgeschlagen:", error);
      }
    },
    [bordcomputerName, language, snapshot?.commander],
  );

  useEffect(() => {
    if (
      greetingPlayed.current ||
      showSetup ||
      !bordcomputerName ||
      !snapshot?.commander
    ) {
      return;
    }

    greetingPlayed.current = true;

    const timerId = window.setTimeout(() => {
      void speakGreeting();
    }, 900);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [
    bordcomputerName,
    showSetup,
    snapshot?.commander,
    speakGreeting,
  ]);

  function saveBordcomputerName(name: string) {
    localStorage.setItem(BORDCOMPUTER_NAME_KEY, name);
    setBordcomputerName(name);
    setShowSetup(false);
    greetingPlayed.current = false;
  }

  const dashboard = (
    <>
      <Dashboard
        commander={
          isLoading
            ? t("loading")
            : snapshot?.commander ?? t("unknown")
        }
        system={
          isLoading
            ? t("loading")
            : snapshot?.system ?? t("unknown")
        }
        status={isLoading ? t("loading") : snapshot?.docked === true ? t("docked") : snapshot?.docked === false ? t("inFlight") : t("unknown")}
        journalState={journalError ? "error" : isLoading ? "initializing" : "normal"}
        onRefreshJournal={() => void loadEliteSnapshot()}
      />
    </>
  );

  function renderPage() {
    switch (page) {
      case "navigation":
        return (
          <Navigation
            currentSystem={snapshot?.system ?? null}
            route={snapshot?.route ?? []}
          />
        );

      case "settings":
        return (
          <section className="settings-layout">
            <PlaceholderPage
              title={t("settings")}
              description={t("settingsDescription")}
            />
            <LanguageSettings />
            <JournalPanel
              journalPath={snapshot?.journalPath ?? ""}
              onRefresh={() => void loadEliteSnapshot()}
              showPath
            />
            <AssistantPanel
              name={bordcomputerName}
              onConfigure={() => setShowSetup(true)}
              onTestGreeting={() => void speakGreeting(true)}
            />
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
        {page !== "dashboard" && (
          <TopBar
            title={page === "navigation" ? t("navigation") : t("settings")}
            bordcomputerName={bordcomputerName}
            onConfigure={() => setShowSetup(true)}
            onTestGreeting={() => void speakGreeting(true)}
          />
        )}

        {renderPage()}

        <footer>
          {t("footer")}
        </footer>
      </main>

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
      {availableUpdate && <UpdateDialog version={availableUpdate.version} notes={availableUpdate.body} phase={updatePhase} progress={updateProgress} error={updateError} onInstall={() => void installUpdate()} onDismiss={() => setAvailableUpdate(null)} />}
    </div>
  );
}

export default App;
