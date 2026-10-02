// Port-owned API factory; the compiler supplies checked LilScript implementations.
import { installMethods } from "./facade-utils.js";
export function createFacade(core) {
const {preprocessorEvaluate, preprocessorEvaluateAtomicExpression, preprocessorInjectDefines, preprocessorKeep, preprocessorPreprocess, preprocessorProcessArraySize, preprocessorProcessParentheses, preprocessorRemoveEmptyLines, preprocessorRun, preprocessorSetSourceName, preprocessorStripComments, preprocessorStripUnusedColorAttachments} = core;



class Preprocessor {}

const run = (source, includes = new Map(), options = {}) => {
  preprocessorSetSourceName(Preprocessor.sourceName = options.sourceName);
  return preprocessorRun(source, includes, options);
};
const preprocess = (source, defines = new Map(), injectDefines, includes, stripDefines) => {
  preprocessorSetSourceName(Preprocessor.sourceName);
  return preprocessorPreprocess(source, defines, injectDefines, includes, stripDefines);
};

installMethods(Preprocessor, {
  run,
  stripUnusedColorAttachments: preprocessorStripUnusedColorAttachments,
  stripComments: preprocessorStripComments,
  processArraySize: preprocessorProcessArraySize,
  injectDefines: preprocessorInjectDefines,
  RemoveEmptyLines: preprocessorRemoveEmptyLines,
  _preprocess: preprocess,
  _keep: preprocessorKeep,
  evaluateAtomicExpression: preprocessorEvaluateAtomicExpression,
  processParentheses: preprocessorProcessParentheses,
  evaluate: preprocessorEvaluate,
});
Preprocessor.sourceName = undefined;



return {Preprocessor};
}
