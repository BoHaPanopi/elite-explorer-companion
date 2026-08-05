import {
  getTonyWelcomeMessage,
  seasonalMessage,
  type TonyMessageType,
  type TonyProfile,
} from "../features/tonyEdition";
import { useI18n } from "../i18n";

type DialogProps = {
  profile: TonyProfile;
  type: TonyMessageType;
  onContinue: () => void;
};

export function TonyMessageDialog({ profile, type, onContinue }: DialogProps) {
  const { t } = useI18n();
  const message = type === "seasonal" ? seasonalMessage : getTonyWelcomeMessage(profile);
  const title = type === "seasonal" ? t("seasonalReminder") : t("tonyWelcomeMessage");

  return <div className="modal-backdrop tony-backdrop"><section className="panel modal-dialog tony-dialog" role="dialog" aria-modal="true" aria-labelledby="tony-message-title">
    <header className="tony-dialog__brand"><span>OGG</span><strong id="tony-message-title">{title}</strong></header>
    <div className="tony-dialog__message">{message}</div>
    <button type="button" className="primary-action" onClick={onContinue}>{t("continue")}</button>
  </section></div>;
}

type AboutProps = { onOpenWelcome: () => void };

export function TonyAbout({ onOpenWelcome }: AboutProps) {
  const { t } = useI18n();
  return <section className="panel tony-about">
    <div><span>{t("aboutOgg")}</span><h2>{t("tonyWelcomeMessage")}</h2></div>
    <button type="button" onClick={onOpenWelcome}>{t("openMessage")}</button>
  </section>;
}
