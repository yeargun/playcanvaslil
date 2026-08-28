import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const site = resolve(root, "_site");

describe("GitHub Pages artifact", () => {
  it("contains the evidence and runnable modules", () => {
    for (const path of [
      "index.html",
      "styles.css",
      "app.js",
      "results.json",
      "performance.json",
      "artifacts/bit-packing.js",
      "artifacts/bit-packing.official.js",
      ".nojekyll",
    ]) {
      assert.equal(existsSync(resolve(site, path)), true, path);
    }
  });

  it("states the narrow scope and separates both contracts", () => {
    const html = readFileSync(resolve(site, "index.html"), "utf8");
    assert.match(html, /core\/math/);
    assert.match(html, /Open world/i);
    assert.match(html, /Closed world/i);
    assert.match(html, /not affiliated/i);
    assert.doesNotMatch(html, /full engine port/i);
  });

  it("publishes measured provenance", () => {
    const results = JSON.parse(readFileSync(resolve(site, "results.json"), "utf8"));
    assert.equal(results.scope.gitSubmodulePath, "upstream/engine");
    assert.equal(results.scope.sourceSubtree, "src/core/math");
    assert.deepEqual(results.scope.convertedFiles, ["bit-packing.js"]);
    assert.match(results.upstream.revision, /^[0-9a-f]{40}$/);
    assert.match(results.compiler.binarySha256, /^[0-9a-f]{64}$/);
    assert.ok(results.matched.open.brotli11.differencePercent > 0);
    assert.equal(Number.isFinite(results.matched.closed.brotli11.differencePercent), true);
  });
});
