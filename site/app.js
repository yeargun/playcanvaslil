const byId = (id) => document.getElementById(id);
const bytes = (value) => new Intl.NumberFormat("en-US").format(value);
const delta = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;

async function start() {
  const [results, performance, analysis, candidateModule, officialModule] = await Promise.all([
    fetch("./results.json").then((response) => response.json()),
    fetch("./performance.json").then((response) => response.json()),
    fetch("./compression-analysis.json").then((response) => response.json()),
    import("./artifacts/shader-processing.js"),
    import("./artifacts/shader-processing.official.js"),
  ]);

  byId("converted-count").textContent = results.scope.convertedFiles.length;
  byId("upstream-revision").textContent = results.upstream.revision.slice(0, 7);

  for (const world of ["open", "closed"]) {
    const metric = results.comparison[world].brotli11;
    byId(`${world}-delta`).textContent = delta(metric.differencePercent);
    byId(`${world}-bytes`).textContent = `${bytes(metric.candidate)} B / ${bytes(metric.baseline)} B`;
    byId(`${world}-bar`).style.width = `${Math.min(100, (metric.candidate / metric.baseline) * 100)}%`;
  }

  byId("raw-reduction").textContent = `${Math.abs(analysis.transfer.rawDifferencePercent).toFixed(2)}%`;
  byId("brotli-reduction").textContent = `${Math.abs(analysis.transfer.brotliDifferencePercent).toFixed(2)}%`;
  byId("candidate-token-count").textContent = analysis.artifacts.candidate.totalTokens.toLocaleString();
  byId("official-token-count").textContent = analysis.artifacts.official.totalTokens.toLocaleString();

  const labels = { raw: "raw", gzip9: "gzip-9", brotli11: "Brotli-11" };
  for (const world of ["open", "closed"]) {
    for (const metric of ["raw", "gzip9", "brotli11"]) {
      const value = results.comparison[world][metric];
      const row = document.createElement("tr");
      row.innerHTML = `<td>${world}-world</td><td>${labels[metric]}</td><td>${bytes(value.candidate)} B</td><td>${bytes(value.baseline)} B</td><td class="${value.differencePercent < 0 ? "win" : "loss"}">${delta(value.differencePercent)}</td>`;
      byId("size-table").append(row);
    }
  }

  const form = byId("shader-form");
  const output = byId("shader-output");
  const compare = () => {
    const source = new FormData(form).get("source");
    const expected = officialModule.Preprocessor.run(source, new Map(), {});
    const actual = candidateModule.Preprocessor.run(source, new Map(), {});
    const matches = actual === expected;
    output.textContent = matches
      ? `MATCH / ${actual.length} output characters`
      : "MISMATCH";
    output.classList.toggle("loss", !matches);
  };
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    compare();
  });
  compare();

  for (const world of ["open", "closed"]) {
    const lane = performance[world].lanes.find(({ id }) => id === "lilscript");
    byId(`${world}-runtime`).textContent = `Local median ${lane.medianMs} ms / ${lane.ratioToOfficial}x official`;
  }
}

start().catch((error) => {
  document.documentElement.dataset.evidenceError = "true";
  byId("shader-output").textContent = `Evidence failed to load: ${error.message}`;
});
