import { cpus } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const samplesPerLane = Number.parseInt(process.env.PLAYCANVASLIL_PERF_SAMPLES ?? "12", 10);
const iterations = Number.parseInt(process.env.PLAYCANVASLIL_PERF_ITERATIONS ?? "4000", 10);
const worker = resolve(root, "scripts", "benchmark-worker.mjs");
const reports = resolve(root, "reports");
const worlds = {
  open: [
    ["lilscript", "LilScript", "dist/shader-processing.js"],
    ["official", "Official PlayCanvas", "dist/shader-processing.official.js"],
  ],
  closed: [
    ["lilscript", "LilScript", "dist/shader-processing.closed.js"],
    ["official", "Official PlayCanvas", "dist/shader-processing.closed.official.js"],
  ],
};

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function observe(path, world) {
  const result = spawnSync(process.execPath, [worker, resolve(root, path), world, String(iterations)], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr || `${world} benchmark failed: ${path}`);
  return JSON.parse(result.stdout);
}

function measureWorld(world, lanes) {
  const samples = new Map(lanes.map(([id]) => [id, []]));
  let checksum;
  for (let block = 0; block < samplesPerLane; block += 1) {
    const order = block % 2 === 0 ? lanes : [...lanes].reverse();
    for (const [id, , path] of order) {
      const sample = observe(path, world);
      checksum ??= sample.checksum;
      if (sample.checksum !== checksum) throw new Error(`${world} checksum mismatch in ${id}`);
      samples.get(id).push(sample.elapsedNs / 1e6);
    }
  }
  const officialMedian = median(samples.get("official"));
  return {
    checksum,
    iterations,
    samplesPerLane,
    timing: "inside fresh Node processes after two warmups",
    lanes: lanes.map(([id, label, path]) => {
      const values = samples.get(id);
      const medianMs = median(values);
      return {
        id,
        label,
        path,
        medianMs: Number(medianMs.toFixed(3)),
        minMs: Number(Math.min(...values).toFixed(3)),
        maxMs: Number(Math.max(...values).toFixed(3)),
        ratioToOfficial: Number((medianMs / officialMedian).toFixed(3)),
        samplesMs: values.map((value) => Number(value.toFixed(3))),
      };
    }),
  };
}

const result = {
  schemaVersion: 2,
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cpu: cpus()[0]?.model ?? "unknown",
  },
  workload: "PlayCanvas preprocessor with defines, conditionals, include expansion, and injection",
  open: measureWorld("open", worlds.open),
  closed: measureWorld("closed", worlds.closed),
};

mkdirSync(reports, { recursive: true });
writeFileSync(resolve(reports, "performance.json"), `${JSON.stringify(result, null, 2)}\n`);
for (const world of ["open", "closed"]) {
  const lane = result[world].lanes.find(({ id }) => id === "lilscript");
  console.log(`${world}: ${lane.medianMs} ms (${lane.ratioToOfficial}x official)`);
}
