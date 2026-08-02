type TopBarProps = {
  title: string;
};

export default function TopBar({ title }: TopBarProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Aktives Profil: Expedition</p>
        <h1>{title}</h1>
      </div>

      <button className="profile-button">
        Profil wechseln
      </button>
    </header>
  );
}