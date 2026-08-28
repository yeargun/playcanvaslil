import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const artifact = resolve(process.argv[2]);
const world = process.argv[3] ?? "open";
const iterations = Number.parseInt(process.argv[4] ?? "4000", 10);
const loaded = await import(pathToFileURL(artifact).href);
const preprocess = world === "open"
  ? (source, includes, options) => loaded.Preprocessor.run(source, includes, options)
  : loaded.preprocess;

const source = `
#define LIGHT_COUNT 4
#define ENABLE_FOG
#define {CLUSTER_SIZE} 16
#include "lighting, LIGHT_COUNT"
#if defined(ENABLE_FOG) && LIGHT_COUNT >= 4
uniform fogDensity: f32;
#else
uniform fallback: f32;
#endif
var colors: array<vec4f, LIGHT_COUNT>;
let cluster = {CLUSTER_SIZE};
`;
const includes = new Map([["lighting", "let light_{i} = {i};\n"]]);

function run(count) {
  let checksum = 0;
  for (let index = 0; index < count; index += 1) {
    const output = preprocess(source, includes, { stripDefines: (index & 1) === 0 });
    checksum = (checksum + output.length + output.charCodeAt(index % output.length)) | 0;
  }
  return checksum;
}

run(200);
run(200);
const started = process.hrtime.bigint();
const checksum = run(iterations);
const elapsedNs = Number(process.hrtime.bigint() - started);
process.stdout.write(`${JSON.stringify({ checksum, elapsedNs })}\n`);
