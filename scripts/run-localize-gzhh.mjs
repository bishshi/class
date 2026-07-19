import { existsSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundledPython = path.join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "python",
  process.platform === "win32" ? "python.exe" : "bin/python"
);

const candidates = [
  ...(existsSync(bundledPython) ? [[bundledPython, []]] : []),
  ...(process.platform === "win32" ? [["py", ["-3"]]] : [["python3", []]]),
  ["python", []]
];

let localized = false;
for (const [executable, prefixArgs] of candidates) {
  const probe = spawnSync(executable, [...prefixArgs, "--version"], { cwd: projectRoot, encoding: "utf8" });
  if (probe.error?.code === "ENOENT" || probe.status !== 0) continue;

  const result = spawnSync(
    executable,
    [...prefixArgs, path.join(projectRoot, "scripts", "localize_gzhh_articles.py")],
    { cwd: projectRoot, stdio: "inherit" }
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
  localized = true;
  break;
}

if (!localized) {
  throw new Error("Python 3 with Pillow is required to localize article images.");
}

const imported = spawnSync(process.execPath, [path.join(projectRoot, "scripts", "import-gzhh-articles.mjs")], {
  cwd: projectRoot,
  stdio: "inherit"
});
process.exit(imported.status ?? 1);
