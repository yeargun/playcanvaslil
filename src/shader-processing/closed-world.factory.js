// The closed consumer keeps its original defaults and callable arity.
export function createClosed(core) {
  const {preprocessorRun, processWgsl, processGlsl, ShaderDefinitionUtils} = core;
  const preprocess = (source, includes = new Map(), options = {}) => preprocessorRun(source, includes, options);
  const createDefinition = (device, options) => ShaderDefinitionUtils.createDefinition(device, options);
  return {preprocess, createDefinition, processWgsl, processGlsl};
}
