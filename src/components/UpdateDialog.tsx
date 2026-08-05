import { useI18n } from "../i18n";

export type UpdatePhase = "downloading" | "ready" | "installing" | "error";

type Props = { version: string; phase: UpdatePhase; error: string | null; onDismiss: () => void };

export default function UpdateDialog({ version, phase, error, onDismiss }: Props) {
  const { t } = useI18n();
  if (phase === "downloading") return null;
  return <aside className={`panel update-ready-notice update-ready-notice--${phase}`} aria-live="polite">
    <div><strong>{phase === "ready" ? t("updateReady") : phase === "installing" ? t("updateInstalling") : t("updateFailed")}</strong>{phase === "ready" && <span>{t("updateReadyVersion", { version })}</span>}{error && <span className="update-error">{error}</span>}</div>
    {phase !== "installing" && <button type="button" onClick={onDismiss}>{t("dismiss")}</button>}
  </aside>;
}
