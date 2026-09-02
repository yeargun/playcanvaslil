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
      "compression-analysis.json",
      "artifacts/shader-processing.js",
      "artifacts/shader-processing.official.js",
      "artifacts/shader-processing.closed.js",
      "artifacts/shader-processing.closed.official.js",
      ".nojekyll",
    ]) {
      assert.equal(existsSync(resolve(site, path)), true, path);
    }
  });

  it("states the narrow scope and separates both contracts", () => {
    const html = readFileSync(resolve(site, "index.html"), "utf8");
    assert.match(html, /shader-processing core/i);
    assert.match(html, /Open world/i);
    assert.match(html, /Closed world/i);
    assert.match(html, /not affiliated/i);
    assert.doesNotMatch(html, /full engine port/i);
  });

  it("publishes measured provenance", () => {
    const results = JSON.parse(readFileSync(resolve(site, "results.json"), "utf8"));
    assert.equal(results.scope.gitSubmodulePath, "upstream/engine");
    assert.equal(results.scope.name, "shader-processing core");
    assert.equal(results.scope.convertedFiles.length, 4);
    assert.match(results.upstream.revision, /^[0-9a-f]{40}$/);
    assert.match(results.compiler.binarySha256, /^[0-9a-f]{64}$/);
    const expectedDifference = ({ candidate, baseline }) =>
      Number((((candidate - baseline) / baseline) * 100).toFixed(2));
    assert.equal(
      results.comparison.open.brotli11.differencePercent,
      expectedDifference(results.comparison.open.brotli11),
    );
    assert.equal(
      results.comparison.closed.brotli11.differencePercent,
      expectedDifference(results.comparison.closed.brotli11),
    );
    assert.ok(results.comparison.closed.brotli11.differencePercent < 0);
    assert.equal(results.contract.officialPropertyMangling, false);
    assert.equal(results.contract.lilscriptInternalPropertyMangling, false);
    const analysis = JSON.parse(readFileSync(resolve(site, "compression-analysis.json"), "utf8"));
    assert.ok(analysis.transfer.rawDifferencePercent < -10);
    assert.equal(
      analysis.transfer.brotliDifferencePercent,
      results.comparison.open.brotli11.differencePercent,
    );
  });
});
