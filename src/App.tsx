import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

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

function formatShip(snapshot: EliteSnapshot | null): string {
  if (!snapshot?.ship && !snapshot?.shipName) {
    return "Unbekannt";
  }

  if (snapshot.shipName && snapshot.ship) {
    return `${snapshot.shipName} · ${snapshot.ship}`;
  }

  return snapshot.shipName ?? snapshot.ship ?? "Unbekannt";
}

function App() {
  const [snapshot, setSnapshot] = useState<EliteSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalError, setJournalError] = useState<string | null>(null);

  const loadEliteSnapshot = useCallback(async () => {
    try {
      const result = await invoke<EliteSnapshot>("get_elite_snapshot");

      setSnapshot(result);
      setJournalError(null);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error);

      setJournalError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEliteSnapshot();

    const refreshInterval = window.setInterval(() => {
      void loadEliteSnapshot();
    }, 5000);

    return () => {
      window.clearInterval(refreshInterval);
    };
  }, [loadEliteSnapshot]);

  const connectionText = journalError
    ? "Journal nicht verbunden"
    : isLoading
      ? "Journal wird gesucht"
      : "Elite-Journal verbunden";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">EEC</span>

          <div>
            <strong>Elite Explorer Companion</strong>
            <small>Navigations- und Expeditionszentrale</small>
          </div>
        </div>

        <nav>
          <button className="active">Dashboard</button>
          <button>Navigation</button>
          <button>Explorer</button>
          <button>Exobiologie</button>
          <button>Expeditionen</button>
          <button>Commander</button>
          <button>Einstellungen</button>
        </nav>

        <div className="sidebar-footer">
          <span
            className={`status-dot ${
              journalError ? "status-dot-error" : "status-dot-connected"
            }`}
          />
          {connectionText}
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Aktives Profil: Expedition</p>
            <h1>Navigations- und Expeditionszentrale</h1>
          </div>

          <button className="profile-button">Profil wechseln</button>
        </header>

        <section className="status-grid">
          <article className="card">
            <span>Commander</span>
            <strong>
              {isLoading
                ? "Wird ermittelt …"
                : snapshot?.commander ?? "Nicht im Journal gefunden"}
            </strong>
          </article>

          <article className="card">
            <span>Aktuelles System</span>
            <strong>
              {isLoading
                ? "Wird ermittelt …"
                : snapshot?.system ?? "Nicht im Journal gefunden"}
            </strong>
          </article>

          <article className="card">
            <span>Schiff</span>
            <strong>
              {isLoading ? "Wird ermittelt …" : formatShip(snapshot)}
            </strong>
          </article>

          <article className="card">
            <span>Flugstatus</span>
            <strong>
              {snapshot?.docked === true
                ? "Angedockt"
                : snapshot?.docked === false
                  ? "Im Flug"
                  : "Unbekannt"}
            </strong>
          </article>
        </section>

        {journalError && (
          <section className="journal-error" role="alert">
            <strong>Journal konnte nicht gelesen werden</strong>
            <p>{journalError}</p>

            <button type="button" onClick={() => void loadEliteSnapshot()}>
              Erneut versuchen
            </button>
          </section>
        )}

        <section className="main-grid">
          <article className="panel route-panel">
            <div className="panel-heading">
              <div>
                <span>Optimierte Systemroute</span>
  <h2>
  {snapshot?.route.length
    ? snapshot.route
        .slice(0, 4)
        .map((step) => step.system)
        .join(" → ")
    : "Keine Galaxieroute geplant"}
</h2>
              </div>

              <button>Neu berechnen</button>
            </div>

          <div className="route-line">
  {snapshot?.route.length ? (
    snapshot.route.slice(0, 4).map((step, index) => (
      <div className="route-segment" key={`${step.system}-${index}`}>
        <div
          className={`route-node ${index === 0 ? "active-node" : ""}`}
          title={
            step.starClass
              ? `${step.system} · Sternklasse ${step.starClass}`
              : step.system
          }
        >
          {index + 1}
        </div>

        {index < Math.min(snapshot.route.length, 4) - 1 && (
          <span className="route-connector" />
        )}
      </div>
    ))
  ) : (
    <p className="muted">
      Plotte im Spiel eine Route, damit sie hier erscheint.
    </p>
  )}
</div>

            <p className="muted">
              Die Planetenroute wird im nächsten Entwicklungsschritt aus
              Scan- und Systemdaten berechnet.
            </p>
          </article>

          <article className="panel assistant-panel">
            <span>Bordcomputer</span>
            <h2>Noch nicht benannt</h2>

            <p>
              Sprachausgabe, Persönlichkeit und Aktivierungswort werden frei
              konfigurierbar.
            </p>

            <button>Einrichten</button>
          </article>
        </section>

        <section className="panel journal-panel">
          <span>Journalquelle</span>
          <h2>
            {snapshot?.journalPath
              ? "Journal erkannt"
              : "Keine Journaldatei erkannt"}
          </h2>

          <p className="journal-path">
            {snapshot?.journalPath ??
              "Die Anwendung sucht im Windows-Ordner für gespeicherte Spiele."}
          </p>

          <button type="button" onClick={() => void loadEliteSnapshot()}>
            Journal aktualisieren
          </button>
        </section>

        <footer>
          Mit Unterstützung künstlicher Intelligenz entwickelt. Beiträge werden
          menschlich geprüft und getestet.
        </footer>
      </main>
    </div>
  );

}
export default App;