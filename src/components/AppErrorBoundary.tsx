import { getVersion } from "@tauri-apps/api/app";
import { invoke } from "@tauri-apps/api/core";
import { Component, type ErrorInfo, type ReactNode } from "react";

import StartupRecoveryDialog, { type StartupHealth } from "./StartupRecoveryDialog";

type State = { failed: boolean; version: string };

export default class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false, version: "" };

  static getDerivedStateFromError(): State {
    return { failed: true, version: "" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void invoke("log_update_phase", {
      phase: "frontend_crash",
      cause: "render_failed",
      technical: `${error.message}\n${info.componentStack ?? ""}`,
    });
    void getVersion().then((version) => this.setState({ version })).catch(() => {});
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const health: StartupHealth = {
      ready: false,
      phase: "frontend",
      processName: "app.exe",
      version: this.state.version,
      reason: null,
    };
    return <StartupRecoveryDialog health={health} onHealthChange={(next) => { if (next.ready) window.location.reload(); }} />;
  }
}
