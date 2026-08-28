import { Debug } from "../../upstream/engine/src/core/debug.js";

export function debugDefinitionOptions(options, device) {
  Debug.assert(options);
  Debug.assert(!options.vertexDefines || options.vertexDefines instanceof Map);
  Debug.assert(!options.vertexIncludes || options.vertexIncludes instanceof Map);
  Debug.assert(!options.fragmentDefines || options.fragmentDefines instanceof Map);
  Debug.assert(!options.fragmentIncludes || options.fragmentIncludes instanceof Map);
  Debug.assert(
    !options.useDualSourceBlending || device.supportsDualSourceBlending,
    "Dual-source blending is not supported by this graphics device.",
  );
}

export function debugOutputType(wgslOutType, glslOutType) {
  Debug.assert(wgslOutType, `Unknown output type translation: ${glslOutType} -> ${wgslOutType}`);
}

export function debugVertexCode(options) {
  Debug.assert(options.vertexCode);
}

export function debugFragmentCode(options) {
  Debug.assert(options.fragmentCode);
}

export function debugDuplicateAttribute(attribName, vsCode) {
  Debug.warn(
    `Attribute [${attribName}] already exists when extracting the attributes from the vertex shader, ignoring.`,
    { vsCode },
  );
}
