import { useI18n } from "../i18n";
type Props = { title: string };
export default function TopBar({ title }: Props) { const { t } = useI18n(); return <header className="topbar"><div className="topbar__title"><p className="eyebrow">{t("systemControl")}</p><h1>{title}</h1></div></header>; }
