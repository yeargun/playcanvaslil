import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tokenizer } from "acorn";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const reports = resolve(root, "reports");
const results = JSON.parse(readFileSync(resolve(reports, "results.json"), "utf8"));

function tokenAnalysis(path) {
  const code = readFileSync(resolve(root, path), "utf8");
  const names = new Map();
  let nameBytes = 0;
  let nameTokens = 0;
  let punctuationTokens = 0;
  let literalTokens = 0;
  let totalTokens = 0;
  const stream = tokenizer(code, { ecmaVersion: "latest", sourceType: "module" });
  for (;;) {
    const token = stream.getToken();
    if (token.type.label === "eof") break;
    totalTokens += 1;
    const spelling = code.slice(token.start, token.end);
    if (token.type.label === "name" || token.type.keyword) {
      nameTokens += 1;
      nameBytes += spelling.length;
      names.set(spelling, (names.get(spelling) ?? 0) + 1);
    } else if (["string", "num", "regexp", "template", "invalidTemplate"].includes(token.type.label)) {
      literalTokens += 1;
    } else {
      punctuationTokens += 1;
    }
  }
  let firstSpellingBytes = 0;
  for (const name of names.keys()) firstSpellingBytes += name.length;
  return {
    rawBytes: Buffer.byteLength(code),
    totalTokens,
    nameTokens,
    nameBytes,
    uniqueNames: names.size,
    repeatedNameBytes: nameBytes - firstSpellingBytes,
    punctuationTokens,
    literalTokens,
  };
}

const candidate = tokenAnalysis("dist/shader-processing.js");
const official = tokenAnalysis("dist/shader-processing.official.js");
const open = results.comparison.open;
const analysis = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  artifacts: { candidate, official },
  transfer: {
    rawDifferencePercent: open.raw.differencePercent,
    gzipDifferencePercent: open.gzip9.differencePercent,
    brotliDifferencePercent: open.brotli11.differencePercent,
    candidateBrotliDensity: Number((open.brotli11.candidate / open.raw.candidate).toFixed(6)),
    officialBrotliDensity: Number((open.brotli11.baseline / open.raw.baseline).toFixed(6)),
  },
  findings: [
    "Most raw savings come from shorter repeated identifiers, which Brotli already represents as short back-references.",
    "The translated artifact uses more tokens and punctuation because typed control flow lowers to procedural assignments and calls.",
    "Large shader strings and shared PlayCanvas host modules are identical or nearly identical in both complete artifacts.",
    "LilScript internal property mangling was rejected because it increased final-artifact Brotli size.",
  ],
};

mkdirSync(reports, { recursive: true });
writeFileSync(resolve(reports, "compression-analysis.json"), `${JSON.stringify(analysis, null, 2)}\n`);
console.log(`Raw ${open.raw.differencePercent}% / Brotli ${open.brotli11.differencePercent}%`);
