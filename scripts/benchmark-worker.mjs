import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const artifact = resolve(process.argv[2]);
const iterations = Number.parseInt(process.argv[3] ?? "20000000", 10);
const world = process.argv[4] ?? "open";
const loaded = await import(pathToFileURL(artifact).href);
const { BitPacking } = loaded;

function run(count) {
  let storage = 1831565813;
  let checksum = 0;
  for (let index = 0; index < count; index += 1) {
    const shift = index & 31;
    const mask = (index >>> 3) & 255;
    storage = BitPacking.set(storage, index, shift, mask);
    checksum ^= BitPacking.get(storage, shift, mask);
    if (BitPacking.any(storage, shift, mask)) checksum ^= index;
    if (BitPacking.all(storage, shift, mask)) checksum ^= storage;
  }
  return checksum;
}

const workload = world === "closed" ? loaded.runBitPackingWorkload : run;
if (typeof workload !== "function") throw new Error(`Missing ${world} benchmark entry`);

workload(5000000);
workload(5000000);
const started = process.hrtime.bigint();
const checksum = workload(iterations);
const elapsedNs = Number(process.hrtime.bigint() - started);
process.stdout.write(`${JSON.stringify({ checksum, elapsedNs })}\n`);
