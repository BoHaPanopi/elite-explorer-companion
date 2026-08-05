import { useI18n } from "../i18n";

type Props = {
  journalState: "normal" | "initializing" | "error";
};

export default function OggBrand({ journalState }: Props) {
  const { t } = useI18n();
  const systemStatus = journalState === "normal"
    ? t("ready")
    : journalState === "initializing"
      ? t("initializing")
      : t("error");

  return (
    <header className="command-brand">
      <div
        className={`command-brand__logo command-brand__logo--${journalState}`}
        aria-label={t("systemStatusLabel", { status: systemStatus })}
      >
        <svg className="command-brand__track" viewBox="0 0 62 62" aria-hidden="true" focusable="false">
          <rect x="0.5" y="0.5" width="61" height="61" rx="16.5" pathLength="100" />
        </svg>
        <span>OGG</span>
      </div>
      <strong>Old Guy of Grumpy</strong>
      <span>The Elite Dangerous Cockpit Companion</span>
    </header>
  );
}
