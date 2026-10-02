import {
  preprocessorRun,
  run as processWgsl,
} from "./shader-processing.compiled.js";
import { run as processGlsl } from "./shader-processor-glsl.compiled.js";
import { ShaderDefinitionUtils } from "./shader-definition-utils.facade.js";

const preprocess = (source, includes = new Map(), options = {}) => preprocessorRun(source, includes, options);
const createDefinition = (device, options) => ShaderDefinitionUtils.createDefinition(device, options);

export { createDefinition, preprocess, processGlsl, processWgsl };
