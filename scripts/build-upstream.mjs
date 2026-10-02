import { accessSync, constants, copyFileSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import strip from "@rollup/plugin-strip";
import { parse } from "acorn";
import { minify } from "terser";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const lilscriptRoot = process.env.LILSCRIPT_ROOT ?? resolve(root, "..", "lilscript");
const source = resolve(root, "src", "shader-processing");
const dist = resolve(root, "dist");
const banner = "/*! PlayCanvas shader processing | PlayCanvas Ltd. | MIT */";
const stripFunctions = [
  "Debug.assert", "Debug.assertDeprecated", "Debug.assertDestroyed", "Debug.call",
  "Debug.deprecated", "Debug.warn", "Debug.warnOnce", "Debug.error", "Debug.errorOnce",
  "Debug.log", "Debug.logOnce", "Debug.removed", "Debug.trace", "DebugHelper.setName",
  "DebugHelper.setLabel", "DebugHelper.setDestroyed", "DebugGraphics.toString",
  "DebugGraphics.clearGpuMarkers", "DebugGraphics.pushGpuMarker", "DebugGraphics.popGpuMarker",
  "assertPc", "assertPcContext", "debugCall", "errorPc", "warnPc",
  "debugDefinitionOptions", "debugDuplicateAttribute", "debugFragmentCode", "debugOutputType",
  "debugVertexCode",
];

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

function releaseStripPlugin() {
  const plugin = strip({ functions: stripFunctions, debugger: false, sourceMap: false });
  const context = {
    parse(code) {
      return parse(code, { ecmaVersion: "latest", sourceType: "module" });
    },
  };
  return {
    name: "playcanvas-release-strip",
    setup(builder) {
      builder.onLoad({ filter: /\.js$/ }, ({ path }) => {
        const code = readFileSync(path, "utf8");
        const transformed = plugin.transform.call(context, code, path);
        return { contents: transformed?.code ?? code, loader: "js" };
      });
    },
  };
}

async function bundle(entry, output) {
  const linked = await esbuild({
    absWorkingDir: root,
    entryPoints: [resolve(root, entry)],
    bundle: true,
    write: false,
    format: "esm",
    platform: "neutral",
    target: "es2022",
    minifySyntax: true,
    minifyWhitespace: true,
    minifyIdentifiers: false,
    legalComments: "none",
    plugins: [releaseStripPlugin()],
    logLevel: "silent",
  });
  const compressed = await minify(linked.outputFiles[0].text, {
    module: true,
    ecma: 2022,
    compress: { arrows: false, passes: 3 },
    mangle: false,
    format: { comments: false },
  });
  if (!compressed.code) throw new Error(`Terser did not emit ${output}`);
  writeFileSync(resolve(dist, output), `${banner}\n${compressed.code}\n`);
}

mkdirSync(dist, { recursive: true });
await bundle("benchmarks/open-world.js", "shader-processing.official.js");
await bundle("benchmarks/closed-world.js", "shader-processing.closed.official.js");
