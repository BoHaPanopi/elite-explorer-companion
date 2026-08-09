import { useMemo, useState } from "react";
import { useI18n } from "../i18n";
import {
  crewRoleLabels,
  crewRoleOrder,
  getCrewVariants,
  persistCrewSelection,
  resolveCrewSelection,
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
          </div>
          <button type="button" onClick={onClose}>
            {t("cancel")}
          </button>
        </header>

        <div className="crew-config-dialog__grid" role="list">
          {crewRoleOrder.map((role) => {
            const crewMember = resolveCrewSelection(role, language, selections);
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
                  <span>{crewRoleLabels[role]}</span>
                  <strong>{crewMember.fullName}</strong>
                  <small>{crewMember.region}</small>
                </button>
              </article>
            );
          })}
        </div>

        <section className="crew-config-variants">
          <header>
            <span>{crewRoleLabels[activeRole]}</span>
            <h3>{activeMember.fullName}</h3>
            <p>{activeMember.region}</p>
          </header>

          <div className="crew-config-variants__buttons">
            {getCrewVariants(activeRole).map((variant) => {
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
                  <span>{localeLabels[variant.locale]}</span>
                  <strong>{variant.fullName}</strong>
                  <small>OGG-Rufname: {variant.callSign}</small>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
