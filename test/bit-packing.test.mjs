import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { BitPacking as candidate } from "../dist/bit-packing.js";
import { BitPacking as candidateBrotli } from "../dist/bit-packing.brotli.js";
import { BitPacking as candidateGzip } from "../dist/bit-packing.gzip.js";
import { BitPacking as candidateRaw } from "../dist/bit-packing.raw.js";
import { BitPacking as officialEsbuild } from "../dist/bit-packing.official-esbuild.js";
import { BitPacking as officialTerser } from "../dist/bit-packing.official-terser.js";
import { BitPacking as official } from "../upstream/engine/src/core/math/bit-packing.js";
import { runBitPackingWorkload as closedCandidate } from "../dist/closed-world.js";
import { runBitPackingWorkload as closedCandidateBrotli } from "../dist/closed-world.brotli.js";
import { runBitPackingWorkload as closedCandidateGzip } from "../dist/closed-world.gzip.js";
import { runBitPackingWorkload as closedCandidateRaw } from "../dist/closed-world.raw.js";
import { runBitPackingWorkload as closedOfficialEsbuild } from "../dist/closed-world.official-esbuild.js";
import { runBitPackingWorkload as closedOfficialTerser } from "../dist/closed-world.official-terser.js";
import { runBitPackingWorkload as closedOfficial } from "../benchmarks/closed-world.js";

const methods = ["all", "any", "get", "set"];
const publicLanes = [
  candidate,
  candidateBrotli,
  candidateGzip,
  candidateRaw,
  officialEsbuild,
  officialTerser,
];
const closedLanes = [
  closedCandidate,
  closedCandidateBrotli,
  closedCandidateGzip,
  closedCandidateRaw,
  closedOfficialEsbuild,
  closedOfficialTerser,
];

describe("BitPacking public contract", () => {
  it("preserves the exported object and method surface", () => {
    for (const lane of publicLanes) {
      assert.deepEqual(Object.keys(lane).sort(), methods);
      assert.deepEqual(Object.keys(lane).sort(), Object.keys(official).sort());
      for (const method of methods) {
        assert.equal(typeof lane[method], "function", method);
        assert.equal(lane[method].length, official[method].length, `${method}.length`);
        assert.equal(lane[method].name, official[method].name, `${method}.name`);
        assert.throws(() => Reflect.construct(lane[method], []), TypeError, `${method} constructibility`);
        const descriptor = Object.getOwnPropertyDescriptor(lane, method);
        const officialDescriptor = Object.getOwnPropertyDescriptor(official, method);
        assert.deepEqual(
          {
            configurable: descriptor.configurable,
            enumerable: descriptor.enumerable,
            writable: descriptor.writable,
          },
          {
            configurable: officialDescriptor.configurable,
            enumerable: officialDescriptor.enumerable,
            writable: officialDescriptor.writable,
          },
          `${method} descriptor`,
        );
      }
    }
  });

  it("passes the examples from the upstream test", () => {
    let data = 0;
    data = candidate.set(data, 0b11, 1, 0b11);
    assert.equal(data, 0b110);
    data = candidate.set(data, 0, 1, 0b11);
    assert.equal(data, 0);
    data = candidate.set(data, 1, 3);
    assert.equal(data, 0b1000);

    const packed = 0b110011;
    assert.equal(candidate.get(packed, 0, 0b111111), packed);
    assert.equal(candidate.get(packed, 4, 0b11), 0b11);
    assert.equal(candidate.get(packed, 3), 0);
    assert.equal(candidate.get(packed, 5), 1);
    assert.equal(candidate.any(packed, 0, 0b111111), true);
    assert.equal(candidate.any(packed, 2, 0b11), false);
    assert.equal(candidate.any(packed, 2, 0b111), true);
    assert.equal(candidate.all(packed, 0, 0b111111), false);
    assert.equal(candidate.all(packed, 2, 0b11), false);
    assert.equal(candidate.all(packed, 4, 0b11), true);
  });
});

describe("BitPacking differential parity", () => {
  it("matches upstream for 100,000 deterministic 32-bit vectors", () => {
    let state = 0x6d2b79f5;
    const next = () => {
      state ^= state << 13;
      state ^= state >>> 17;
      state ^= state << 5;
      return state | 0;
    };

    for (let index = 0; index < 100_000; index += 1) {
      const storage = next();
      const value = next();
      const shift = next() & 63;
      const mask = next();

      for (const lane of publicLanes) {
        assert.equal(lane.set(storage, value, shift, mask), official.set(storage, value, shift, mask));
        assert.equal(lane.get(storage, shift, mask), official.get(storage, shift, mask));
        assert.equal(lane.all(storage, shift, mask), official.all(storage, shift, mask));
        assert.equal(lane.any(storage, shift, mask), official.any(storage, shift, mask));

        assert.equal(lane.set(storage, value, shift), official.set(storage, value, shift));
        assert.equal(lane.get(storage, shift), official.get(storage, shift));
        assert.equal(lane.all(storage, shift), official.all(storage, shift));
        assert.equal(lane.any(storage, shift), official.any(storage, shift));
      }
    }
  });
});

describe("closed-world consumer", () => {
  it("matches every optimized artifact at multiple iteration counts", () => {
    for (const iterations of [0, 1, 31, 32, 257, 10_000]) {
      const expected = closedOfficial(iterations);
      for (const lane of closedLanes) {
        assert.equal(lane(iterations), expected, `iterations=${iterations}`);
      }
    }
  });
});
