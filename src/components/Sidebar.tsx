type SidebarProps = {
  page: string;
  setPage: (page: string) => void;
};

const navigationItems = [
  ["dashboard", "Dashboard"],
  ["navigation", "Navigation"],
  ["explorer", "Explorer"],
  ["bio", "Exobiologie"],
  ["commander", "Commander"],
  ["crew", "Crew"],
  ["settings", "Einstellungen"],
] as const;

export default function Sidebar({
  page,
  setPage,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">OGG</span>

        <div>
          <strong>Old Guy of Grumpy</strong>
          <small>The Elite Dangerous Cockpit Companion</small>
        </div>
      </div>

      <nav>
        {navigationItems.map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={page === id ? "active" : ""}
            onClick={() => setPage(id)}
          >
            {label}
          </button>
        ))}
      </nav>
    </aside>
  );
}
