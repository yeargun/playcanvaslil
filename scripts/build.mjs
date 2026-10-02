import {dirname, resolve} from 'node:path'
import {fileURLToPath} from 'node:url'
import {execFileSync} from 'node:child_process'
import {buildPackage} from './compiler-package.mjs'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
await buildPackage({root,profiles:[{name:'public',config:'lilscript.toml'}]})
// These two .official.js files are independent upstream test oracles, not package outputs.
if (process.argv.includes('--upstream')) execFileSync(process.execPath,['scripts/build-upstream.mjs'],{cwd:root,stdio:'inherit'})
