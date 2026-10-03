# Current comparison with the original

PlayCanvas shader-processing subsystem: preprocessor, shader definitions, GLSL and WGSL processing, with shared host dependencies included. Original release Debug calls are stripped. This is not the complete engine.

Each compression row uses a separate LilScript compilation targeting that objective. Original results are the smallest of Terser, esbuild and Oxc for the named codec.

| Objective | LilScript bytes | Original minified bytes | Original minifier | LilScript build (s) | Original bundle + minify (s) |
|---|---:|---:|---|---:|---:|
| raw | 109,574 | 46,667 | Terser | 8.094 | 0.751 |
| gzip | 26,305 | 14,012 | Terser | 5.232 | 0.751 |
| brotli | 22,673 | 12,522 | Terser | 21.232 | 0.751 |

Original version: `playcanvas@2.22.0-beta.24`. gzip level 9; Brotli quality 11/window 22. Each time is one sequential fresh-output build on the recorded shared machine. Original timing starts from installed ESM and does not include the original repository’s TypeScript compilation. Dependency installation, tests and final file compression are excluded.

Validation: 234 checks across raw, gzip and Brotli main entries. This does not cover every package format or establish complete upstream API equivalence.

[Artifacts, hashes and settings](site/comparison.json) · [Commands, source identities and timings](site/comparison-builds.json) · [Exact checked source inputs](site/comparison-artifacts/sources.tar.gz).
