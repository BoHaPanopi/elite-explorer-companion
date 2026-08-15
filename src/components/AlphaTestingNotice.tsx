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

const DE_TITLE = "Alpha 0.14.20 – Testhinweise";
const EN_TITLE = "Alpha 0.14.20 – Testing Notes";

const DE_BODY = `Bitte testet in Alpha 0.14.20 besonders:

• das englische Sprachprofil für konfigurierte Commander
• die englische en-GB-Sprachausgabe mit Microsoft George
• die eindeutige Meldung bei fehlender englischer Stimme
• Auffälligkeiten/Fehler im normalen Betrieb

Hinweis:
Alle Journal- und Telemetriedaten bleiben lokal.`;

const EN_BODY = `Please pay particular attention to the following in Alpha 0.14.20:

• the English voice profile for configured commanders
• English en-GB speech with Microsoft George
• the clear status when the required English voice is unavailable
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
