import { accessSync, constants, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lilscriptRoot = process.env.LILSCRIPT_ROOT ?? resolve(root, "..", "lilscript");
const reports = resolve(root, "reports");

function executable(candidates, label) {
  for (const candidate of candidates.filter(Boolean)) {
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next configured location.
    }
  }
  throw new Error(`${label} not found; set LILSCRIPT_CODEC or LILSCRIPT_ROOT`);
}

function command(commandName, args, cwd = root) {
  const result = spawnSync(commandName, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) throw new Error(result.stderr || `${commandName} failed`);
  return result.stdout.trim();
}

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function difference(candidate, baseline) {
  return Number((((candidate / baseline) - 1) * 100).toFixed(2));
}

const codec = executable([
  process.env.LILSCRIPT_CODEC,
  resolve(lilscriptRoot, "target", "release", "lilscript-codec"),
  resolve(lilscriptRoot, "target", "debug", "lilscript-codec"),
], "LilScript codec scorer");
const compiler = executable([
  process.env.LILSCRIPT_COMPILER,
  resolve(lilscriptRoot, "target", "release", "lilscript"),
  resolve(lilscriptRoot, "target", "debug", "lilscript"),
], "LilScript compiler");

const definitions = [
  ["open-lilscript", "open", "LilScript", "dist/shader-processing.js"],
  ["open-official", "open", "Official PlayCanvas", "dist/shader-processing.official.js"],
  ["closed-lilscript", "closed", "LilScript", "dist/shader-processing.closed.js"],
  ["closed-official", "closed", "Official PlayCanvas", "dist/shader-processing.closed.official.js"],
];
const measured = JSON.parse(command(codec, ["--json", ...definitions.map((item) => resolve(root, item[3]))]));
const artifacts = definitions.map(([id, world, label, path], index) => ({
  id,
  world,
  label,
  path,
  raw: measured.artifacts[index].raw,
  gzip9: measured.artifacts[index].gzip9,
  brotli11: measured.artifacts[index].brotli11,
  sha256: sha256(resolve(root, path)),
}));

function comparison(world) {
  const candidate = artifacts.find((artifact) => artifact.id === `${world}-lilscript`);
  const baseline = artifacts.find((artifact) => artifact.id === `${world}-official`);
  return Object.fromEntries(["raw", "gzip9", "brotli11"].map((metric) => [metric, {
    candidate: candidate[metric],
    baseline: baseline[metric],
    differencePercent: difference(candidate[metric], baseline[metric]),
  }]));
}

const compilerStatus = command("git", ["status", "--porcelain"], lilscriptRoot);
const compilerRevision = command("git", ["rev-parse", "HEAD"], lilscriptRoot);
const pinnedCompilerRevision = readFileSync(resolve(root, "LILSCRIPT_REVISION"), "utf8").trim();
if (compilerRevision !== pinnedCompilerRevision) {
  throw new Error(`LilScript revision ${compilerRevision} does not match pin ${pinnedCompilerRevision}`);
}
if (compilerStatus.length > 0 && process.env.PLAYCANVASLIL_ALLOW_DIRTY_COMPILER !== "1") {
  throw new Error("LilScript source is dirty; set PLAYCANVASLIL_ALLOW_DIRTY_COMPILER=1 for local-only measurements");
}

const selectedSources = [
  "src/core/preprocessor.js",
  "src/platform/graphics/shader-definition-utils.js",
  "src/platform/graphics/shader-processor-glsl.js",
  "src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js",
];
const portSources = [
  "src/shader-processing/entry.lil",
  "src/shader-processing/preprocessor.lil",
  "src/shader-processing/shader-definition-utils.lil",
  "src/shader-processing/shader-processor-glsl.lil",
  "src/shader-processing/webgpu-shader-processor-wgsl.lil",
  "src/shader-processing/facade-utils.js",
  "src/shader-processing/index.facade.js",
  "src/shader-processing/preprocessor.facade.js",
  "src/shader-processing/shader-definition-utils.facade.js",
  "src/shader-processing/shader-definition-utils.debug.js",
  "src/shader-processing/shader-definition-utils.host.js",
  "src/shader-processing/shader-processor-glsl.facade.js",
  "src/shader-processing/shader-processor-glsl.host.js",
  "src/shader-processing/webgpu-shader-processor-wgsl.facade.js",
  "src/shader-processing/webgpu-shader-processor-wgsl.host.js",
  "src/shader-processing/closed-world.js",
  "scripts/build.mjs",
];
const packageJson = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));
const result = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  scope: {
    upstream: "playcanvas/engine",
    name: "shader-processing core",
    gitSubmodulePath: "upstream/engine",
    selectedSources,
    convertedFiles: selectedSources,
    sourceBytes: selectedSources.reduce((sum, path) => sum + readFileSync(resolve(root, "upstream/engine", path)).length, 0),
  },
  contract: {
    build: "PlayCanvas release Debug stripping; Terser compression with identifier and property mangling disabled",
    officialPropertyMangling: false,
    lilscriptInternalPropertyMangling: false,
    downstreamIdentifierMangling: false,
    objective: "brotli11",
    ablations: {
      lilscriptInternalPropertyMangling: "rejected: larger final open-world Brotli artifact",
    },
  },
  upstream: {
    revision: command("git", ["rev-parse", "HEAD"], resolve(root, "upstream", "engine")),
    sourceSha256: Object.fromEntries(selectedSources.map((path) => [path, sha256(resolve(root, "upstream/engine", path))])),
  },
  portSourceSha256: Object.fromEntries(portSources.map((path) => [path, sha256(resolve(root, path))])),
  tools: {
    esbuild: packageJson.devDependencies.esbuild,
    terser: packageJson.devDependencies.terser,
  },
  compiler: {
    revision: compilerRevision,
    dirty: compilerStatus.length > 0,
    binarySha256: sha256(compiler),
  },
  codecBinarySha256: sha256(codec),
  configSha256: sha256(resolve(root, "lilscript.toml")),
  codecs: measured.codecs,
  artifacts,
  comparison: {
    open: comparison("open"),
    closed: comparison("closed"),
  },
};

mkdirSync(reports, { recursive: true });
writeFileSync(resolve(reports, "results.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Open Brotli: ${result.comparison.open.brotli11.candidate} vs ${result.comparison.open.brotli11.baseline} bytes`);
console.log(`Closed Brotli: ${result.comparison.closed.brotli11.candidate} vs ${result.comparison.closed.brotli11.baseline} bytes`);
