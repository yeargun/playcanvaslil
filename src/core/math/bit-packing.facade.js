import { BitPacking as compiledBitPacking } from "./bit-packing.compiled.js";

const BitPacking = {
  set(storage, value, shift, mask = 1) {
    return compiledBitPacking.set(compiledBitPacking, storage, value, shift, mask);
  },

  get(storage, shift, mask = 1) {
    return compiledBitPacking.get(compiledBitPacking, storage, shift, mask);
  },

  all(storage, shift, mask = 1) {
    return compiledBitPacking.all(compiledBitPacking, storage, shift, mask);
  },

  any(storage, shift, mask = 1) {
    return compiledBitPacking.any(compiledBitPacking, storage, shift, mask);
  },
};

export { BitPacking };
