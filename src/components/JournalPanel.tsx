type Props = {
  journalPath: string;
  onRefresh: () => void;
};

export default function JournalPanel({
  journalPath,
  onRefresh,
}: Props) {
  return (
    <section className="panel journal-panel">
      <span>Journalquelle</span>

      <h2>
        {journalPath
          ? "Journal erkannt"
          : "Keine Journaldatei erkannt"}
      </h2>

      <p className="journal-path">
        {journalPath ||
          "Die Anwendung sucht im Windows-Ordner für gespeicherte Spiele."}
      </p>

      <button type="button" onClick={onRefresh}>
        Journal aktualisieren
      </button>
    </section>
  );
}