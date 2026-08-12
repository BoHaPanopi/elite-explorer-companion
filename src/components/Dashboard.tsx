import { useI18n } from "../i18n";

type DashboardProps = {
  commander: string;
  system: string;
  status: string;
  statusTone: "flight" | "docked" | "landed" | "idle";
  profileMeta: string | null;
  contextLabel: string | null;
  contextValue: string | null;
};

export default function Dashboard({ commander, system, status, statusTone, profileMeta, contextLabel, contextValue }: DashboardProps) {
  const { t } = useI18n();
  return <section className="dashboard-overview" aria-labelledby="command-center-title">
    <header className="dashboard-hero"><div className="command-identity"><span className="dashboard-kicker">CMDR</span><h2 id="command-center-title">{commander}</h2><div className="command-system"><span>{t("currentSystem")}</span><strong>{system}</strong></div></div>
      <div className="command-center-status"><div className="command-center-status__item"><span>{t("activeProfile")}</span><strong>{t("expedition")}</strong>{profileMeta ? <small className="command-center-status__meta">{profileMeta}</small> : null}</div><div className="command-center-status__item"><span>{t("shipStatus")}</span><div className={`dashboard-flight-state dashboard-flight-state--${statusTone}`}><i aria-hidden="true" /><strong>{status}</strong></div>{contextLabel && contextValue ? <div className="command-center-status__detail"><span>{contextLabel}</span><strong>{contextValue}</strong></div> : null}</div></div>
    </header>
  </section>;
}
