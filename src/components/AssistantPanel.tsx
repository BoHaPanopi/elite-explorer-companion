type AssistantPanelProps = {
  name: string | null;
  onConfigure: () => void;
  onTestGreeting: () => void;
};

export default function AssistantPanel({
  name,
  onConfigure,
  onTestGreeting,
}: AssistantPanelProps) {
  return (
    <article className="panel assistant-panel">
      <span>Bordcomputer</span>
      <h2>{name ?? "Noch nicht benannt"}</h2>

      <p>
        Deutsche Sprachausgabe, Persönlichkeit und Aktivierungswort werden
        hier eingerichtet.
      </p>

      <div className="assistant-actions">
        <button type="button" onClick={onTestGreeting} disabled={!name}>
          Begrüßung testen
        </button>

        <button type="button" onClick={onConfigure}>
          {name ? "Einstellungen öffnen" : "Jetzt einrichten"}
        </button>
      </div>
    </article>
  );
}
