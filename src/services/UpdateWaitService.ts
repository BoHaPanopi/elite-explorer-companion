export async function waitForEliteProcessExit(
  isEliteRunning: () => Promise<boolean>,
  pause: () => Promise<void>,
): Promise<void> {
  while (await isEliteRunning()) {
    await pause();
  }
}
