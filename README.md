# PlayCanvasLil

An independent, file-by-file LilScript port of one PlayCanvas Engine subsystem:
[`src/core/math`](https://github.com/playcanvas/engine/tree/main/src/core/math).
This is not an official PlayCanvas project and it is not a port of the full
engine.

**Site:** [yeargun.github.io/playcanvaslil](https://yeargun.github.io/playcanvaslil/)

## Current Status

The upstream engine is pinned at `dbd2f580915273d50cfb12936af25d45ae636a04`
as the `upstream/engine` Git submodule. The scope has 17 JavaScript files.
`bit-packing.js` is the first converted file, so current coverage is **1 / 17**.
See [PORT_STATUS.md](PORT_STATUS.md) for the file ledger.

The algorithms are kept in LilScript. The open-world build uses a small
JavaScript facade only to reproduce PlayCanvas's exact exported `BitPacking`
object: keys, defaults, arities, and non-constructible methods. The closed-world
build has no facade or public object and lets the compiler optimize the complete
consumer graph.

## First Result

Canonical gzip-9 and Brotli-11 come from `lilscript-codec`. All rows include the
same license banner. LilScript uses a separate compile for each size objective;
the official baseline is the smaller valid esbuild or Terser result for that
metric.

| Contract | Metric | LilScript | Best official | Difference |
| --- | ---: | ---: | ---: | ---: |
| Open-world ESM | raw | 537 B | 236 B | +127.5% |
| Open-world ESM | gzip-9 | 264 B | 179 B | +47.5% |
| Open-world ESM | Brotli-11 | 228 B | 169 B | +34.9% |
| Closed-world kernel | raw | 403 B | 410 B | -1.7% |
| Closed-world kernel | gzip-9 | 284 B | 283 B | +0.4% |
| Closed-world kernel | Brotli-11 | 277 B | 262 B | +5.7% |

This is useful evidence in both directions. LilScript does not optimize this
tiny reusable object better today. The facade is linked after LilScript's
objective search, which exposes an integration limitation: the compiler cannot
score the final reusable artifact yet. In the closed-world kernel it inlines the
calls, but currently leaves an unreachable materialized method table behind.
That output is slightly smaller raw and slightly larger after gzip/Brotli. These
contracts are reported separately and are never compared to each other.

The repository also records a balanced 12-block Node benchmark for both
contracts. This is a small synthetic kernel, not a broad engine performance
claim. Current medians, every raw sample, and machine details are in
`reports/performance.json`.

## Correctness

- Exact cases from PlayCanvas's `bit-packing.test.mjs`
- 100,000 deterministic 32-bit differential vectors
- Exact public keys, function types, arities, defaults, and constructibility
- Open-world candidate, esbuild baseline, and Terser baseline all checked
- Closed-world checksum checked across all three artifacts
- No algorithm substitution: LilScript spells JavaScript's `~x` as `x ^ -1`,
  the equivalent signed-i32 bitwise complement

## Reproduce

```sh
git clone --recurse-submodules https://github.com/yeargun/playcanvaslil.git
cd playcanvaslil
git clone https://github.com/yeargun/lilscript.git ../lilscript
git -C ../lilscript checkout "$(cat LILSCRIPT_REVISION)"
cargo build --release --bins --manifest-path ../lilscript/Cargo.toml
npm ci
npm test
npm run measure
npm run benchmark
npm run check:site
```

By default, scripts use the compiler and codec scorer from `../lilscript` at the
revision in `LILSCRIPT_REVISION`. Override them with `LILSCRIPT_COMPILER` and
`LILSCRIPT_CODEC`, or set `LILSCRIPT_ROOT`. Reports retain the compiler binary,
codec binary, config, and output hashes, and record whether the compiler source
tree was dirty. Measurement rejects a dirty or mismatched compiler by default;
`PLAYCANVASLIL_ALLOW_DIRTY_COMPILER=1` is an explicit local-only escape hatch.

`npm run test:artifact` and the Pages workflow validate the checked-in artifacts
without requiring a compiler checkout.

## Rules For Each File

1. Pin the upstream source and tests before translation.
2. Keep algorithms, operation ordering, mutations, and explicit performance
   techniques unchanged.
3. Make numeric and aggregate types explicit in `.lil`.
4. Gate public API shape and deterministic differential behavior before size or
   speed measurements.
5. Report open-world and closed-world results independently, including losses.
6. Convert one source file at a time and update the ledger only after all gates
   pass.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md). PlayCanvas is copyright
PlayCanvas Ltd.
