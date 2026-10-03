import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync,existsSync} from 'node:fs';
import {dirname,resolve,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {verifyComparison} from '../scripts/build-comparison.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
test('three independently targeted builds have current artifact and config hashes',()=>{
 const data=verifyComparison(root);
 assert.deepEqual(data.objectives.map(row=>row.objective),['raw','gzip','brotli']);
 for(const row of data.objectives){
  assert.equal(row.metric,{raw:'raw',gzip:'gzip9',brotli:'brotli11'}[row.objective]);
  assert.equal(row.ratio,row.lilscript.sizes[row.metric]/row.original.sizes[row.metric]);
  assert.equal(row.original.sizes[row.metric],Math.min(...data.minifiers.map(m=>m.sizes[row.metric])));
  assert.ok(row.lilscript.buildSeconds>0);assert.ok(row.original.buildSeconds>0);
 }
});
test('public comparison describes current versus original and distinguishes build stages',()=>{
 const html=readFileSync(join(root,'site/index.html'),'utf8');
 const module=readFileSync(join(root,'site/objective-comparison.js'),'utf8');
 assert.match(html,/id="compression-comparison"/);assert.match(html,/id="objective-build-times"/);
 assert.match(module,/separate compilation targeting/);assert.match(module,/upstream package from its original TypeScript sources/);
 assert.doesNotMatch(html,/previous release|previous version|old compiler|earlier compiler|last release/i);
 const data=JSON.parse(readFileSync(join(root,'site/comparison.json'),'utf8'));
 assert.equal(data.schemaVersion,4);assert.ok(data.validation.checks>0);
 assert.ok(data.upstream.sharedExports.length>0);assert.ok(data.minifiers.length>=2);
});
test('built Pages artifact contains the current data and measured downloads',()=>{
 const data=JSON.parse(readFileSync(join(root,'site/comparison.json'),'utf8'));
 assert.equal(readFileSync(join(root,'_site/comparison.json'),'utf8'),readFileSync(join(root,'site/comparison.json'),'utf8'));
 for(const row of data.objectives)for(const item of [row.lilscript,row.original])assert.ok(existsSync(join(root,'_site',item.artifact)));
 for(const file of ['app.js','styles.css','objective-comparison.js','objective-comparison.css','.nojekyll'])assert.ok(existsSync(join(root,'_site',file)),file);
});
