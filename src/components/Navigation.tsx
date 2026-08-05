import { useI18n } from "../i18n";

type RouteStep = {
  system: string;
  starClass: string | null;
  position: [number, number, number] | null;
};

type NavigationProps = {
  progress: {
    currentSystem: string | null;
    nextSystem: string | null;
    remainingJumps: number;
    remainingDistance: number | null;
    activeRoute: RouteStep[];
  } | null;
};

const fuelStars = new Set(["O", "B", "A", "F", "G", "K", "M"]);

function isFuelStar(starClass: string | null): boolean {
  if (!starClass) {
    return false;
  }

  return fuelStars.has(starClass.toUpperCase());
}

export default function Navigation({
  progress,
}: NavigationProps) {
  const { t } = useI18n();
  const route = progress?.activeRoute ?? [];
  const currentSystem = progress?.currentSystem ?? null;
  const nextSystem = progress?.nextSystem ?? null;
  const destination = route.at(-1) ?? null;
  const remainingJumps = progress?.remainingJumps ?? 0;
  const totalDistance = progress?.remainingDistance ?? null;

  return (
    <section className="navigation-page">
      <div className="navigation-summary">
        <article className="card">
          <span>{t("currentSystem")}</span>
          <strong>{currentSystem ?? t("unknown")}</strong>
        </article>

        <article className="card">
          <span>{t("nextJump")}</span>
          <strong>{nextSystem ?? t("noRoute")}</strong>
        </article>

        <article className="card">
          <span>{t("destination")}</span>
          <strong>{destination?.system ?? t("noDestination")}</strong>
        </article>

        <article className="card">
          <span>{t("remainingJumps")}</span>
          <strong>{remainingJumps}</strong>
        </article>
      </div>

      <section className="panel navigation-route-panel">
        <div className="panel-heading">
          <div>
            <span>{t("plottedRoute")}</span>
            <h2>
              {totalDistance !== null
                ? t("remainingLy", { value: totalDistance.toFixed(1) })
                : t("distanceUnavailable")}
            </h2>
          </div>
        </div>

        {route.length ? (
          <ol className="navigation-route-list">
            {route.map((step, index) => {
              const fuelAvailable = isFuelStar(step.starClass);
              const isCurrent = index === 0;
              const isNext = index === 1;

              return (
                <li
                  className={`navigation-route-item ${
                    isCurrent ? "current-route-item" : ""
                  } ${isNext ? "next-route-item" : ""}`}
                  key={`${step.system}-${index}`}
                >
                  <div className="route-index">{index + 1}</div>

                  <div className="route-system-info">
                    <strong>{step.system}</strong>
                    <span>
                      {isCurrent
                        ? t("currentPosition")
                        : isNext
                          ? t("nextDestination")
                          : t("jump", { value: index })}
                    </span>
                  </div>

                  <div className="route-star-info">
                    <strong>{step.starClass ?? "?"}</strong>
                    <span
                      className={
                        fuelAvailable
                          ? "fuel-status fuel-available"
                          : "fuel-status fuel-unavailable"
                      }
                    >
                      {fuelAvailable ? t("scoopable") : t("notScoopable")}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="muted">
            {t("routeHint")}
          </p>
        )}
      </section>
    </section>
  );
}
