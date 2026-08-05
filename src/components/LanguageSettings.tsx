import { useI18n, type Language } from "../i18n";

export default function LanguageSettings() {
  const { language, setLanguage, t } = useI18n();
  return <section className="panel language-settings"><h2>{t("language")}</h2><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t("language")}><option value="de">{t("german")}</option><option value="en">{t("english")}</option><option value="fr">{t("french")}</option><option value="it">{t("italian")}</option><option value="es">{t("spanish")}</option></select></section>;
}
