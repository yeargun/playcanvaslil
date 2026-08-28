const byId = (id) => document.getElementById(id);
const formatDelta = (value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;

async function start() {
const [results, performance, candidateModule, officialModule] = await Promise.all([
  fetch("./results.json").then((response) => response.json()),
  fetch("./performance.json").then((response) => response.json()),
  import("./artifacts/bit-packing.js"),
  import("./artifacts/bit-packing.official.js"),
]);

byId("converted-count").textContent = results.scope.convertedFiles.length;
byId("upstream-revision").textContent = results.upstream.revision.slice(0, 7);

for (const world of ["open", "closed"]) {
  const metric = results.matched[world].brotli11;
  byId(`${world}-delta`).textContent = formatDelta(metric.differencePercent);
  byId(`${world}-bytes`).textContent = `${metric.candidate} B / ${metric.baseline} B`;
  byId(`${world}-bar`).style.width = `${Math.min(100, (metric.candidate / metric.baseline) * 100)}%`;
}

const labels = { raw: "raw", gzip9: "gzip-9", brotli11: "Brotli-11" };
for (const world of ["open", "closed"]) {
  for (const metric of ["raw", "gzip9", "brotli11"]) {
    const value = results.matched[world][metric];
    const row = document.createElement("tr");
    row.innerHTML = `<td>${world}-world</td><td>${labels[metric]}</td><td>${value.candidate} B</td><td>${value.baseline} B</td><td class="${value.differencePercent < 0 ? "win" : "loss"}">${formatDelta(value.differencePercent)}</td>`;
    byId("size-table").append(row);
  }
}

const candidate = candidateModule.BitPacking;
const official = officialModule.BitPacking;
const form = byId("bit-form");
const output = byId("bit-output");

function calculate(api, storage, value, shift, mask) {
  return {
    set: api.set(storage, value, shift, mask),
    get: api.get(storage, shift, mask),
    all: api.all(storage, shift, mask),
    any: api.any(storage, shift, mask),
  };
}

function compare() {
  const data = new FormData(form);
  const values = ["storage", "value", "shift", "mask"].map((name) => Number(data.get(name)) | 0);
  const expected = calculate(official, ...values);
  const actual = calculate(candidate, ...values);
  const matches = JSON.stringify(actual) === JSON.stringify(expected);
  output.textContent = matches
    ? `MATCH / set ${actual.set} / get ${actual.get} / all ${actual.all} / any ${actual.any}`
    : "MISMATCH";
  output.classList.toggle("loss", !matches);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  compare();
});
compare();

const openRuntime = performance.open.lanes.find((lane) => lane.id === "lilscript");
const closedRuntime = performance.closed.lanes.find((lane) => lane.id === "lilscript");
byId("open-runtime").textContent = `Local median ${openRuntime.medianMs} ms / ${openRuntime.ratioToFastestOfficial}x fastest official`;
byId("closed-runtime").textContent = `Local median ${closedRuntime.medianMs} ms / ${closedRuntime.ratioToFastestOfficial}x fastest official`;
document.documentElement.dataset.openRuntimeRatio = openRuntime.ratioToFastestOfficial;
document.documentElement.dataset.closedRuntimeRatio = closedRuntime.ratioToFastestOfficial;
}

start().catch((error) => {
  document.documentElement.dataset.evidenceError = "true";
  byId("bit-output").textContent = `Evidence failed to load: ${error.message}`;
});
