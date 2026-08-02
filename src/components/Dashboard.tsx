type DashboardProps = {
  commander: string;
  system: string;
  ship: string;
  status: string;
};

export default function Dashboard({
  commander,
  system,
  ship,
  status,
}: DashboardProps) {
  return (
    <>
      <section className="status-grid">
        <article className="card">
          <span>Commander</span>
          <strong>{commander}</strong>
        </article>

        <article className="card">
          <span>Aktuelles System</span>
          <strong>{system}</strong>
        </article>

        <article className="card">
          <span>Schiff</span>
          <strong>{ship}</strong>
        </article>

        <article className="card">
          <span>Status</span>
          <strong>{status}</strong>
        </article>
      </section>
    </>
  );
}