import { Preprocessor } from "../upstream/engine/src/core/preprocessor.js";
import { WebgpuShaderProcessorWGSL } from "../upstream/engine/src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js";
import { ShaderProcessorGLSL, UniformLine } from "../upstream/engine/src/platform/graphics/shader-processor-glsl.js";
import { ShaderDefinitionUtils } from "../upstream/engine/src/platform/graphics/shader-definition-utils.js";

export {
  Preprocessor,
  ShaderDefinitionUtils,
  ShaderProcessorGLSL,
  UniformLine,
  WebgpuShaderProcessorWGSL,
};
