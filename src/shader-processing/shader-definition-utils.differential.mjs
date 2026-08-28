import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { createStripTransform } from "../../upstream/engine/utils/plugins/esbuild-strip.mjs";
import { ShaderDefinitionUtils as DevelopmentUpstream } from "../../upstream/engine/src/platform/graphics/shader-definition-utils.js";
import * as developmentCore from "./shader-definition-utils.development.compiled.js";
import { ShaderDefinitionUtils as Port } from "../../dist/shader-processing.js";

const here = dirname(fileURLToPath(import.meta.url));
const upstreamPath = resolve(here, "../../upstream/engine/src/platform/graphics/shader-definition-utils.js");
let releaseSource = createStripTransform(["Debug.assert", "Debug.warn"])(
  readFileSync(upstreamPath, "utf8"),
  upstreamPath,
);
for (const specifier of [
  "../../core/debug.js",
  "./constants.js",
  "./shader-chunks/frag/gles3.js",
  "./shader-chunks/vert/gles3.js",
  "./shader-chunks/frag/webgpu.js",
  "./shader-chunks/vert/webgpu.js",
  "./shader-chunks/frag/webgpu-wgsl.js",
  "./shader-chunks/vert/webgpu-wgsl.js",
  "./shader-chunks/frag/shared.js",
  "./shader-chunks/frag/shared-wgsl.js",
  "./shader-chunks/frag/half-types.js",
]) {
  const url = pathToFileURL(resolve(dirname(upstreamPath), specifier)).href;
  releaseSource = releaseSource.replace(`'${specifier}'`, JSON.stringify(url));
}
const { ShaderDefinitionUtils: ReleaseUpstream } = await import(
  `data:text/javascript;base64,${Buffer.from(releaseSource).toString("base64")}`
);

class DevelopmentPort {
  static createDefinition(device, options) {
    return developmentCore.createDefinition(DevelopmentPort, device, options);
  }

  static getWGSLEnables(device, shaderType, useDualSourceBlending = false) {
    return developmentCore.getWGSLEnables(device, shaderType, useDualSourceBlending);
  }

  static getDefinesCode(device, defines) {
    return developmentCore.getDefinesCode(device, defines);
  }

  static getShaderNameCode(name) {
    return developmentCore.getShaderNameCode(name);
  }

  static versionCode(device) {
    return developmentCore.versionCode(device);
  }

  static precisionCode(device, forcePrecision) {
    return developmentCore.precisionCode(device, forcePrecision);
  }

  static collectAttributes(vsCode) {
    return developmentCore.collectAttributes(vsCode);
  }
}

const checks = [];
const check = (name, callback) => {
  callback();
  checks.push(name);
};

const makeDevice = (overrides = {}) => ({
  isWebGPU: false,
  maxColorAttachments: 3,
  maxPrecision: "highp",
  precision: "mediump",
  capsDefines: new Map([
    ["CAPS_ALPHA", ""],
    ["CAPS_COUNT", "7"],
  ]),
  supportsDualSourceBlending: false,
  supportsShaderF16: false,
  supportsPrimitiveIndex: false,
  supportsSubgroups: false,
  supportsSubgroupId: false,
  supportsLinearIndexing: false,
  supportsUnrestrictedPointerParameters: false,
  supportsPointerCompositeAccess: false,
  supportsPacked4x8IntegerDotProduct: false,
  supportsTextureAndSamplerLet: false,
  ...overrides,
});

const snapshotStatic = (value) => Object.fromEntries(
  Object.getOwnPropertyNames(value).map((name) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, name);
    return [name, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      kind: typeof descriptor.value,
      length: typeof descriptor.value === "function" ? descriptor.value.length : undefined,
      name: typeof descriptor.value === "function" ? descriptor.value.name : undefined,
    }];
  }),
);

const captureConsole = (callback) => {
  const calls = [];
  const error = console.error;
  const warn = console.warn;
  console.error = (...args) => calls.push(["error", ...args]);
  console.warn = (...args) => calls.push(["warn", ...args]);
  try {
    return { calls, value: callback() };
  } finally {
    console.error = error;
    console.warn = warn;
  }
};

check("static surface, names, descriptors, and defaults", () => {
  assert.deepEqual(snapshotStatic(Port), snapshotStatic(ReleaseUpstream));
});

check("getWGSLEnables", () => {
  const all = makeDevice({
    supportsShaderF16: true,
    supportsPrimitiveIndex: true,
    supportsSubgroups: true,
    supportsSubgroupId: true,
    supportsLinearIndexing: true,
    supportsUnrestrictedPointerParameters: true,
    supportsPointerCompositeAccess: true,
    supportsPacked4x8IntegerDotProduct: true,
    supportsTextureAndSamplerLet: true,
  });
  for (const args of [
    [makeDevice(), "vertex"],
    [all, "vertex"],
    [all, "fragment"],
    [all, "fragment", true],
    [all, "compute"],
  ]) {
    assert.equal(Port.getWGSLEnables(...args), ReleaseUpstream.getWGSLEnables(...args));
  }
});

