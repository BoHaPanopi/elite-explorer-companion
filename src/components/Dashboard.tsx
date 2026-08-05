import { useI18n } from "../i18n";

type DashboardProps = { commander: string; system: string; status: string };

export default function Dashboard({ commander, system, status }: DashboardProps) {
  const { t } = useI18n();
  const statusTone = status === t("inFlight") ? "flight" : status === t("docked") ? "docked" : "idle";
  return <section className="dashboard-overview" aria-labelledby="command-center-title">
    <header className="dashboard-hero"><div className="command-identity"><span className="dashboard-kicker">CMDR</span><h2 id="command-center-title">{commander}</h2><div className="command-system"><span>{t("currentSystem")}</span><strong>{system}</strong></div></div>
      <div className="command-center-status"><div className="command-center-status__item"><span>{t("activeProfile")}</span><strong>{t("expedition")}</strong></div><div className="command-center-status__item"><span>{t("shipStatus")}</span><div className={`dashboard-flight-state dashboard-flight-state--${statusTone}`}><i aria-hidden="true" /><strong>{status}</strong></div></div></div>
    </header>
  </section>;
}
