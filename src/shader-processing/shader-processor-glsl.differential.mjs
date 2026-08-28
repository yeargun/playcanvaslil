import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  BindGroupFormat,
  BindTextureFormat,
} from "../../upstream/engine/src/platform/graphics/bind-group-format.js";
import {
  SAMPLETYPE_DEPTH,
  SAMPLETYPE_FLOAT,
  SAMPLETYPE_UINT,
  TEXTUREDIMENSION_2D,
  TEXTUREDIMENSION_2D_ARRAY,
  TYPE_FLOAT32,
  TYPE_INT8,
  TYPE_UINT8,
  UNIFORMTYPE_FLOAT,
  UNIFORMTYPE_VEC4,
} from "../../upstream/engine/src/platform/graphics/constants.js";
import { createStripTransform } from "../../upstream/engine/utils/plugins/esbuild-strip.mjs";
import {
  UniformBufferFormat,
  UniformFormat,
} from "../../upstream/engine/src/platform/graphics/uniform-buffer-format.js";
import {
  ShaderProcessorGLSL as Port,
  UniformLine as PortUniformLine,
} from "./shader-processor-glsl.facade.js";

const here = dirname(fileURLToPath(import.meta.url));
const upstreamPath = resolve(here, "../../upstream/engine/src/platform/graphics/shader-processor-glsl.js");
let releaseSource = createStripTransform([
  "Debug.assert",
  "Debug.call",
  "Debug.error",
])(readFileSync(upstreamPath, "utf8"), upstreamPath);
for (const specifier of [
  "../../core/debug.js",
  "./constants.js",
  "./uniform-buffer-format.js",
  "./bind-group-format.js",
]) {
  const url = pathToFileURL(resolve(dirname(upstreamPath), specifier)).href;
  releaseSource = releaseSource.replace(`'${specifier}'`, JSON.stringify(url));
}
const {
  ShaderProcessorGLSL: Upstream,
  UniformLine: UpstreamUniformLine,
} = await import(`data:text/javascript;base64,${Buffer.from(releaseSource).toString("base64")}`);

const checks = [];
const check = (name, callback) => {
  callback();
  checks.push(name);
};
const makeDevice = () => ({
  scope: { resolve: (name) => ({ name }) },
  createBindGroupFormatImpl: () => ({ destroy() {} }),
});
const makeOptions = (device) => ({
  uniformFormats: [new UniformBufferFormat(device, [
    new UniformFormat("viewValue", UNIFORMTYPE_FLOAT),
    new UniformFormat("viewColors", UNIFORMTYPE_VEC4, 2),
  ]), null, null],
  bindGroupFormats: [new BindGroupFormat(device, [
    new BindTextureFormat("viewTex", 3, TEXTUREDIMENSION_2D, SAMPLETYPE_FLOAT),
  ]), null, null],
  hasUniform: (name) => name === "viewValue" || name === "viewColors",
  hasTexture: (name) => name === "viewTex",
  getVertexElement: (semantic) => ({
    POSITION: { dataType: TYPE_INT8, normalize: false, asInt: false },
    NORMAL: { dataType: TYPE_FLOAT32, normalize: false, asInt: false },
    COLOR: { dataType: TYPE_UINT8, normalize: false, asInt: false },
  })[semantic],
});
const uniformSnapshot = (format) => ({
  byteSize: format.byteSize,
  uniforms: format.uniforms.map(({ name, shortName, type, count, offset, byteSize }) => (
    { name, shortName, type, count, offset, byteSize }
  )),
});
const bindSnapshot = (format) => format.textureFormats.map(({
  name, visibility, textureDimension, sampleType, slot, hasSampler, samplerName,
}) => ({ name, visibility, textureDimension, sampleType, slot, hasSampler, samplerName }));
const uniformDataSnapshot = ({ code, meshUniformBufferFormat, meshBindGroupFormat }) => ({
  code,
  meshUniformBufferFormat: uniformSnapshot(meshUniformBufferFormat),
  meshBindGroupFormat: bindSnapshot(meshBindGroupFormat),
});
const runSnapshot = ({
  vshader, fshader, attributes, meshUniformBufferFormat, meshBindGroupFormat,
}) => ({
  vshader,
  fshader,
  attributes: [...attributes],
  meshUniformBufferFormat: uniformSnapshot(meshUniformBufferFormat),
  meshBindGroupFormat: bindSnapshot(meshBindGroupFormat),
});

check("static surface and MARKER", () => {
  assert.deepEqual(Object.getOwnPropertyNames(Port), Object.getOwnPropertyNames(Upstream));
  for (const name of Object.getOwnPropertyNames(Upstream)) {
    if (typeof Upstream[name] === "function") assert.equal(Port[name].length, Upstream[name].length, name);
  }
  assert.deepEqual(Object.getOwnPropertyDescriptor(Port, "MARKER"), Object.getOwnPropertyDescriptor(Upstream, "MARKER"));
});

