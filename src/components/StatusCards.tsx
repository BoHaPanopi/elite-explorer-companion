type EliteSnapshot = {
  commander: string | null;
  system: string | null;
  ship: string | null;
  shipName: string | null;
  docked: boolean | null;
};

type Props = {
  snapshot: EliteSnapshot | null;
  isLoading: boolean;
};

function formatShip(snapshot: EliteSnapshot | null) {
  if (!snapshot?.ship && !snapshot?.shipName) {
    return "Unbekannt";
  }

  if (snapshot.ship && snapshot.shipName) {
    return `${snapshot.shipName} · ${snapshot.ship}`;
  }

  return snapshot.shipName ?? snapshot.ship ?? "Unbekannt";
}

export default function StatusCards({
  snapshot,
  isLoading,
}: Props) {
  return (
    <section className="status-grid">
      <article className="card">
        <span>Commander</span>
        <strong>
          {isLoading
            ? "Wird ermittelt…"
            : snapshot?.commander ?? "Unbekannt"}
        </strong>
      </article>

      <article className="card">
        <span>Aktuelles System</span>
        <strong>
          {isLoading
            ? "Wird ermittelt…"
            : snapshot?.system ?? "Unbekannt"}
        </strong>
      </article>

      <article className="card">
        <span>Schiff</span>
        <strong>
          {isLoading
            ? "Wird ermittelt…"
            : formatShip(snapshot)}
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
  );
}