check("getDefinesCode", () => {
  const device = makeDevice();
  for (const defines of [
    undefined,
    null,
    new Map(),
    new Map([["LOCAL_FIRST", "one"], ["LOCAL_SECOND", ""]]),
  ]) {
    assert.equal(Port.getDefinesCode(device, defines), ReleaseUpstream.getDefinesCode(device, defines));
  }
});

check("getShaderNameCode", () => {
  for (const name of ["Untitled", "Forward pass", "name-with-symbols_$"]) {
    assert.equal(Port.getShaderNameCode(name), ReleaseUpstream.getShaderNameCode(name));
  }
});

check("versionCode", () => {
  assert.equal(Port.versionCode(makeDevice()), ReleaseUpstream.versionCode(makeDevice()));
  assert.equal(
    Port.versionCode(makeDevice({ isWebGPU: true })),
    ReleaseUpstream.versionCode(makeDevice({ isWebGPU: true })),
  );
});

check("precisionCode", () => {
  for (const [device, forcePrecision] of [
    [makeDevice({ precision: "lowp" }), undefined],
    [makeDevice(), "highp"],
    [makeDevice({ maxPrecision: "mediump" }), "highp"],
    [makeDevice({ maxPrecision: "lowp" }), "mediump"],
    [makeDevice({ precision: "highp" }), "invalid"],
    [makeDevice({ precision: "highp" }), ""],
  ]) {
    assert.equal(
      Port.precisionCode(device, forcePrecision),
      ReleaseUpstream.precisionCode(device, forcePrecision),
    );
  }
});

check("collectAttributes", () => {
  for (const source of [
    [
      "attribute vec3 vertex_position;",
      "attribute vec3 vertex_normal;",
      "attribute vec4 vertex_tangent;",
      "attribute vec2 vertex_texCoord0;",
      "attribute vec2 vertex_texCoord1;",
      "attribute vec2 vertex_texCoord2;",
      "attribute vec2 vertex_texCoord3;",
      "attribute vec2 vertex_texCoord4;",
      "attribute vec2 vertex_texCoord5;",
      "attribute vec2 vertex_texCoord6;",
      "attribute vec2 vertex_texCoord7;",
      "attribute vec4 vertex_color;",
      "attribute vec4 vertex_boneIndices;",
      "attribute vec4 vertex_boneWeights;",
      "attribute float customA;",
      "attribute float customB;",
    ].join("\n"),
    "#define attribute in\nattribute vec3 vertex_position;\nattribute float custom;",
    "attribute vec3 vertex_position;\nattribute vec3 vertex_position;",
    "attribute float before;\n//attribute float ignored;\nattribute float after;",
    "void main(void) {}",
  ]) {
    assert.deepEqual(Port.collectAttributes(source), ReleaseUpstream.collectAttributes(source));
  }
});

check("createDefinition GLSL defaults and object shape", () => {
  const options = {
    vertexCode: "attribute vec3 vertex_position;\nvoid main(void) {}",
    fragmentCode: "void main(void) { gl_FragColor = vec4(1.0); }",
  };
  const device = makeDevice();
  const actual = Port.createDefinition(device, options);
  const expected = ReleaseUpstream.createDefinition(device, options);
  assert.deepEqual(actual, expected);
  assert.deepEqual(Reflect.ownKeys(actual), Reflect.ownKeys(expected));
});

check("createDefinition GLSL WebGPU options, maps, and fallback outputs", () => {
  const vertexIncludes = new Map([["vertex", "include"]]);
  const fragmentIncludes = new Map([["fragment", "include"]]);
  const attributes = { vertex_position: "POSITION" };
  const meshUniformBufferFormat = { id: "uniform-format" };
  const meshBindGroupFormat = { id: "bind-group-format" };
  const options = {
    name: "WebGPU GLSL",
    attributes,
    vertexCode: "void main(void) {}",
    fragmentCode: "void main(void) {}",
    fragmentPreamble: "// preamble\n",
    vertexIncludes,
    fragmentIncludes,
    vertexDefines: new Map([["VERTEX_DEFINE", "1"]]),
    fragmentDefines: new Map([["FRAGMENT_DEFINE", "2"]]),
    fragmentOutputTypes: ["uvec4"],
    feedbackVaryings: ["position"],
    feedbackVaryingsMode: 1,
    useTransformFeedback: true,
    meshUniformBufferFormat,
    meshBindGroupFormat,
    useDualSourceBlending: true,
  };
  const device = makeDevice({ isWebGPU: true, supportsDualSourceBlending: true });
  assert.deepEqual(Port.createDefinition(device, options), ReleaseUpstream.createDefinition(device, options));
  const stringOutput = { ...options, fragmentOutputTypes: "ivec4" };
  assert.deepEqual(
    Port.createDefinition(device, stringOutput),
    ReleaseUpstream.createDefinition(device, stringOutput),
  );
});

