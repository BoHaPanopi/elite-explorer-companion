type SidebarProps = {
  page: string;
  setPage: (page: string) => void;
};

export default function Sidebar({ page, setPage }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">EEC</span>

        <div>
          <strong>Elite Explorer Companion</strong>
          <small>Navigations- und Expeditionszentrale</small>
        </div>
      </div>

      <nav>
        <button
          className={page === "dashboard" ? "active" : ""}
          onClick={() => setPage("dashboard")}
        >
          Dashboard
        </button>

        <button
          className={page === "navigation" ? "active" : ""}
          onClick={() => setPage("navigation")}
        >
          Navigation
        </button>

        <button
          className={page === "explorer" ? "active" : ""}
          onClick={() => setPage("explorer")}
        >
          Explorer
        </button>

        <button
          className={page === "bio" ? "active" : ""}
          onClick={() => setPage("bio")}
        >
          Exobiologie
        </button>

        <button
          className={page === "commander" ? "active" : ""}
          onClick={() => setPage("commander")}
        >
          Commander
        </button>

        <button
          className={page === "settings" ? "active" : ""}
          onClick={() => setPage("settings")}
        >
          Einstellungen
        </button>
      </nav>
    </aside>
  );
}