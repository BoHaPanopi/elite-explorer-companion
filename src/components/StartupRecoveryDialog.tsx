import { invoke } from "@tauri-apps/api/core";
import { exit, relaunch } from "@tauri-apps/plugin-process";
import { useState } from "react";

import { useI18n } from "../i18n";

export type StartupHealth = {
  ready: boolean;
  phase: string;
  processName: string;
  version: string;
  reason: string | null;
};

type Props = {
  health: StartupHealth;
  onHealthChange: (health: StartupHealth) => void;
};

export default function StartupRecoveryDialog({ health, onHealthChange }: Props) {
  const { t } = useI18n();
  const [isRepairing, setIsRepairing] = useState(false);

  async function repair() {
    setIsRepairing(true);
    try {
      onHealthChange(await invoke<StartupHealth>("repair_runtime"));
    } finally {
      setIsRepairing(false);
    }
  }

  return <div className="modal-backdrop startup-error-backdrop"><section className="panel modal-dialog startup-error-dialog" role="alertdialog" aria-modal="true" aria-labelledby="startup-error-title">
    <header><span>OGG</span><strong>{t("startupErrorLabel")}</strong></header>
    <div><h2 id="startup-error-title">{t("startupErrorTitle")}</h2><p>{t("startupErrorBody")}</p>{health.version && <small>{t("startupErrorVersion", { version: health.version })}</small>}</div>
    <div className="startup-error-actions">
      <button type="button" onClick={() => void relaunch()}>{t("restart")}</button>
      <button type="button" className="primary-action" disabled={isRepairing} onClick={() => void repair()}>{isRepairing ? t("repairing") : t("repair")}</button>
      <button type="button" onClick={() => void invoke("open_log_directory")}>{t("openLog")}</button>
      <button type="button" onClick={() => void exit(1)}>{t("quit")}</button>
    </div>
  </section></div>;
}
