# Shader Processing Port Status

Upstream: `playcanvas/engine@dbd2f580915273d50cfb12936af25d45ae636a04`.

| Upstream file | Source bytes | Status | Evidence |
| --- | ---: | --- | --- |
| `src/core/preprocessor.js` | 30,000 | converted | 52 unchanged upstream tests plus generated differential cases |
| `src/platform/graphics/shader-definition-utils.js` | 15,921 | converted | 13 differential fixture groups covering every static method |
| `src/platform/graphics/shader-processor-glsl.js` | 22,945 | converted | 14 differential fixture groups covering every static method and `UniformLine` |
| `src/platform/graphics/webgpu/webgpu-shader-processor-wgsl.js` | 55,747 | converted | 26 unchanged upstream tests plus render/compute differential cases |

The measured module is complete at **4 / 4 selected files**. Shared imports such as graphics
constants, format classes, shader chunks, and Debug are host dependencies, not claimed as converted.
They are bundled identically into both size lanes. PlayCanvas release Debug stripping is applied to
both artifacts.