check("createDefinition WGSL directives, aliases, and fallback outputs", () => {
  const options = {
    name: "WGSL pass",
    shaderLanguage: "wgsl",
    vertexCode: "@vertex fn vertexMain() {}",
    fragmentCode: "@fragment fn fragmentMain() {}",
    vertexDefines: new Map([["VERTEX_DEFINE", "1"]]),
    fragmentDefines: new Map([["FRAGMENT_DEFINE", "2"]]),
    fragmentOutputTypes: ["vec4", "ivec2"],
    useDualSourceBlending: true,
  };
  const device = makeDevice({
    isWebGPU: true,
    supportsDualSourceBlending: true,
    supportsShaderF16: true,
    supportsPrimitiveIndex: true,
    supportsSubgroups: true,
    supportsSubgroupId: true,
    supportsUnrestrictedPointerParameters: true,
    supportsPointerCompositeAccess: true,
    supportsPacked4x8IntegerDotProduct: true,
    supportsTextureAndSamplerLet: true,
  });
  assert.deepEqual(Port.createDefinition(device, options), ReleaseUpstream.createDefinition(device, options));
});

const dispatchSnapshot = (Utils, shaderLanguage) => {
  const names = [
    "getWGSLEnables",
    "getDefinesCode",
    "versionCode",
    "precisionCode",
    "getShaderNameCode",
  ];
  const descriptors = names.map((name) => Object.getOwnPropertyDescriptor(Utils, name));
  const calls = [];
  try {
    Utils.getWGSLEnables = (...args) => {
      calls.push(["getWGSLEnables", args]);
      return "ENABLE\n";
    };
    Utils.getDefinesCode = (...args) => {
      calls.push(["getDefinesCode", args]);
      return "DEFINES\n";
    };
    Utils.versionCode = (...args) => {
      calls.push(["versionCode", args]);
      return "VERSION\n";
    };
    Utils.precisionCode = (...args) => {
      calls.push(["precisionCode", args]);
      return "PRECISION\n";
    };
    Utils.getShaderNameCode = (...args) => {
      calls.push(["getShaderNameCode", args]);
      return "NAME\n";
    };
    const device = makeDevice({ maxColorAttachments: 0 });
    const options = { shaderLanguage, vertexCode: "VERTEX", fragmentCode: "FRAGMENT" };
    return { calls, value: Utils.createDefinition(device, options) };
  } finally {
    for (let index = 0; index < names.length; index++) {
      Object.defineProperty(Utils, names[index], descriptors[index]);
    }
  }
};

check("createDefinition preserves static dispatch and call order", () => {
  for (const shaderLanguage of [undefined, "wgsl"]) {
    assert.deepEqual(
      dispatchSnapshot(Port, shaderLanguage),
      dispatchSnapshot(ReleaseUpstream, shaderLanguage),
    );
  }
});

check("production strips Debug calls", () => {
  const device = makeDevice();
  const invalid = {
    shaderLanguage: "wgsl",
    vertexCode: "vertex",
    fragmentCode: "fragment",
    vertexDefines: [],
    vertexIncludes: [],
    fragmentDefines: [],
    fragmentIncludes: [],
    fragmentOutputTypes: ["notAType"],
    useDualSourceBlending: true,
  };
  const expected = captureConsole(() => ReleaseUpstream.createDefinition(device, invalid));
  const actual = captureConsole(() => Port.createDefinition(device, invalid));
  assert.deepEqual(actual, expected);

  const duplicate = "attribute float custom;\nattribute float custom;";
  assert.deepEqual(
    captureConsole(() => Port.collectAttributes(duplicate)),
    captureConsole(() => ReleaseUpstream.collectAttributes(duplicate)),
  );

  const missingCode = {};
  assert.deepEqual(
    captureConsole(() => Port.createDefinition(makeDevice(), missingCode)),
    captureConsole(() => ReleaseUpstream.createDefinition(makeDevice(), missingCode)),
  );
});

check("development retains Debug behavior", () => {
  const device = makeDevice();
  const invalid = {
    shaderLanguage: "wgsl",
    vertexCode: "vertex",
    fragmentCode: "fragment",
    vertexDefines: [],
    vertexIncludes: [],
    fragmentDefines: [],
    fragmentIncludes: [],
    fragmentOutputTypes: ["notAType"],
    useDualSourceBlending: true,
  };
  assert.deepEqual(
    captureConsole(() => DevelopmentPort.createDefinition(device, invalid)),
    captureConsole(() => DevelopmentUpstream.createDefinition(device, invalid)),
  );

  const duplicate = "attribute float custom;\nattribute float custom;";
  assert.deepEqual(
    captureConsole(() => DevelopmentPort.collectAttributes(duplicate)),
    captureConsole(() => DevelopmentUpstream.collectAttributes(duplicate)),
  );

  const missingCode = {};
  assert.deepEqual(
    captureConsole(() => DevelopmentPort.createDefinition(makeDevice(), missingCode)),
    captureConsole(() => DevelopmentUpstream.createDefinition(makeDevice(), missingCode)),
  );
});

console.log(`shader-definition-utils differential: ${checks.length}/${checks.length} fixtures passed`);
