import { invoke } from "@tauri-apps/api/core";
import { Component, type ErrorInfo, type ReactNode } from "react";

import StartupRecoveryDialog, { type StartupHealth } from "./StartupRecoveryDialog";

type State = { failed: boolean };

export default class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    void invoke("log_update_phase", {
      phase: "frontend_crash",
      cause: "render_failed",
      technical: `${error.message}\n${info.componentStack ?? ""}`,
    });
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const health: StartupHealth = {
      ready: false,
      phase: "frontend",
      processName: "app.exe",
      version: "0.14.1",
      reason: null,
    };
    return <StartupRecoveryDialog health={health} onHealthChange={(next) => { if (next.ready) window.location.reload(); }} />;
  }
}
