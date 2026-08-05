import { useI18n } from "../i18n";

export type UpdatePhase = "available" | "downloading" | "waitingForElite" | "waitingForServices" | "installing" | "restarting" | "error";

type Props = { version: string; notes?: string; phase: UpdatePhase; progress: number; error: string | null; onInstall: () => void; onDismiss: () => void };

export default function UpdateDialog({ version, notes, phase, progress, error, onInstall, onDismiss }: Props) {
  const { t } = useI18n();
  const isBusy = phase === "downloading" || phase === "waitingForElite" || phase === "waitingForServices" || phase === "installing" || phase === "restarting";
  const logoProgress = phase === "downloading" ? Math.max(0, Math.min(1, progress)) : 1;
  const statusText = phase === "downloading" ? t("updateDownloading") : phase === "installing" ? t("updateInstalling") : t("updateRestarting");

  return <div className="modal-backdrop update-backdrop"><section className={`panel modal-dialog update-dialog update-dialog--${phase}`} role="dialog" aria-modal="true" aria-labelledby="update-title" aria-busy={isBusy}>
    <header className="update-brand"><div className={`update-logo${phase === "installing" || phase === "restarting" ? " update-logo--active" : ""}`} aria-hidden="true"><div className="update-logo__base"><span>OGG</span></div><div className="update-logo__reveal" style={{ width: `${logoProgress * 100}%` }}><div className="update-logo__color"><span>OGG</span></div></div></div><strong>Old Guy of Grumpy</strong><span>The Elite Dangerous Cockpit Companion</span></header>
    {phase === "available" || phase === "error" ? <div className="update-content"><span className="dashboard-kicker">{t("updateAvailable")}</span><h2 id="update-title">{t("updateIntro", { version })}</h2><h3>{t("releaseNotes")}</h3><div className="update-notes">{notes?.trim() || t("noReleaseNotes")}</div>{error && <p className="update-error" role="alert">{t("updateFailed")}</p>}<div className="update-actions"><button type="button" onClick={onDismiss}>{t("later")}</button><button type="button" className="primary-action" onClick={onInstall}>{t("installRestart")}</button></div></div> : phase === "waitingForElite" || phase === "waitingForServices" ? <div className="update-progress-copy update-waiting" aria-live="polite"><h2 id="update-title">{phase === "waitingForElite" ? t("updateWaitingTitle") : t("updateServicesTitle")}</h2><p>{phase === "waitingForElite" ? t("updateWaitingBody") : t("updateServicesBody")}</p><button type="button" onClick={onDismiss}>{t("updateLater")}</button></div> : <div className="update-progress-copy" aria-live="polite"><h2 id="update-title">{statusText}</h2>{phase === "downloading" && <span>{Math.round(logoProgress * 100)}%</span>}</div>}
  </section></div>;
}
