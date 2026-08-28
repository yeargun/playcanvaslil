# `core/math` Port Status

Scope: `playcanvas/engine/src/core/math` at
`dbd2f580915273d50cfb12936af25d45ae636a04`.

| Upstream file | Status | Evidence |
| --- | --- | --- |
| `bit-packing.js` | converted | upstream examples, API shape, 100,000 differential vectors, open/closed size and runtime |
| `constants.js` | queued | not yet translated |
| `math.js` | queued | not yet translated; overload and random host boundary required |
| `random.js` | queued | not yet translated |
| `kernel.js` | queued | not yet translated |
| `float-packing.js` | queued | not yet translated |
| `blue-noise.js` | queued | not yet translated |
| `vec2.js` | queued | not yet translated; exported constructor identity must be preserved |
| `vec3.js` | queued | not yet translated; exported constructor identity must be preserved |
| `vec4.js` | queued | not yet translated; exported constructor identity must be preserved |
| `quat.js` | queued | not yet translated; depends on vector/matrix types |
| `mat3.js` | queued | not yet translated; exported constructor identity must be preserved |
| `mat4.js` | queued | not yet translated; exported constructor identity must be preserved |
| `color.js` | queued | not yet translated; exported constructor identity must be preserved |
| `curve-evaluator.js` | queued | not yet translated |
| `curve.js` | queued | not yet translated |
| `curve-set.js` | queued | not yet translated |

“Converted” means the file has an algorithm-preserving `.lil` implementation,
open-world API checks, closed-world consumer checks, differential behavior
coverage, and measured artifacts. It does not mean all of `core/math` is ready.