check("UniformLine export", () => {
  for (const line of [
    "vec4 tint",
    "highp sampler2D colorMap",
    "lowp vec4 tints[4]",
    "vec4 dynamic[COUNT]",
  ]) {
    const expectedShader = { failed: false };
    const actualShader = { failed: false };
    const expected = new UpstreamUniformLine(line, expectedShader);
    const actual = new PortUniformLine(line, actualShader);
    assert.deepEqual({ ...actual }, { ...expected });
    assert.equal(actual instanceof PortUniformLine, true);
    assert.equal(actualShader.failed, expectedShader.failed);
  }
  assert.equal(PortUniformLine.name, UpstreamUniformLine.name);
  assert.equal(PortUniformLine.length, UpstreamUniformLine.length);
  assert.deepEqual(Reflect.ownKeys(PortUniformLine.prototype), Reflect.ownKeys(UpstreamUniformLine.prototype));
});

check("extract", () => {
  const source = "#version 450\n attribute vec3 position;;\nvarying highp vec2 uv;\nuniform vec4 tint;\nout vec4 color;\nvoid main() {}";
  assert.deepEqual(Port.extract(source), Upstream.extract(source));
  assert.deepEqual(Port.extract(source, true), Upstream.extract(source, true));
  assert.deepEqual(Port.extract("void main() {}"), Upstream.extract("void main() {}"));
});

check("parseUniformLines", () => {
  const lines = ["mediump vec4 tint", "samplerCube env", "float weights[3]"];
  const expected = Upstream.parseUniformLines(lines, { failed: false });
  const actual = Port.parseUniformLines(lines, { failed: false });
  assert.deepEqual(actual.map((line) => ({ ...line })), expected.map((line) => ({ ...line })));
  assert.equal(actual.every((line) => line instanceof PortUniformLine), true);
});

check("processUniforms", () => {
  const lines = [
    "float viewValue",
    "vec4 tint",
    "vec4 weights[2]",
    "sampler2D viewTex",
    "highp sampler2D hdr",
    "sampler2DShadow shadow",
    "samplerCube env",
    "isampler3D cells",
    "usampler2DArray ids",
    "samplerBogus unknown",
  ];
  const expectedDevice = makeDevice();
  const actualDevice = makeDevice();
  const expected = Upstream.processUniforms(
    expectedDevice,
    Upstream.parseUniformLines(lines, { failed: false }),
    makeOptions(expectedDevice),
    { failed: false },
  );
  const actual = Port.processUniforms(
    actualDevice,
    Port.parseUniformLines(lines, { failed: false }),
    makeOptions(actualDevice),
    { failed: false },
  );
  assert.deepEqual(uniformDataSnapshot(actual), uniformDataSnapshot(expected));
  assert.equal(actual.meshUniformBufferFormat instanceof UniformBufferFormat, true);
  assert.equal(actual.meshBindGroupFormat instanceof BindGroupFormat, true);
  assert.equal(actual.meshUniformBufferFormat.uniforms.every((item) => item instanceof UniformFormat), true);
  assert.equal(actual.meshBindGroupFormat.textureFormats.every((item) => item instanceof BindTextureFormat), true);

  const expectedEmptyDevice = makeDevice();
  const actualEmptyDevice = makeDevice();
  assert.deepEqual(
    uniformDataSnapshot(Port.processUniforms(actualEmptyDevice, [], makeOptions(actualEmptyDevice), {})),
    uniformDataSnapshot(Upstream.processUniforms(expectedEmptyDevice, [], makeOptions(expectedEmptyDevice), {})),
  );
});

check("processVaryings", () => {
  const lines = ["highp vec2 uv", "flat int material"];
  const expectedMap = new Map();
  const actualMap = new Map();
  assert.equal(Port.processVaryings(lines, actualMap, true), Upstream.processVaryings(lines, expectedMap, true));
  assert.deepEqual([...actualMap], [...expectedMap]);
  assert.equal(
    Port.processVaryings(["flat int material", "highp vec2 uv"], actualMap, false),
    Upstream.processVaryings(["flat int material", "highp vec2 uv"], expectedMap, false),
  );
  assert.equal(
    Port.processVaryings(["vec2 missing"], new Map(), false),
    Upstream.processVaryings(["vec2 missing"], new Map(), false),
  );
});

check("processOuts", () => {
  const lines = ["vec4 color", "uvec4 objectId"];
  assert.equal(Port.processOuts(lines), Upstream.processOuts(lines));
});

