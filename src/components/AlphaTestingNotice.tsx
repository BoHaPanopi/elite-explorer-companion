import type { Language } from "../i18n";
import {
  ALPHA_TESTING_NOTICE_VERSION,
  alphaTestingNoticeAlreadySeen,
  markAlphaTestingNoticeSeen,
} from "../features/alphaTestingNotice";

export { ALPHA_TESTING_NOTICE_VERSION, alphaTestingNoticeAlreadySeen, markAlphaTestingNoticeSeen };

type AlphaTestingNoticeProps = {
  language: Language;
  onConfirm: () => void;
};

const DE_TITLE = "Alpha 0.14.16 – Testhinweise";
const EN_TITLE = "Alpha 0.14.16 – Testing Notes";

const DE_BODY = `Bitte testet in Alpha 0.14.16 besonders:

• das neue Command Center und die profilabhängigen Ränge
• das aktuelle Schiff mit Name, Kennung und Darstellung
• Willi: lokale Navigation und letzte Reise
• den permanenten Datenflussstatus
• schnelle Telemetrie auch bei vielen lokalen Journalen
• Auffälligkeiten/Fehler im normalen Betrieb

Hinweis:
Alle Journal- und Telemetriedaten bleiben lokal.`;

const EN_BODY = `Please pay particular attention to the following in Alpha 0.14.16:

• the new Command Center and profile-dependent ranks
• the current ship with name, identifier, and display
• Willi: local navigation and last journey
• the permanent data-flow status
• fast telemetry with many local journals
• anomalies/errors during normal operation

Note:
All journal and telemetry data remains local.`;

const DE_BUTTON = "Verstanden – Alpha testen";
const EN_BUTTON = "Understood – Start Alpha Test";

export default function AlphaTestingNotice({ language, onConfirm }: AlphaTestingNoticeProps) {
  const isDE = language === "de";
  const title = isDE ? DE_TITLE : EN_TITLE;
  const body = isDE ? DE_BODY : EN_BODY;
  const buttonLabel = isDE ? DE_BUTTON : EN_BUTTON;

  return (
    <div className="modal-backdrop">
      <section
        className="panel modal-dialog alpha-notice-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="alpha-notice-title"
      >
        <header className="alpha-notice-dialog__header">
          <span>OGG</span>
          <strong id="alpha-notice-title">{title}</strong>
        </header>
        <pre className="alpha-notice-dialog__body">{body}</pre>
        <button type="button" className="primary-action" onClick={onConfirm}>
          {buttonLabel}
        </button>
      </section>
    </div>
  );
}
