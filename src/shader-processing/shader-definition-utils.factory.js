// Port-owned API factory; the compiler supplies checked LilScript implementations.
import { installMethods } from "./facade-utils.js";
export function createFacade(core) {



class ShaderDefinitionUtils {}

const createDefinition = (device, options) => core.createDefinition(ShaderDefinitionUtils, device, options);
const getWGSLEnables = (device, shaderType, dualSource = false) =>
  core.getWGSLEnables(device, shaderType, dualSource);

installMethods(ShaderDefinitionUtils, {
  createDefinition,
  getWGSLEnables,
  getDefinesCode: core.getDefinesCode,
  getShaderNameCode: core.getShaderNameCode,
  versionCode: core.versionCode,
  precisionCode: core.precisionCode,
  collectAttributes: core.collectAttributes,
});



return {ShaderDefinitionUtils};
}
