export type DownloadEvent =
  | { event: "Started"; data: { contentLength?: number } }
  | { event: "Progress"; data: { chunkLength: number } }
  | { event: "Finished"; data?: never };

export type UpdateReadiness = {
  ready: boolean;
  blocker: string | null;
};

export type UpdateExitPhase = "downloading" | "ready" | "installing" | "error";

export async function completeUpdateExit({
  update,
  phase,
  preventClose,
  install,
  exitApp,
}: {
  update: { install: () => Promise<void> } | null;
  phase: UpdateExitPhase;
  preventClose: () => void;
  install: () => Promise<void>;
  exitApp: () => Promise<void>;
}): Promise<"exited" | "installing" | "ignored"> {
  if (!update) {
    await exitApp();
    return "exited";
  }
  if (phase === "installing") {
    preventClose();
    return "installing";
  }
  if (phase !== "ready") return "ignored";

  preventClose();
  await install();
  await exitApp();
  return "exited";
}

export async function downloadUpdateInBackground(
  update: { download: (onEvent: (event: DownloadEvent) => void) => Promise<void> },
  onProgress: (progress: number) => void,
): Promise<void> {
  let downloaded = 0;
  let total: number | undefined;

  await update.download((event) => {
    if (event.event === "Started") {
      total = event.data.contentLength;
      downloaded = 0;
      onProgress(0);
    } else if (event.event === "Progress") {
      downloaded += event.data.chunkLength;
      if (total && total > 0) onProgress(Math.min(downloaded / total, 1));
    } else {
      onProgress(1);
    }
  });
}

export async function installDownloadedUpdateOnExit(
  update: { install: () => Promise<void> },
  prepare: () => Promise<UpdateReadiness>,
  pause: () => Promise<void>,
  onBlocked?: (blocker: string | null) => void,
  onInstallStarted?: () => void,
): Promise<void> {
  let readiness = await prepare();
  while (!readiness.ready) {
    onBlocked?.(readiness.blocker);
    await pause();
    readiness = await prepare();
  }
  onInstallStarted?.();
  await update.install();
}
