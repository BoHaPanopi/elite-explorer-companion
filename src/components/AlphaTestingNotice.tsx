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

const DE_TITLE = "Alpha 0.14.12 – Testhinweise";
const EN_TITLE = "Alpha 0.14.12 – Testing Notes";

const DE_BODY = `Bitte testet in Alpha 0.14.12 besonders:

• neues Crew-Konfigurationslayout
• Auswahl + Kreis-Haken
• Willi in allen fünf Sprachen
• Anna in allen fünf Sprachen
• Stimmen im echten Elite-Betrieb
• Lautstärke, Verständlichkeit und Timing während des Spiels
• Auffälligkeiten/Fehler im normalen Betrieb

Hinweis:
Susanne und Bastian sind noch nicht Bestandteil dieses Voice-Tests.`;

const EN_BODY = `Please pay particular attention to the following in Alpha 0.14.12:

• new crew configuration layout
• selection + circle confirmation check
• Willi in all five languages
• Anna in all five languages
• voices during actual Elite gameplay
• volume, clarity, and timing during gameplay
• anomalies/errors during normal operation

Note:
Susanne and Bastian are not yet part of this voice test.`;

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
