import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";
import AssistantPanel from "./components/AssistantPanel";
import BordcomputerSetup from "./components/BordcomputerSetup";
import Dashboard from "./components/Dashboard";
import JournalPanel from "./components/JournalPanel";
import Navigation from "./components/Navigation";
import RoutePanel from "./components/RoutePanel";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import CrewPage from "./pages/CrewPage";
import { speechService } from "./services/SpeechService";
import { createStartupGreeting } from "./voices/greetings";

type Page =
  | "dashboard"
  | "navigation"
  | "explorer"
  | "bio"
  | "commander"
  | "crew"
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

function formatShip(snapshot: EliteSnapshot | null): string {
  if (!snapshot?.ship && !snapshot?.shipName) return "Unbekannt";

  if (snapshot.shipName && snapshot.ship) {
    return `${snapshot.shipName} · ${snapshot.ship}`;
  }

  return snapshot.shipName ?? snapshot.ship ?? "Unbekannt";
}

function formatStatus(snapshot: EliteSnapshot | null): string {
  if (snapshot?.docked === true) return "Angedockt";
  if (snapshot?.docked === false) return "Im Flug";
  return "Unbekannt";
}

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="panel">
      <span>Modul</span>
      <h2>{title}</h2>
      <p className="muted">{description}</p>
    </section>
  );
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [snapshot, setSnapshot] = useState<EliteSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalError, setJournalError] = useState<string | null>(null);
  const [bordcomputerName, setBordcomputerName] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const greetingPlayed = useRef(false);

  const loadEliteSnapshot = useCallback(async () => {
    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot");
      setSnapshot(result);
      setJournalError(null);
    } catch (error) {
      setJournalError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
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
        console.error("Sprachausgabe fehlgeschlagen:", error);
      }
    },
    [bordcomputerName, snapshot?.commander],
  );

  const speakIntroduction = useCallback(async () => {
    const computerName = bordcomputerName ?? "Old Guy of Grumpy";

    try {
      await speechService.speakSequence(
        [
          `Servus, Commander. I bin ${computerName}.`,
          "I red ned vui. Aber wenn i was sag, dann hat's meistens an Grund.",
          "A bissl was geht ollawei.",
        ],
        700,
        { rate: 0.92 },
      );
    } catch (error) {
      console.error("Vorstellung fehlgeschlagen:", error);
    }
  }, [bordcomputerName]);

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

  const assistantPanel = (
    <AssistantPanel
      name={bordcomputerName}
      onConfigure={() => setShowSetup(true)}
      onTestGreeting={() => void speakGreeting(true)}
    />
  );

  const dashboard = (
    <>
      <Dashboard
        commander={
          isLoading
            ? "Wird ermittelt …"
            : snapshot?.commander ?? "Unbekannt"
        }
        system={
          isLoading
            ? "Wird ermittelt …"
            : snapshot?.system ?? "Unbekannt"
        }
        ship={isLoading ? "Wird ermittelt …" : formatShip(snapshot)}
        status={isLoading ? "Wird ermittelt …" : formatStatus(snapshot)}
      />

      {journalError && (
        <section className="journal-error" role="alert">
          <strong>Journal konnte nicht gelesen werden</strong>
          <p>{journalError}</p>

          <button
            type="button"
            onClick={() => void loadEliteSnapshot()}
          >
            Erneut versuchen
          </button>
        </section>
      )}

      <section className="main-grid">
        <RoutePanel route={snapshot?.route ?? []} />
        {assistantPanel}
      </section>

      <JournalPanel
        journalPath={snapshot?.journalPath ?? ""}
        onRefresh={() => void loadEliteSnapshot()}
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

      case "explorer":
        return (
          <PlaceholderPage
            title="Explorer"
            description="Systemanalyse und wirtschaftlich optimierte Erkundungsroute."
          />
        );

      case "bio":
        return (
          <PlaceholderPage
            title="Exobiologie"
            description="Biologische Signale, Arten und Probenfortschritt."
          />
        );

      case "commander":
        return (
          <PlaceholderPage
            title="Commander"
            description="Ränge, Statistiken, Schiffe und Expeditionsdaten."
          />
        );

      case "crew":
        return (
          <CrewPage
            bordcomputerName={bordcomputerName ?? "Old Guy of Grumpy"}
            commanderName={snapshot?.commander ?? "Commander"}
            onRename={() => setShowSetup(true)}
            onTestGreeting={() => void speakGreeting(true)}
            onPlayIntroduction={() => void speakIntroduction()}
          />
        );

      case "settings":
        return (
          <section className="settings-layout">
            <PlaceholderPage
              title="Einstellungen"
              description="Sprache, Profile, VoiceAttack, Overlay und VR."
            />
            {assistantPanel}
          </section>
        );

      case "dashboard":
      default:
        return dashboard;
    }
  }

  const connectionText = journalError
    ? "Journal nicht verbunden"
    : isLoading
      ? "Journal wird gesucht"
      : "Elite-Journal verbunden";

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        setPage={(nextPage) => setPage(nextPage as Page)}
      />

      <main className="content">
        <TopBar title="Elite Explorer Companion" />
        <div className="connection-status">
          <span
            className={`status-dot ${
              journalError
                ? "status-dot-error"
                : "status-dot-connected"
            }`}
          />
          {connectionText}
        </div>

        {renderPage()}

        <footer>
           Elite Explorer Companion · Navigations- und Expeditionszentrale für Elite Dangerous
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
    </div>
  );
}

export default App;
