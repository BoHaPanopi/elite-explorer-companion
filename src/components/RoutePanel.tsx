type RouteStep = {
  system: string;
};

type Props = {
  route: RouteStep[];
};

export default function RoutePanel({ route }: Props) {
  return (
    <article className="panel route-panel">
      <div className="panel-heading">
        <div>
          <span>Optimierte Systemroute</span>

          <h2>
            {route.length
              ? route
                  .slice(0, 4)
                  .map((step) => step.system)
                  .join(" → ")
              : "Keine Galaxieroute geplant"}
          </h2>
        </div>

        <button>Neu berechnen</button>
      </div>

      <div className="route-line">
        {route.length ? (
          route.slice(0, 4).map((step) => (
            <div className="route-node" key={step.system}>
              {step.system}
            </div>
          ))
        ) : (
          <p className="muted">
            Plotte im Spiel eine Route, damit sie hier erscheint.
          </p>
        )}
      </div>

      <p className="muted">
        Die Planetenroute wird im nächsten Entwicklungsschritt automatisch
        berechnet.
      </p>
    </article>
  );
}