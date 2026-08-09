import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import {
  defaultCrewLocaleForUiLanguage,
  crewRoleLabels,
  crewRoleOrder,
  getCrewVariants,
  persistCrewSelection,
  resolveCrewSelection,
  resolveCrewPortraitSource,
  type CrewLocale,
  type CrewRole,
  type CrewSelectionMap,
} from "../features/crewProfiles";

type CrewConfigDialogProps = {
  selections: CrewSelectionMap;
  onSelectionsChange: (next: CrewSelectionMap) => void;
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
  onClose,
}: CrewConfigDialogProps) {
  const { language, t } = useI18n();
  const [activeRole, setActiveRole] = useState<CrewRole>("navigation");

  const activeMember = useMemo(
    () => resolveCrewSelection(activeRole, language, selections),
    [activeRole, language, selections],
  );

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
            <div>
              <span>{crewRoleLabels[activeRole]}</span>
              <h3>{activeMember.fullName}</h3>
              <p>{activeMember.region}</p>
            </div>
          </header>

          <div className="crew-config-variants__buttons">
            {getCrewVariants(activeRole).map((variant) => {
              const portraitSource = resolveCrewPortraitSource(variant.portraitFileName);
              const isSelected = selections[activeRole] === variant.locale;
              const isUiDefault =
                !selections[activeRole] &&
                resolveCrewSelection(activeRole, language, selections).locale ===
                  variant.locale;

              return (
                <button
                  className={`crew-variant-button${
                    isSelected || isUiDefault ? " crew-variant-button--selected" : ""
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
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
