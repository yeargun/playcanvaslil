# PlayCanvasLil

A LilScript rewrite of one substantial PlayCanvas Engine subsystem: the shader-processing core.
It is not an official PlayCanvas project and it is not a port of the complete engine.

**Live evidence:** [yeargun.github.io/playcanvaslil](https://yeargun.github.io/playcanvaslil/)

## Scope

The selected upstream is pinned at `dbd2f580915273d50cfb12936af25d45ae636a04` and contains
four algorithm-heavy JavaScript modules totaling **124,613 source bytes**:

- `src/core/preprocessor.js`
- `src/platform/graphics/shader-definition-utils.js`
- `src/platform/graphics/shader-processor-glsl.js`
- `src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js`

All four are rewritten in LilScript. Thin JavaScript facades retain static class constructors,
method descriptors, defaults, and real PlayCanvas format-object prototypes. Shared PlayCanvas host
dependencies are present in both artifacts and are never subtracted from measurements.

## Size

The primary comparison follows the requested library-delivery contract: PlayCanvas release Debug
calls are stripped and Terser compression runs with **identifier and property mangling disabled**.
LilScript still emits its own compiler-selected identifiers.

| Contract | Raw | gzip-9 | Brotli-11 | Brotli difference |
| --- | ---: | ---: | ---: | ---: |
| Official open-world module | 67,112 B | 16,267 B | 14,633 B | baseline |
| **LilScript open-world module** | **53,783 B** | 16,337 B | **14,580 B** | **-0.36%** |
| Official closed-world entry | 67,422 B | 16,333 B | 14,681 B | baseline |
| **LilScript closed-world entry** | **51,123 B** | **15,536 B** | **13,810 B** | **-5.93%** |

The open-world result is intentionally a narrow win, not rounded into a larger claim. Gzip is 70
bytes larger in that lane. Closed-world linking removes public-class facade costs and wins all three
size metrics.

## Correctness

- 78 unchanged upstream PlayCanvas tests for preprocessing and WGSL reflection
- 14 differential GLSL fixture groups
- 13 differential shader-definition fixture groups
- Public export, constructor, static method, descriptor, arity, and default-value checks
- Real PlayCanvas `UniformBufferFormat` and `BindGroupFormat` result objects
- Open- and closed-world artifacts checked independently
- No algorithm substitutions or property mangling

## Reproduce

```sh
git clone --recurse-submodules https://github.com/yeargun/playcanvaslil.git
cd playcanvaslil
git clone https://github.com/yeargun/lilscript.git ../lilscript
git -C ../lilscript checkout "$(cat LILSCRIPT_REVISION)"
cargo build --release --bins --manifest-path ../lilscript/Cargo.toml
npm ci
npm run check
```

Set `LILSCRIPT_ROOT`, `LILSCRIPT_COMPILER`, or `LILSCRIPT_CODEC` to use another location. Measurement
rejects a dirty or mismatched compiler unless `PLAYCANVASLIL_ALLOW_DIRTY_COMPILER=1` is explicitly
set for local investigation.

## Port Rules

1. Pin the exact upstream revision and source list.
2. Translate one file at a time without changing algorithms or explicit performance techniques.
3. Keep unavoidable host/facade JavaScript narrow and include every byte in the result.
4. Run behavior and API gates before recording size or runtime.
5. Keep open-world and closed-world evidence separate.
6. Report losses as well as wins; property-mangled bundles are not a comparison lane.

## License

MIT. See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md). PlayCanvas is copyright PlayCanvas Ltd.
