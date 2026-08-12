import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import {
  defaultCrewLocaleForUiLanguage,
  crewRoleLabels,
  crewRoleOrder,
  getCrewVariants,
  isCrewLocaleActive,
  persistCrewSelection,
  resolveCrewSelection,
  resolveCrewPortraitSource,
  type CrewLocale,
  type CrewRole,
  type CrewSelectionMap,
} from "../features/crewProfiles";
import { resolveCrewVoicePreview } from "../features/crewVoicePreview";

type CrewConfigDialogProps = {
  selections: CrewSelectionMap;
  onSelectionsChange: (next: CrewSelectionMap) => void;
  onTestVoicePreview: (role: CrewRole, locale: CrewLocale) => Promise<void>;
  onClose: () => void;
};

const localeLabels: Record<CrewLocale, string> = {
  de: "DE",
  uk: "UK",
  fr: "FR",
  it: "IT",
  es: "ES",
};

export default function CrewConfigDialog({
  selections,
  onSelectionsChange,
  onTestVoicePreview,
  onClose,
}: CrewConfigDialogProps) {
  const { language, t } = useI18n();
  const [activeRole, setActiveRole] = useState<CrewRole>("navigation");

  const activeMember = useMemo(
    () => resolveCrewSelection(activeRole, language, selections),
    [activeRole, language, selections],
  );
  const canPreviewActiveVoice =
    resolveCrewVoicePreview(activeRole, activeMember.locale) !== null;

  function selectLocale(role: CrewRole, locale: CrewLocale) {
    persistCrewSelection(role, locale);
    onSelectionsChange({
      ...selections,
      [role]: locale,
    });
  }

  function resetAllToUiLanguage() {
    const locale = defaultCrewLocaleForUiLanguage(language);
    const nextSelections: CrewSelectionMap = {};

    for (const role of crewRoleOrder) {
      persistCrewSelection(role, locale);
      nextSelections[role] = locale;
    }

    onSelectionsChange(nextSelections);
  }

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="modal-dialog crew-config-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="crew-config-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="crew-config-dialog__header">
          <div>
            <span>{t("onboardComputer")}</span>
            <h2 id="crew-config-title">{t("configureCrew")}</h2>
            <button
              className="crew-config-dialog__reset"
              type="button"
              onClick={resetAllToUiLanguage}
            >
              {t("crewResetToUiLanguage")}
            </button>
          </div>
          <button type="button" onClick={onClose}>
            {t("cancel")}
          </button>
        </header>

        <div className="crew-config-dialog__grid" role="list">
          {crewRoleOrder.map((role) => {
            const crewMember = resolveCrewSelection(role, language, selections);
            const portraitSource = resolveCrewPortraitSource(crewMember.portraitFileName);
            const isActive = role === activeRole;

            return (
              <article
                className={`crew-config-role${isActive ? " crew-config-role--active" : ""}`}
                key={role}
                role="listitem"
              >
                <button
                  className="crew-config-role__select"
                  type="button"
                  onClick={() => setActiveRole(role)}
                >
                  {portraitSource ? (
                    <img
                      className="crew-config-role__portrait"
                      src={portraitSource}
                      alt={crewMember.fullName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="crew-config-role__portrait crew-config-portrait--placeholder" aria-hidden="true" />
                  )}
                  <div className="crew-config-role__copy">
                    <span>{crewRoleLabels[role]}</span>
                    <strong>{crewMember.fullName}</strong>
                    <small>{crewMember.region}</small>
                  </div>
                </button>
              </article>
            );
          })}
        </div>

        <section className="crew-config-variants">
          <header className="crew-config-variants__header">
            {(() => {
              const portraitSource = resolveCrewPortraitSource(activeMember.portraitFileName);

              return portraitSource ? (
                <img
                  className="crew-config-variants__portrait"
                  src={portraitSource}
                  alt={activeMember.fullName}
                  loading="lazy"
                />
              ) : (
                <div className="crew-config-variants__portrait crew-config-portrait--placeholder" aria-hidden="true" />
              );
            })()}
            <div className="crew-config-variants__identity">
              <span>{crewRoleLabels[activeRole]}</span>
              <h3>{activeMember.fullName}</h3>
              <p>{activeMember.region}</p>
            </div>
            <button
              className="crew-config-variants__test-voice"
              type="button"
              disabled={!canPreviewActiveVoice}
              aria-label="Stimme testen"
              onClick={() => {
                if (!canPreviewActiveVoice) return;
                void onTestVoicePreview(activeRole, activeMember.locale);
              }}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M5 9v6h4l5 4V5L9 9H5z" />
                <path d="M17.5 8.5a1 1 0 0 1 1.4 0A5 5 0 0 1 20.4 12a5 5 0 0 1-1.5 3.5 1 1 0 0 1-1.4-1.4 3 3 0 0 0 .9-2.1 3 3 0 0 0-.9-2.1 1 1 0 0 1 0-1.4z" />
                <path d="M19.8 5.8a1 1 0 1 1 1.4-1.4A10 10 0 0 1 24 12a10 10 0 0 1-2.8 7.6 1 1 0 1 1-1.4-1.4A8 8 0 0 0 22 12a8 8 0 0 0-2.2-6.2z" />
              </svg>
              <span>Stimme testen</span>
            </button>
          </header>

          <div className="crew-config-variants__buttons">
            {getCrewVariants(activeRole).map((variant) => {
              const portraitSource = resolveCrewPortraitSource(variant.portraitFileName);
              const isActiveVariant = isCrewLocaleActive(
                activeRole,
                variant.locale,
                language,
                selections,
              );

              return (
                <button
                  className={`crew-variant-button${
                    isActiveVariant ? " crew-variant-button--selected" : ""
                  }`}
                  type="button"
                  key={variant.locale}
                  onClick={() => selectLocale(activeRole, variant.locale)}
                >
                  {portraitSource ? (
                    <img
                      className="crew-variant-button__portrait"
                      src={portraitSource}
                      alt={variant.fullName}
                      loading="lazy"
                    />
                  ) : (
                    <div className="crew-variant-button__portrait crew-config-portrait--placeholder" aria-hidden="true" />
                  )}
                  <div className="crew-variant-button__copy">
                    <span>{localeLabels[variant.locale]}</span>
                    <strong>{variant.fullName}</strong>
                    <small>OGG-Rufname: {variant.callSign}</small>
                  </div>
                  {isActiveVariant && (
                    <span className="crew-variant-button__check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
