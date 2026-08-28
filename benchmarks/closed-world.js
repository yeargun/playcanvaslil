import { Preprocessor } from "../upstream/engine/src/core/preprocessor.js";
import { WebgpuShaderProcessorWGSL } from "../upstream/engine/src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js";
import { ShaderProcessorGLSL } from "../upstream/engine/src/platform/graphics/shader-processor-glsl.js";
import { ShaderDefinitionUtils } from "../upstream/engine/src/platform/graphics/shader-definition-utils.js";

const preprocess = (source, includes = new Map(), options = {}) => Preprocessor.run(source, includes, options);
const processWgsl = (device, definition, shader) => WebgpuShaderProcessorWGSL.run(device, definition, shader);
const processGlsl = (device, definition, shader) => ShaderProcessorGLSL.run(device, definition, shader);
const createDefinition = (device, options) => ShaderDefinitionUtils.createDefinition(device, options);

export { createDefinition, preprocess, processGlsl, processWgsl };
