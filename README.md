# playcanvaslil

A LilScript implementation of PlayCanvas shader processing. This is a selected subsystem, not the complete PlayCanvas engine.

[Live comparison and examples](https://yeargun.github.io/playcanvaslil/) · [Checked repository package](https://yeargun.github.io/playcanvaslil/downloads/package.tgz) · [Package build evidence](https://yeargun.github.io/playcanvaslil/package-build.json)

```sh
npm install https://yeargun.github.io/playcanvaslil/downloads/package.tgz
```

```js
import {Preprocessor} from "playcanvaslil"
const shader = Preprocessor.run("#define ACTIVE\n#ifdef ACTIVE\nvoid main() {}\n#endif")
```

The repository download contains the checked build of this checkout. npm publication is independent; an npm install can resolve a different published snapshot.

## Comparison with the original

[Current raw, gzip and Brotli results and build times](COMPARISON.md) compare three independently targeted LilScript compilations with the smallest recorded original result for each codec from Terser, esbuild and Oxc. Exact bytes, configuration hashes, source inputs and commands are downloadable from the comparison page. Package formats and browser application bundles have different boundaries from the standalone comparison entries.

## Compatibility and scope

The measured boundary includes preprocessing, shader definitions, GLSL processing and WGSL reflection, including shared host dependencies. Original release Debug calls are stripped before minification. Public constructors, descriptors, arity and PlayCanvas format objects remain part of the compatibility checks. The package is a private research distribution; use the checked repository download for inspection.

## Rebuild and verify

Set `LILSCRIPT_COMPILER` to the current LilScript executable. Builds use one compiler job at a time.

```sh
npm ci
npm run build
npm test
npm run check:site
```

See [LICENSE](LICENSE) and [NOTICE.md](NOTICE.md) for licensing and upstream attribution.
