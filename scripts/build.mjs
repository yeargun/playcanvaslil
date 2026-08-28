import { accessSync, constants, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import { minify } from "terser";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lilscriptRoot = process.env.LILSCRIPT_ROOT ?? resolve(root, "..", "lilscript");
const dist = resolve(root, "dist");
const temporary = resolve(root, ".tmp");
const banner = "/*! PlayCanvas core/math BitPacking | PlayCanvas Ltd. | MIT */\n";

function executable(candidates, label) {
  for (const candidate of candidates.filter(Boolean)) {
    try {
      accessSync(candidate, constants.X_OK);
      return candidate;
    } catch {
      // Try the next configured location.
    }
  }
  throw new Error(`${label} not found; set LILSCRIPT_COMPILER or LILSCRIPT_ROOT`);
}

function run(command, args) {
  const result = spawnSync(command, args, { cwd: root, stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function addBanner(input, output) {
  writeFileSync(output, `${banner}${readFileSync(input, "utf8").trimEnd()}\n`);
}

async function bundleFacade(compiled, output) {
  await esbuild({
    entryPoints: [resolve(root, "src", "core", "math", "bit-packing.facade.js")],
    outfile: output,
    bundle: true,
    format: "esm",
    platform: "neutral",
    minifyWhitespace: true,
    minifyIdentifiers: false,
    minifySyntax: false,
    legalComments: "none",
    logLevel: "silent",
    plugins: [{
      name: "compiled-lilscript",
      setup(build) {
        build.onResolve({ filter: /bit-packing\.compiled\.js$/ }, () => ({ path: compiled }));
      },
    }],
  });
}

mkdirSync(dist, { recursive: true });
mkdirSync(temporary, { recursive: true });

const compiler = executable(
  [
    process.env.LILSCRIPT_COMPILER,
    resolve(lilscriptRoot, "target", "release", "lilscript"),
    resolve(lilscriptRoot, "target", "debug", "lilscript"),
  ],
  "LilScript compiler",
);

for (const [objective, config] of [
  ["brotli", "lilscript.toml"],
  ["gzip", "lilscript.gzip.toml"],
  ["raw", "lilscript.raw.toml"],
]) {
  const compiled = resolve(temporary, `bit-packing.${objective}.mjs`);
  run(compiler, [
    resolve(root, "src", "core", "math", "bit-packing.lil"),
    "--target",
    "js-module",
    "--config",
    resolve(root, config),
    "-o",
    compiled,
  ]);
  const facade = resolve(temporary, `bit-packing.${objective}.facade.mjs`);
  await bundleFacade(compiled, facade);
  addBanner(facade, resolve(dist, `bit-packing.${objective}.js`));
}

addBanner(
  resolve(temporary, "bit-packing.brotli.facade.mjs"),
  resolve(dist, "bit-packing.js"),
);

const upstreamEntry = resolve(root, "upstream", "engine", "src", "core", "math", "bit-packing.js");
await esbuild({
  entryPoints: [upstreamEntry],
  outfile: resolve(temporary, "bit-packing.esbuild.mjs"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  minify: true,
  legalComments: "none",
  logLevel: "silent",
});
addBanner(
  resolve(temporary, "bit-packing.esbuild.mjs"),
  resolve(dist, "bit-packing.official-esbuild.js"),
);

const upstreamSource = readFileSync(upstreamEntry, "utf8");
const terserResult = await minify({ "bit-packing.js": upstreamSource }, {
  module: true,
  compress: { arrows: false, passes: 3 },
  mangle: true,
  format: { comments: false },
});
if (!terserResult.code) throw new Error("Terser did not emit the official baseline");
writeFileSync(
  resolve(dist, "bit-packing.official-terser.js"),
  `${banner}${terserResult.code.trimEnd()}\n`,
);

for (const [objective, config] of [
  ["brotli", "lilscript.closed.toml"],
  ["gzip", "lilscript.closed-gzip.toml"],
  ["raw", "lilscript.closed-raw.toml"],
]) {
  const compiled = resolve(temporary, `closed-world.${objective}.js`);
  run(compiler, [
    resolve(root, "benchmarks", "closed-world.lil"),
    "--target",
    "js-module",
    "--config",
    resolve(root, config),
    "-o",
    compiled,
  ]);
  addBanner(compiled, resolve(dist, `closed-world.${objective}.js`));
}
addBanner(resolve(temporary, "closed-world.brotli.js"), resolve(dist, "closed-world.js"));

const closedWorldEntry = resolve(root, "benchmarks", "closed-world.js");
await esbuild({
  entryPoints: [closedWorldEntry],
  outfile: resolve(temporary, "closed-world.official-esbuild.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  minify: true,
  legalComments: "none",
  logLevel: "silent",
});
addBanner(
  resolve(temporary, "closed-world.official-esbuild.js"),
  resolve(dist, "closed-world.official-esbuild.js"),
);

await esbuild({
  entryPoints: [closedWorldEntry],
  outfile: resolve(temporary, "closed-world.linked.js"),
  bundle: true,
  format: "esm",
  platform: "node",
  minify: false,
  legalComments: "none",
  logLevel: "silent",
});
const closedTerserResult = await minify(
  { "closed-world.js": readFileSync(resolve(temporary, "closed-world.linked.js"), "utf8") },
  {
    module: true,
    compress: { arrows: false, passes: 3 },
    mangle: true,
    format: { comments: false },
  },
);
if (!closedTerserResult.code) throw new Error("Terser did not emit the closed-world baseline");
writeFileSync(
  resolve(dist, "closed-world.official-terser.js"),
  `${banner}${closedTerserResult.code.trimEnd()}\n`,
);

console.log("Built open- and closed-world BitPacking artifacts");
