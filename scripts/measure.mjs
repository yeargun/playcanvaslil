import { accessSync, constants, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { dirname, relative, resolve } from "node:path";
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

function percent(candidate, baseline) {
  return Number((((candidate / baseline) - 1) * 100).toFixed(1));
}

const codec = executable(
  [
    process.env.LILSCRIPT_CODEC,
    resolve(lilscriptRoot, "target", "release", "lilscript-codec"),
    resolve(lilscriptRoot, "target", "debug", "lilscript-codec"),
  ],
  "LilScript codec scorer",
);
const compiler = executable(
  [
    process.env.LILSCRIPT_COMPILER,
    resolve(lilscriptRoot, "target", "release", "lilscript"),
    resolve(lilscriptRoot, "target", "debug", "lilscript"),
  ],
  "LilScript compiler",
);

const definitions = [
  ["open-lil-raw", "open", "LilScript", "raw", "dist/bit-packing.raw.js"],
  ["open-lil-gzip", "open", "LilScript", "gzip", "dist/bit-packing.gzip.js"],
  ["open-lil-brotli", "open", "LilScript", "brotli", "dist/bit-packing.brotli.js"],
  ["open-esbuild", "open", "Official + esbuild", null, "dist/bit-packing.official-esbuild.js"],
  ["open-terser", "open", "Official + Terser", null, "dist/bit-packing.official-terser.js"],
  ["closed-lil-raw", "closed", "LilScript", "raw", "dist/closed-world.raw.js"],
  ["closed-lil-gzip", "closed", "LilScript", "gzip", "dist/closed-world.gzip.js"],
  ["closed-lil-brotli", "closed", "LilScript", "brotli", "dist/closed-world.brotli.js"],
  ["closed-esbuild", "closed", "Official + esbuild", null, "dist/closed-world.official-esbuild.js"],
  ["closed-terser", "closed", "Official + Terser", null, "dist/closed-world.official-terser.js"],
];
const paths = definitions.map((definition) => resolve(root, definition[4]));
const measured = JSON.parse(command(codec, ["--json", ...paths]));
const artifacts = definitions.map(([id, world, label, costModel, path], index) => ({
  id,
  world,
  label,
  costModel,
  path,
  raw: measured.artifacts[index].raw,
  gzip9: measured.artifacts[index].gzip9,
  brotli11: measured.artifacts[index].brotli11,
  sha256: sha256(resolve(root, path)),
}));

function matched(world) {
  const lanes = artifacts.filter((artifact) => artifact.world === world);
  const official = lanes.filter((artifact) => artifact.label !== "LilScript");
  const metrics = [
    ["raw", "raw"],
    ["gzip", "gzip9"],
    ["brotli", "brotli11"],
  ];
  return Object.fromEntries(metrics.map(([objective, metric]) => {
    const candidate = lanes.find((artifact) => artifact.costModel === objective);
    const baseline = official.reduce((best, artifact) => artifact[metric] < best[metric] ? artifact : best);
    return [metric, {
      candidate: candidate[metric],
      baseline: baseline[metric],
      baselineId: baseline.id,
      differencePercent: percent(candidate[metric], baseline[metric]),
    }];
  }));
}

function frontier(world) {
  const lanes = artifacts.filter((artifact) => artifact.world === world);
  const candidates = lanes.filter((artifact) => artifact.label === "LilScript");
  const official = lanes.filter((artifact) => artifact.label !== "LilScript");
  return Object.fromEntries(["raw", "gzip9", "brotli11"].map((metric) => {
    const candidate = candidates.reduce((best, artifact) => artifact[metric] < best[metric] ? artifact : best);
    const baseline = official.reduce((best, artifact) => artifact[metric] < best[metric] ? artifact : best);
    return [metric, {
      candidate: candidate[metric],
      candidateId: candidate.id,
      baseline: baseline[metric],
      baselineId: baseline.id,
      differencePercent: percent(candidate[metric], baseline[metric]),
    }];
  }));
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
const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  scope: {
    upstream: "playcanvas/engine",
    gitSubmodulePath: "upstream/engine",
    sourceSubtree: "src/core/math",
    sourceFileCount: 17,
    convertedFiles: ["bit-packing.js"],
  },
  upstream: {
    revision: command("git", ["rev-parse", "HEAD"], resolve(root, "upstream", "engine")),
    bitPackingSourceSha256: sha256(resolve(root, "upstream", "engine", "src", "core", "math", "bit-packing.js")),
  },
  sourceSha256: {
    lilscript: sha256(resolve(root, "src", "core", "math", "bit-packing.lil")),
    facade: sha256(resolve(root, "src", "core", "math", "bit-packing.facade.js")),
    closedLilscript: sha256(resolve(root, "benchmarks", "closed-world.lil")),
    closedJavaScript: sha256(resolve(root, "benchmarks", "closed-world.js")),
  },
  compiler: {
    revision: compilerRevision,
    dirty: compilerStatus.length > 0,
    binarySha256: sha256(compiler),
  },
  codecBinarySha256: sha256(codec),
  configSha256: Object.fromEntries([
    "lilscript.toml",
    "lilscript.gzip.toml",
    "lilscript.raw.toml",
    "lilscript.closed.toml",
    "lilscript.closed-gzip.toml",
    "lilscript.closed-raw.toml",
  ].map((path) => [path, sha256(resolve(root, path))])),
  codecs: measured.codecs,
  artifacts,
  matched: {
    open: matched("open"),
    closed: matched("closed"),
  },
  frontier: {
    open: frontier("open"),
    closed: frontier("closed"),
  },
  notes: {
    open: "Reusable ESM with exact BitPacking object keys, method arities, defaults, and non-constructible methods. Includes the JavaScript ABI facade.",
    closed: "Equivalent single-entry kernel. Both sources call a BitPacking object; the complete internal graph may be optimized.",
  },
};

mkdirSync(reports, { recursive: true });
writeFileSync(resolve(reports, "results.json"), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Open Brotli: ${result.matched.open.brotli11.candidate} vs ${result.matched.open.brotli11.baseline} bytes`);
console.log(`Closed Brotli: ${result.matched.closed.brotli11.candidate} vs ${result.matched.closed.brotli11.baseline} bytes`);
console.log(`Wrote ${relative(root, resolve(reports, "results.json"))}`);
