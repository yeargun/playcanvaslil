import { BitPacking } from "../upstream/engine/src/core/math/bit-packing.js";

export function runBitPackingWorkload(iterations) {
  let storage = 1831565813;
  let checksum = 0;

  for (let index = 0; index < iterations; index++) {
    const shift = index & 31;
    const mask = (index >>> 3) & 255;
    storage = BitPacking.set(storage, index, shift, mask);
    checksum ^= BitPacking.get(storage, shift, mask);
    if (BitPacking.any(storage, shift, mask)) {
      checksum ^= index;
    }
    if (BitPacking.all(storage, shift, mask)) {
      checksum ^= storage;
    }
  }

  return checksum;
}
