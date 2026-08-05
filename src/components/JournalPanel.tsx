import { useI18n } from "../i18n";

type Props = { journalPath: string; onRefresh: () => void; onOpenFolder?: () => void; showPath?: boolean };

export default function JournalPanel({ journalPath, onRefresh, onOpenFolder, showPath = false }: Props) {
  const { t } = useI18n();
  return <section className={`panel journal-panel${showPath ? " journal-panel--settings" : " journal-panel--compact"}`}>
    <div><span>{showPath ? t("journalSource") : "Elite Dangerous Journal"}</span><h2>{journalPath ? t("journalConnected") : t("journalDisconnected")}</h2></div>
    <div className="journal-panel__actions"><button type="button" onClick={onRefresh}>{t("refreshJournal")}</button>{showPath && onOpenFolder && <button type="button" onClick={onOpenFolder}>{t("openJournalFolder")}</button>}</div>
  </section>;
}
