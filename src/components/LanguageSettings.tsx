import { useI18n, type Language } from "../i18n";

export default function LanguageSettings() {
  const { language, setLanguage, t } = useI18n();
  return <section className="panel language-settings"><span>{t("language")}</span><h2>{t("language")}</h2><select value={language} onChange={(event) => setLanguage(event.target.value as Language)} aria-label={t("language")}><option value="de">{t("german")}</option><option value="en">{t("english")}</option></select></section>;
}
