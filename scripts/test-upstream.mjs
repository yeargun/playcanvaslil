import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const mocha = resolve(root, "node_modules", "mocha", "bin", "mocha.js");
const registerLoader = resolve(root, "test", "register-loader.mjs");
const tests = [
  resolve(root, "upstream", "engine", "test", "core", "preprocessor.test.mjs"),
  resolve(root, "upstream", "engine", "test", "platform", "graphics", "webgpu", "webgpu-shader-processor-wgsl.test.mjs"),
  resolve(root, "upstream", "engine", "test", "platform", "graphics", "webgpu", "webgpu-shader-processor-wgsl-compute.test.mjs"),
];

const artifacts = process.argv.slice(2);
if (artifacts.length === 0) throw new Error("Pass at least one built shader-processing artifact");

for (const artifact of artifacts) {
  const result = spawnSync(
    process.execPath,
    ["--import", registerLoader, mocha, "--timeout", "10000", ...tests],
    {
      cwd: root,
      env: { ...process.env, PLAYCANVASLIL_ARTIFACT: artifact },
      stdio: "inherit",
    },
  );
  if (result.status !== 0) process.exit(result.status ?? 1);
}
