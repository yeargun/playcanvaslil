import {
  bindGroupNames,
  semanticToLocation,
  uniformTypeToName,
} from "../../upstream/engine/src/platform/graphics/constants.js";
import {
  BindGroupFormat,
  BindTextureFormat,
} from "../../upstream/engine/src/platform/graphics/bind-group-format.js";
import {
  UniformBufferFormat,
  UniformFormat,
} from "../../upstream/engine/src/platform/graphics/uniform-buffer-format.js";

export { bindGroupNames, semanticToLocation, uniformTypeToName };

export function newUniformFormat(name, type, count) {
  return new UniformFormat(name, type, count);
}

export function newUniformBufferFormat(device, uniforms) {
  return new UniformBufferFormat(device, uniforms);
}

export function newBindTextureFormat(name, visibility, dimension, sampleType) {
  return new BindTextureFormat(name, visibility, dimension, sampleType);
}

export function newBindGroupFormat(device, formats) {
  return new BindGroupFormat(device, formats);
}