check("getTypeCount", () => {
  for (const type of ["float", "vec2", "ivec4", "mat3", "vec10", ""]) {
    assert.equal(Port.getTypeCount(type), Upstream.getTypeCount(type));
  }
});

check("processAttributes", () => {
  const lines = ["vec3 vertex_position", "vec3 vertex_normal", "vec4 vertex_color", "vec2 mystery", "vec2 omitted"];
  const attributes = {
    vertex_position: "POSITION",
    vertex_normal: "NORMAL",
    vertex_color: "COLOR",
    mystery: "BOGUS",
  };
  const expectedMap = new Map();
  const actualMap = new Map();
  assert.equal(
    Port.processAttributes(lines, attributes, actualMap, makeOptions(makeDevice())),
    Upstream.processAttributes(lines, attributes, expectedMap, makeOptions(makeDevice())),
  );
  assert.deepEqual([...actualMap], [...expectedMap]);
});

check("splitToWords", () => {
  for (const line of ["  highp   vec4\tcolor ", "vec3 position", ""]) {
    assert.deepEqual(Port.splitToWords(line), Upstream.splitToWords(line));
  }
});

check("cutOut", () => {
  for (const args of [["abcdef", 1, 4, "X"], ["abcdef", -2, 99, ""], ["abcdef", 4, 2, "!"]]) {
    assert.equal(Port.cutOut(...args), Upstream.cutOut(...args));
  }
});

check("getUniformShaderDeclaration", () => {
  const format = new UniformBufferFormat(makeDevice(), [
    new UniformFormat("value", UNIFORMTYPE_FLOAT),
    new UniformFormat("colors", UNIFORMTYPE_VEC4, 3),
  ]);
  assert.equal(Port.getUniformShaderDeclaration(format, 0, 4), Upstream.getUniformShaderDeclaration(format, 0, 4));
  assert.equal(Port.getUniformShaderDeclaration(format, 99, 4), Upstream.getUniformShaderDeclaration(format, 99, 4));
  const unsupported = { uniforms: [{ type: 999, count: 0, shortName: "unknown" }] };
  assert.equal(Port.getUniformShaderDeclaration(unsupported, 0, 4), Upstream.getUniformShaderDeclaration(unsupported, 0, 4));
});

check("getTexturesShaderDeclaration", () => {
  const format = new BindGroupFormat(makeDevice(), [
    new BindTextureFormat("color", 3, TEXTUREDIMENSION_2D, SAMPLETYPE_FLOAT),
    new BindTextureFormat("shadow", 3, TEXTUREDIMENSION_2D, SAMPLETYPE_DEPTH),
    new BindTextureFormat("layers", 3, TEXTUREDIMENSION_2D_ARRAY, SAMPLETYPE_UINT),
  ]);
  assert.equal(Port.getTexturesShaderDeclaration(format, 1), Upstream.getTexturesShaderDeclaration(format, 1));
  const unsupported = {
    textureFormats: [{ name: "unknown", slot: 0, textureDimension: "bogus", sampleType: SAMPLETYPE_FLOAT, hasSampler: false }],
  };
  assert.equal(Port.getTexturesShaderDeclaration(unsupported, 1), Upstream.getTexturesShaderDeclaration(unsupported, 1));
});

check("run", () => {
  const definition = (device) => ({
    attributes: { vertex_position: "POSITION", vertex_color: "COLOR" },
    processingOptions: makeOptions(device),
    vshader: [
      "#version 450",
      "attribute vec3 vertex_position;",
      "attribute vec4 vertex_color;",
      "varying highp vec2 uv;",
      "uniform float viewValue;",
      "uniform vec4 tint[2];",
      "uniform highp sampler2D hdr;",
      "void main() { uv = vec2(0.0); }",
    ].join("\n"),
    fshader: [
      "#version 450",
      "varying highp vec2 uv;",
      "uniform vec4 tint[2];",
      "uniform sampler2DShadow shadow;",
      "out vec4 color;",
      "void main() { color = tint[0]; }",
    ].join("\n"),
  });
  const expectedDevice = makeDevice();
  const actualDevice = makeDevice();
  const expected = Upstream.run(expectedDevice, definition(expectedDevice), { failed: false });
  const actual = Port.run(actualDevice, definition(actualDevice), { failed: false });
  assert.deepEqual(runSnapshot(actual), runSnapshot(expected));
  assert.equal(actual.meshUniformBufferFormat instanceof UniformBufferFormat, true);
  assert.equal(actual.meshBindGroupFormat instanceof BindGroupFormat, true);
});

console.log(`shader-processor-glsl differential: ${checks.length}/${checks.length} fixtures passed`);
