import { resolve as resolvePath } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolvePath(new URL("..", import.meta.url).pathname);
const artifact = process.env.PLAYCANVASLIL_ARTIFACT;
if (!artifact) throw new Error("PLAYCANVASLIL_ARTIFACT is required");

const targetUrl = pathToFileURL(resolvePath(root, artifact)).href;
const redirected = new Set([
  pathToFileURL(resolvePath(root, "upstream/engine/src/core/preprocessor.js")).href,
  pathToFileURL(resolvePath(root, "upstream/engine/src/platform/graphics/shader-definition-utils.js")).href,
  pathToFileURL(resolvePath(root, "upstream/engine/src/platform/graphics/shader-processor-glsl.js")).href,
  pathToFileURL(resolvePath(root, "upstream/engine/src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js")).href,
]);

export async function resolve(specifier, context, nextResolve) {
  if (context.parentURL?.startsWith("file:") && specifier.startsWith(".")) {
    const requested = new URL(specifier, context.parentURL).href;
    if (redirected.has(requested)) return { url: targetUrl, shortCircuit: true };
  }
  return nextResolve(specifier, context);
}
