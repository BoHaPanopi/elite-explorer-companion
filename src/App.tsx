import "./App.css";

function App() {
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
          <span className="status-dot" />
          Warte auf Elite Dangerous
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
            <strong>Noch nicht erkannt</strong>
          </article>

          <article className="card">
            <span>Aktuelles System</span>
            <strong>Keine Journal-Daten</strong>
          </article>

          <article className="card">
            <span>Schiff</span>
            <strong>Unbekannt</strong>
          </article>

          <article className="card">
            <span>Aktive Route</span>
            <strong>Keine Route geplant</strong>
          </article>
        </section>

        <section className="main-grid">
          <article className="panel route-panel">
            <div className="panel-heading">
              <div>
                <span>Optimierte Systemroute</span>
                <h2>A5 → A4 → A3 → B1</h2>
              </div>
              <button>Neu berechnen</button>
            </div>

            <div className="route-line">
              <div className="route-node active-node">A5</div>
              <span />
              <div className="route-node">A4</div>
              <span />
              <div className="route-node">A3</div>
              <span />
              <div className="route-node">B1</div>
            </div>

            <p className="muted">
              Platzhalterdaten – später automatisch aus den Elite-Journaldateien.
            </p>
          </article>

          <article className="panel assistant-panel">
            <span>Bordcomputer</span>
            <h2>Noch nicht benannt</h2>
            <p>
              Sprachausgabe, Persönlichkeit und Aktivierungswort werden später
              frei konfigurierbar.
            </p>
            <button>Einrichten</button>
          </article>
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