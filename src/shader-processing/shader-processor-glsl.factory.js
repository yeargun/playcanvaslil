// Port-owned API factory; the compiler supplies checked LilScript implementations.
import { installMethods } from "./facade-utils.js";
export function createFacade(core) {



class UniformLine {
  constructor(line, shader) {
    const value = core.parseUniformLine(line, shader);
    Object.setPrototypeOf(value, new.target.prototype);
    return value;
  }
}

class ShaderProcessorGLSL {}

// The release API exposes one required argument; the optional diagnostic
// receiver still reaches the implementation when callers supply it.
Object.defineProperty(core.extract, "length", {value: 1, configurable: true});

const parseUniformLines = (lines, shader) => {
  const result = core.parseUniformLines(lines, shader);
  for (const line of result) Object.setPrototypeOf(line, UniformLine.prototype);
  return result;
};

installMethods(ShaderProcessorGLSL, {
  run: core.run,
  extract: core.extract,
  parseUniformLines,
  processUniforms: core.processUniforms,
  processVaryings: core.processVaryings,
  processOuts: core.processOuts,
  getTypeCount: core.getTypeCount,
  processAttributes: core.processAttributes,
  splitToWords: core.splitToWords,
  cutOut: core.cutOut,
  getUniformShaderDeclaration: core.getUniformShaderDeclaration,
  getTexturesShaderDeclaration: core.getTexturesShaderDeclaration,
});
ShaderProcessorGLSL.MARKER = "@@@";



return {ShaderProcessorGLSL, UniformLine};
}
