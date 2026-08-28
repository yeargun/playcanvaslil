import * as core from "./shader-processor-glsl.compiled.js";
import { installMethods } from "./facade-utils.js";

class UniformLine {
  constructor(line, shader) {
    const value = core.parseUniformLine(line, shader);
    Object.setPrototypeOf(value, new.target.prototype);
    return value;
  }
}

class ShaderProcessorGLSL {}

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

export { ShaderProcessorGLSL, UniformLine };
