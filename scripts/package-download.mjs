import {execFileSync} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {mkdir,rename,writeFile,cp} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
export async function writePackageDownload(root,output) {
 const pkg=JSON.parse(readFileSync(join(root,'package.json'),'utf8'));
 const targets=new Set();
 function visit(value){if(typeof value==='string'&&value.startsWith('./')&&!value.includes('*'))targets.add(value.slice(2));else if(value&&typeof value==='object')Object.values(value).forEach(visit);}
 visit(pkg.exports);
 for(const key of ['main','module','types','unpkg','jsdelivr'])if(typeof pkg[key]==='string')targets.add(pkg[key].replace(/^\.\//,''));
 for(const target of targets)if(!existsSync(join(root,target)))throw Error(`Missing package entry: ${target}`);
 const factsPath=join(root,'site/package-build.json');
 const facts=JSON.parse(readFileSync(factsPath,'utf8'));
 if(!facts.validation?.ok)throw Error('Package validation must pass before publication');
 for(const file of facts.artifacts){
  const bytes=readFileSync(join(root,file.path));
  if(bytes.length!==file.bytes || createHash('sha256').update(bytes).digest('hex')!==file.sha256)throw Error(`Package artifact changed after validation: ${file.path}`);
 }
 await mkdir(join(output,'comparison'),{recursive:true});
 await cp(join(root,'comparison/package-build-report.json'),join(output,'comparison/package-build-report.json'));
 await cp(join(root,'comparison/package-validation'),join(output,'comparison/package-validation'),{recursive:true});
 const downloads=join(output,'downloads');await mkdir(downloads,{recursive:true});
 const [packed]=JSON.parse(execFileSync('npm',['pack','--ignore-scripts','--json','--pack-destination',downloads],{cwd:root,encoding:'utf8'}));
 const files=new Set(packed.files.map(file=>file.path));
 for(const target of targets)if(!files.has(target))throw Error(`Tarball omits advertised entry: ${target}`);
 const destination=join(downloads,'package.tgz');await rename(join(downloads,packed.filename),destination);
 const data=readFileSync(destination),sha256=createHash('sha256').update(data).digest('hex');
 await writeFile(join(output,'package-build.json'),JSON.stringify({...facts,package:pkg.name,version:pkg.version,download:'./downloads/package.tgz',sha256,integrity:packed.integrity,files:packed.files.map(({path,size})=>({path,size})),scope:'Checked repository package snapshot. npm publication is independent.'},null,2)+'\n');
 console.log(`Checked ${targets.size} advertised entry files; packed ${packed.entryCount} files`);
}
