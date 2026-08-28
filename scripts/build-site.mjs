import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "_site");

await rm(output, { recursive: true, force: true });
await mkdir(resolve(output, "artifacts"), { recursive: true });
await cp(resolve(root, "site"), output, { recursive: true });
await cp(resolve(root, "reports", "results.json"), resolve(output, "results.json"));
await cp(resolve(root, "reports", "performance.json"), resolve(output, "performance.json"));
await cp(resolve(root, "dist", "shader-processing.js"), resolve(output, "artifacts", "shader-processing.js"));
await cp(
  resolve(root, "dist", "shader-processing.official.js"),
  resolve(output, "artifacts", "shader-processing.official.js"),
);
await cp(
  resolve(root, "dist", "shader-processing.closed.js"),
  resolve(output, "artifacts", "shader-processing.closed.js"),
);
await cp(
  resolve(root, "dist", "shader-processing.closed.official.js"),
  resolve(output, "artifacts", "shader-processing.closed.official.js"),
);
await writeFile(resolve(output, ".nojekyll"), "");
console.log(`Built GitHub Pages site at ${output}`);
