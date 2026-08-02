import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import AssistantPanel from "./components/AssistantPanel";
import Dashboard from "./components/Dashboard";
import JournalPanel from "./components/JournalPanel";
import Navigation from "./components/Navigation";
import RoutePanel from "./components/RoutePanel";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

type Page =
  | "dashboard"
  | "navigation"
  | "explorer"
  | "bio"
  | "commander"
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

type PlaceholderPageProps = {
  title: string;
  description: string;
};

function formatShip(snapshot: EliteSnapshot | null): string {
  if (!snapshot?.ship && !snapshot?.shipName) {
    return "Unbekannt";
  }

  if (snapshot.shipName && snapshot.ship) {
    return `${snapshot.shipName} · ${snapshot.ship}`;
  }

  return snapshot.shipName ?? snapshot.ship ?? "Unbekannt";
}

function formatFlightStatus(snapshot: EliteSnapshot | null): string {
  if (snapshot?.docked === true) {
    return "Angedockt";
  }

  if (snapshot?.docked === false) {
    return "Im Flug";
  }

  return "Unbekannt";
}

function PlaceholderPage({
  title,
  description,
}: PlaceholderPageProps) {
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

  const loadEliteSnapshot = useCallback(async () => {
    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot");

      setSnapshot(result);
      setJournalError(null);
    } catch (error) {
      setJournalError(
        error instanceof Error ? error.message : String(error),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEliteSnapshot();

    const intervalId = window.setInterval(() => {
      void loadEliteSnapshot();
    }, 5000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadEliteSnapshot]);

  const renderDashboard = () => (
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
        status={
          isLoading ? "Wird ermittelt …" : formatFlightStatus(snapshot)
        }
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
        <AssistantPanel />
      </section>

      <JournalPanel
        journalPath={snapshot?.journalPath ?? ""}
        onRefresh={() => void loadEliteSnapshot()}
      />
    </>
  );

  const renderPage = () => {
    switch (page) {
      case "navigation":
        return <Navigation />;

      case "explorer":
        return (
          <PlaceholderPage
            title="Explorer"
            description="Hier entstehen Systemanalyse, Körperübersicht und die wirtschaftlich optimierte Planetenreihenfolge."
          />
        );

      case "bio":
        return (
          <PlaceholderPage
            title="Exobiologie"
            description="Hier erscheinen biologische Signale, Arten, Probenfortschritt und geschätzte Werte."
          />
        );

      case "commander":
        return (
          <PlaceholderPage
            title="Commander"
            description="Hier erscheinen Ränge, Statistiken, Schiffe und Expeditionsdaten."
          />
        );

      case "settings":
        return (
          <PlaceholderPage
            title="Einstellungen"
            description="Hier werden Sprache, Farben, Profile, Bordcomputer und VR-Optionen eingerichtet."
          />
        );

      case "dashboard":
      default:
        return renderDashboard();
    }
  };

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
        <TopBar title="Navigations- und Expeditionszentrale" />

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
          Mit Unterstützung künstlicher Intelligenz entwickelt. Beiträge
          werden menschlich geprüft und getestet.
        </footer>
      </main>
    </div>
  );
}

export default App;