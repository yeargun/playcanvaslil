import * as core from "./shader-processing.compiled.js";
import { installMethods } from "./facade-utils.js";

class WebgpuShaderProcessorWGSL {}

const processResources = (device, resources, processingOptions, shader, visibility = 3, bindGroupIndex = 1) =>
  core.processResources(device, resources, processingOptions, shader, visibility, bindGroupIndex);
const getUniformShaderDeclaration = (format, bindGroup, bindIndex, name = ["view", "mesh", "mesh_ub"][bindGroup]) =>
  core.getUniformShaderDeclaration(format, bindGroup, bindIndex, name);
const processVaryings = (lines, map, vertex, device, source = "", inputName = "") =>
  core.processVaryings(lines, map, vertex, device, source, inputName);
const generateFragmentOutputStruct = (source, targets, dualSource = false) =>
  core.generateFragmentOutputStruct(source, targets, dualSource);
const processAttributes = (lines, definitions = {}, map, options, shader, device, source = "", inputName = "") =>
  core.processAttributes(lines, definitions, map, options, shader, device, source, inputName);

installMethods(WebgpuShaderProcessorWGSL, {
  run: core.run,
  runCompute: core.runCompute,
  extract: core.extract,
  processUniforms: core.processUniforms,
  renameUniformAccess: core.renameUniformAccess,
  mergeResources: core.mergeResources,
  buildResourceFormats: core.buildResourceFormats,
  processResources,
  getUniformShaderDeclaration,
  getTextureShaderDeclaration: core.getTextureShaderDeclaration,
  processVaryings,
  generateFragmentOutputStruct,
  floatAttributeToInt: core.floatAttributeToInt,
  processAttributes,
  copyInputs: core.copyInputs,
  cutOut: core.cutOut,
});

export { WebgpuShaderProcessorWGSL };
