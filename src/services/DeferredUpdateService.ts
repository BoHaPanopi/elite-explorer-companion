export type DownloadEvent =
  | { event: "Started"; data: { contentLength?: number } }
  | { event: "Progress"; data: { chunkLength: number } }
  | { event: "Finished"; data?: never };

export type UpdateReadiness = {
  ready: boolean;
  blocker: string | null;
};

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
): Promise<void> {
  let readiness = await prepare();
  while (!readiness.ready) {
    onBlocked?.(readiness.blocker);
    await pause();
    readiness = await prepare();
  }
  await update.install();
}
