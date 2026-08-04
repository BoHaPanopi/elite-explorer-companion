import { useI18n } from "../i18n";

type SidebarProps = { page: string; setPage: (page: string) => void };

export default function Sidebar({ page, setPage }: SidebarProps) {
  const { t } = useI18n();
  const items = [["dashboard", t("commandCenter")], ["navigation", t("navigation")], ["settings", t("settings")]] as const;
  return <aside className="sidebar"><nav>{items.map(([id, label]) => <button key={id} type="button" className={page === id ? "active" : ""} onClick={() => setPage(id)}>{label}</button>)}</nav></aside>;
}
