import { cpus } from "node:os";
import { mkdirSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const samplesPerLane = Number.parseInt(process.env.PLAYCANVASLIL_PERF_SAMPLES ?? "12", 10);
const iterations = Number.parseInt(process.env.PLAYCANVASLIL_PERF_ITERATIONS ?? "20000000", 10);
const worker = resolve(root, "scripts", "benchmark-worker.mjs");
const reports = resolve(root, "reports");

const openLanes = [
  ["lilscript", "LilScript", "dist/bit-packing.js"],
  ["esbuild", "Official + esbuild", "dist/bit-packing.official-esbuild.js"],
  ["terser", "Official + Terser", "dist/bit-packing.official-terser.js"],
];
const closedLanes = [
  ["lilscript", "LilScript", "dist/closed-world.js"],
  ["esbuild", "Official + esbuild", "dist/closed-world.official-esbuild.js"],
  ["terser", "Official + Terser", "dist/closed-world.official-terser.js"],
];

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function runWorker(path, world) {
  const result = spawnSync(process.execPath, [worker, resolve(root, path), String(iterations), world], {
    cwd: root,
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr || `${world} benchmark failed: ${path}`);
  return JSON.parse(result.stdout);
}

function measureWorld(world, lanes, runner) {
  const samples = new Map(lanes.map(([id]) => [id, []]));
  let checksum;
  for (let block = 0; block < samplesPerLane; block += 1) {
    const order = [...lanes.slice(block % lanes.length), ...lanes.slice(0, block % lanes.length)];
    for (const [id, , path] of order) {
      const observation = runner(path);
      checksum ??= observation.checksum;
      if (observation.checksum !== checksum) {
        throw new Error(`${world} checksum mismatch in ${id}`);
      }
      samples.get(id).push(observation.elapsedNs / 1e6);
    }
  }

  const baselineMedian = Math.min(
    ...lanes.filter(([id]) => id !== "lilscript").map(([id]) => median(samples.get(id))),
  );
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
        ratioToFastestOfficial: Number((medianMs / baselineMedian).toFixed(3)),
        samplesMs: values.map((value) => Number(value.toFixed(3))),
      };
    }),
  };
}

const result = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  environment: {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    cpu: cpus()[0]?.model ?? "unknown",
  },
  open: measureWorld("open", openLanes, (path) => runWorker(path, "open")),
  closed: measureWorld("closed", closedLanes, (path) => runWorker(path, "closed")),
};

mkdirSync(reports, { recursive: true });
writeFileSync(resolve(reports, "performance.json"), `${JSON.stringify(result, null, 2)}\n`);
for (const world of ["open", "closed"]) {
  const lane = result[world].lanes.find(({ id }) => id === "lilscript");
  console.log(`${world}: ${lane.medianMs} ms (${lane.ratioToFastestOfficial}x fastest official)`);
}
