import { Debug } from "../../upstream/engine/src/core/debug.js";
import {
  semanticToLocation,
  uniformTypeToNameMapWGSL,
  uniformTypeToNameWGSL,
} from "../../upstream/engine/src/platform/graphics/constants.js";
import {
  BindGroupFormat,
  BindStorageBufferFormat,
  BindStorageTextureFormat,
  BindTextureFormat,
  BindUniformBufferFormat,
} from "../../upstream/engine/src/platform/graphics/bind-group-format.js";
import {
  UniformBufferFormat,
  UniformFormat,
} from "../../upstream/engine/src/platform/graphics/uniform-buffer-format.js";
import { gpuTextureFormats } from "../../upstream/engine/src/platform/graphics/webgpu/constants.js";

export { semanticToLocation, uniformTypeToNameMapWGSL, gpuTextureFormats };

export function assertPc(condition, message) {
  Debug.assert(condition, message);
}

export function assertPcContext(condition, message, context) {
  Debug.assert(condition, message, context);
}

export function errorPc(message, context) {
  Debug.error(message, context);
}

export function warnPc(message, context) {
  Debug.warn(message, context);
}

export function debugCall(callback) {
  Debug.call(callback);
}

export function uniformTypeName(a) {
  return uniformTypeToNameWGSL[a]?.[0] ?? null;
}

export function newUniform(a, b, c) {
  return new UniformFormat(a, b, c);
}

export function newUniformBuffer(a, b) {
  return new UniformBufferFormat(a, b);
}

export function newUniformBinding(a, b) {
  return new BindUniformBufferFormat(a, b);
}

export function newTextureBinding(a, b, c, d, e, f, g) {
  return new BindTextureFormat(a, b, c, d, e, f, g);
}

export function newStorageBufferBinding(a, b, c) {
  return new BindStorageBufferFormat(a, b, c);
}

export function newStorageTextureBinding(a, b, c, d, e) {
  return new BindStorageTextureFormat(a, b, c, d, e);
}

export function newBindGroup(a, b) {
  return new BindGroupFormat(a, b);
}

export function appendMatch(a, b) {
  a.push(...b);
}
