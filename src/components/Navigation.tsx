import { useI18n } from "../i18n";

type RouteStep = {
  system: string;
  starClass: string | null;
  position: [number, number, number] | null;
};

type NavigationProps = {
  currentSystem: string | null;
  route: RouteStep[];
};

const fuelStars = new Set(["O", "B", "A", "F", "G", "K", "M"]);

function isFuelStar(starClass: string | null): boolean {
  if (!starClass) {
    return false;
  }

  return fuelStars.has(starClass.toUpperCase());
}

function distanceBetween(
  start: [number, number, number] | null,
  end: [number, number, number] | null,
): number | null {
  if (!start || !end) {
    return null;
  }

  const [x1, y1, z1] = start;
  const [x2, y2, z2] = end;

  return Math.sqrt(
    (x2 - x1) ** 2 +
      (y2 - y1) ** 2 +
      (z2 - z1) ** 2,
  );
}

function calculateRouteDistance(route: RouteStep[]): number | null {
  if (route.length < 2) {
    return null;
  }

  let total = 0;

  for (let index = 1; index < route.length; index += 1) {
    const distance = distanceBetween(
      route[index - 1].position,
      route[index].position,
    );

    if (distance === null) {
      return null;
    }

    total += distance;
  }

  return total;
}

export default function Navigation({
  currentSystem,
  route,
}: NavigationProps) {
  const { t } = useI18n();
  const nextSystem = route.length > 1 ? route[1] : null;
  const destination = route.at(-1) ?? null;
  const remainingJumps = Math.max(route.length - 1, 0);
  const totalDistance = calculateRouteDistance(route);

  return (
    <section className="navigation-page">
      <div className="navigation-summary">
        <article className="card">
          <span>{t("currentSystem")}</span>
          <strong>{currentSystem ?? t("unknown")}</strong>
        </article>

        <article className="card">
          <span>{t("nextJump")}</span>
          <strong>{nextSystem?.system ?? t("noRoute")}</strong>
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
