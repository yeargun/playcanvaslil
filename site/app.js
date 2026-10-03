import {renderComparison} from './objective-comparison.js';
const comparison=await fetch('./comparison.json').then(r=>{if(!r.ok)throw Error('Comparison failed to load');return r.json()});
renderComparison(comparison);
const candidateModule=await import('./artifacts/shader-processing.js'),officialModule=await import('./artifacts/shader-processing.official.js');
const byId=id=>document.getElementById(id);
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
