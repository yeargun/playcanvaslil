import assert from "node:assert/strict";
import { describe, it } from "node:test";

import * as candidate from "../dist/shader-processing.js";
import * as official from "../dist/shader-processing.official.js";
import * as closedCandidate from "../dist/shader-processing.closed.js";
import * as closedOfficial from "../dist/shader-processing.closed.official.js";

const exports = [
  "Preprocessor",
  "ShaderDefinitionUtils",
  "ShaderProcessorGLSL",
  "UniformLine",
  "WebgpuShaderProcessorWGSL",
];

function descriptorShape(value) {
  return Object.fromEntries(Reflect.ownKeys(value).map((key) => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return [key, {
      configurable: descriptor.configurable,
      enumerable: descriptor.enumerable,
      writable: descriptor.writable,
      kind: typeof descriptor.value,
      length: typeof descriptor.value === "function" ? descriptor.value.length : undefined,
      name: typeof descriptor.value === "function" ? descriptor.value.name : undefined,
    }];
  }));
}

function makeDevice(overrides = {}) {
  let key = 0;
  return {
    isWebGPU: false,
    maxColorAttachments: 1,
    maxPrecision: "highp",
    precision: "highp",
    capsDefines: new Map(),
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
    scope: { resolve: (name) => ({ name }) },
    createBindGroupFormatImpl: () => ({ key: key++, destroy() {} }),
    ...overrides,
  };
}

function makeProcessingOptions() {
  return {
    uniformFormats: [],
    bindGroupFormats: [],
    hasUniform: () => false,
    hasTexture: () => false,
    getVertexElement: () => null,
  };
}

function processingSnapshot(result) {
  return {
    vshader: result.vshader,
    fshader: result.fshader,
    attributes: [...result.attributes],
    uniforms: result.meshUniformBufferFormat?.uniforms.map(({ name, type, count }) => ({ name, type, count })),
    textures: result.meshBindGroupFormat?.textureFormats.map(({ name, sampleType, slot }) => ({ name, sampleType, slot })),
  };
}

describe("shader-processing public ABI", () => {
  it("preserves exports and static class descriptors", () => {
    assert.deepEqual(Object.keys(candidate), exports);
    assert.deepEqual(Object.keys(candidate), Object.keys(official));
    for (const name of exports) {
      assert.deepEqual(descriptorShape(candidate[name]), descriptorShape(official[name]), name);
    }
  });

  it("preserves representative helpers", () => {
    const source = "uniform color: vec4f;\n@fragment fn fragmentMain(input: FragmentInput) -> FragmentOutput {}";
    assert.deepEqual(
      candidate.WebgpuShaderProcessorWGSL.extract(source),
      official.WebgpuShaderProcessorWGSL.extract(source),
    );
    assert.equal(
      candidate.ShaderProcessorGLSL.getTypeCount("mat4"),
      official.ShaderProcessorGLSL.getTypeCount("mat4"),
    );
    assert.deepEqual(
      candidate.ShaderDefinitionUtils.collectAttributes("attribute vec3 vertex_position;"),
      official.ShaderDefinitionUtils.collectAttributes("attribute vec3 vertex_position;"),
    );
  });
});

describe("closed-world entry", () => {
  it("preserves exported functions and preprocessing output", () => {
    assert.deepEqual(Object.keys(closedCandidate), Object.keys(closedOfficial));
    assert.equal(closedCandidate.preprocess("plain"), closedOfficial.preprocess("plain"));
    const source = "#define ENABLED\n#if defined(ENABLED)\nuniform value: f32;\n#endif\n";
    assert.equal(
      closedCandidate.preprocess(source, new Map(), {}),
      closedOfficial.preprocess(source, new Map(), {}),
    );
  });

  it("executes every closed entry with equivalent results", () => {
    const definitionOptions = {
      vertexCode: "attribute vec3 vertex_position;\nvoid main(void) {}",
      fragmentCode: "void main(void) { gl_FragColor = vec4(1.0); }",
    };
    assert.deepEqual(
      closedCandidate.createDefinition(makeDevice(), definitionOptions),
      closedOfficial.createDefinition(makeDevice(), definitionOptions),
    );

    const glslDefinition = {
      attributes: { vertex_position: "POSITION" },
      processingOptions: makeProcessingOptions(),
      vshader: "attribute vec3 vertex_position;\nuniform float scale;\nvoid main(void) {}",
      fshader: "uniform float scale;\nout vec4 color;\nvoid main(void) { color = vec4(scale); }",
    };
    assert.deepEqual(
      processingSnapshot(closedCandidate.processGlsl(makeDevice(), glslDefinition, { failed: false })),
      processingSnapshot(closedOfficial.processGlsl(makeDevice(), glslDefinition, { failed: false })),
    );

    const wgslDefinition = {
      attributes: { vertex_position: "POSITION" },
      processingOptions: makeProcessingOptions(),
      useDualSourceBlending: false,
      vshader: "attribute vertex_position: vec3f;\nuniform scale: f32;\n@vertex fn vertexMain(input: VertexInput) -> VertexOutput { var output: VertexOutput; output.position = vec4f(input.vertex_position, 1.0); return output; }",
      fshader: "uniform scale: f32;\n@fragment fn fragmentMain(input: FragmentInput) -> FragmentOutput { var output: FragmentOutput; output.color = vec4f(scale); return output; }",
    };
    assert.deepEqual(
      processingSnapshot(closedCandidate.processWgsl(makeDevice({ isWebGPU: true }), wgslDefinition, { failed: false })),
      processingSnapshot(closedOfficial.processWgsl(makeDevice({ isWebGPU: true }), wgslDefinition, { failed: false })),
    );
  });
});
