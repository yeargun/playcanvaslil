import gles3FS from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/gles3.js";
import sharedGLSL from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/shared.js";
import sharedWGSL from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/shared-wgsl.js";
import halfTypes from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/half-types.js";
import webgpuFS from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/webgpu.js";
import wgslFS from "../../upstream/engine/src/platform/graphics/shader-chunks/frag/webgpu-wgsl.js";
import gles3VS from "../../upstream/engine/src/platform/graphics/shader-chunks/vert/gles3.js";
import webgpuVS from "../../upstream/engine/src/platform/graphics/shader-chunks/vert/webgpu.js";
import wgslVS from "../../upstream/engine/src/platform/graphics/shader-chunks/vert/webgpu-wgsl.js";

export {
  gles3FS,
  gles3VS,
  halfTypes,
  sharedGLSL,
  sharedWGSL,
  webgpuFS,
  webgpuVS,
  wgslFS,
  wgslVS,
};
