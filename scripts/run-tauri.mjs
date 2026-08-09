import { spawn } from "node:child_process";
import path from "node:path";

const argv = process.argv.slice(2);
const tauriBinary = path.join(
  process.cwd(),
  "node_modules",
  ".bin",
  process.platform === "win32" ? "tauri.cmd" : "tauri",
);

const tauriArgs = [...argv];
if (argv[0] === "dev") {
  tauriArgs.push("--config", "src-tauri/tauri.dev.conf.json");
}

const child = spawn(tauriBinary, tauriArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});

child.on("error", (error) => {
  console.error(error.message);
  process.exit(1);
});