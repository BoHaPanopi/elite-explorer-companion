import { useI18n } from "../i18n";

type DashboardProps = { commander: string; system: string; status: string; journalState: "normal" | "initializing" | "error"; onRefreshJournal: () => void };

export default function Dashboard({ commander, system, status, journalState, onRefreshJournal }: DashboardProps) {
  const { t } = useI18n();
  const statusTone = status === t("inFlight") ? "flight" : status === t("docked") ? "docked" : "idle";
  const systemStatus = journalState === "normal" ? t("ready") : journalState === "initializing" ? t("initializing") : t("error");
  return <section className="dashboard-overview" aria-labelledby="command-center-title">
    <header className="command-brand"><div className={`command-brand__logo command-brand__logo--${journalState}`} aria-label={`OGG system status: ${systemStatus}`}><svg className="command-brand__track" viewBox="0 0 62 62" aria-hidden="true" focusable="false"><rect x="0.5" y="0.5" width="61" height="61" rx="16.5" pathLength="100" /></svg><span>OGG</span></div><strong>Old Guy of Grumpy</strong><span>The Elite Dangerous Cockpit Companion</span></header>
    <header className="dashboard-hero"><div className="command-identity"><span className="dashboard-kicker">CMDR</span><h2 id="command-center-title">{commander}</h2><div className="command-system"><span>{t("currentSystem")}</span><strong>{system}</strong></div></div>
      <div className="command-center-status"><div className="command-center-status__item"><span>{t("activeProfile")}</span><strong>{t("expedition")}</strong></div><div className="command-center-status__item"><span>{t("shipStatus")}</span><div className={`dashboard-flight-state dashboard-flight-state--${statusTone}`}><i aria-hidden="true" /><strong>{status}</strong></div></div></div>
    </header><button className={`journal-refresh journal-refresh--${journalState}`} type="button" onClick={onRefreshJournal}>{t("refreshJournal")}</button>
  </section>;
}
