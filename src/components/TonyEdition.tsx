import {
  getTonyWelcomeMessage,
  seasonalMessage,
  type TonyMessageType,
  type TonyProfile,
} from "../features/tonyEdition";

type DialogProps = {
  profile: TonyProfile;
  type: TonyMessageType;
  onContinue: () => void;
};

export function TonyMessageDialog({ profile, type, onContinue }: DialogProps) {
  const message = type === "seasonal" ? seasonalMessage : getTonyWelcomeMessage(profile);
  const title = type === "seasonal" ? "Seasonal Reminder" : "Tony's Welcome Message";

  return <div className="modal-backdrop tony-backdrop"><section className="panel modal-dialog tony-dialog" role="dialog" aria-modal="true" aria-labelledby="tony-message-title">
    <header className="tony-dialog__brand"><span>OGG</span><strong id="tony-message-title">{title}</strong></header>
    <div className="tony-dialog__message">{message}</div>
    <button type="button" className="primary-action" onClick={onContinue}>Continue</button>
  </section></div>;
}

type AboutProps = { onOpenWelcome: () => void };

export function TonyAbout({ onOpenWelcome }: AboutProps) {
  return <section className="panel tony-about">
    <div><span>About OGG</span><h2>Tony's Welcome Message</h2></div>
    <button type="button" onClick={onOpenWelcome}>Open Message</button>
  </section>;
}
