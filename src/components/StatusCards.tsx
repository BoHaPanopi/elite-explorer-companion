import { useI18n } from "../i18n";

type EliteSnapshot = {
  commander: string | null;
  system: string | null;
  ship: string | null;
  shipName: string | null;
  docked: boolean | null;
  shipState: "supercruise" | "normal_space" | "docked" | "landed" | null;
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

function formatShipStatus(
  snapshot: EliteSnapshot | null,
  t: (key: "docked" | "landed" | "supercruise" | "normalSpace" | "unknown") => string,
) {
  switch (snapshot?.shipState) {
    case "supercruise":
      return t("supercruise");
    case "normal_space":
      return t("normalSpace");
    case "docked":
      return t("docked");
    case "landed":
      return t("landed");
    default:
      return snapshot?.docked === true
        ? t("docked")
        : snapshot?.docked === false
          ? t("normalSpace")
          : t("unknown");
  }
}

export default function StatusCards({
  snapshot,
  isLoading,
}: Props) {
  const { t } = useI18n();

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
          {formatShipStatus(snapshot, t)}
        </strong>
      </article>
    </section>
  );
}