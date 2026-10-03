var St=Object.defineProperty,Ft=(s,e,t)=>e in s?St(s,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):s[e]=t,R=(s,e,t)=>Ft(s,typeof e!="symbol"?e+"":e,t),M=/[ \t]*#(ifn?def|if|endif|else|elif|define|undef|extension|include)/g,Z=/define[ \t]+([^\n]+)\r?(?:\n|$)/g,fe=/extension[ \t]+([\w-]+)[ \t]*:[ \t]*(enable|require)/g,J=/undef[ \t]+([^\n]+)\r?(?:\n|$)/g,ee=/(ifdef|ifndef|if)[ \t]*([^\r\n]+)\r?\n/g,te=/(endif|else|elif)(?:[ \t]+([^\r\n]*))?\r?\n?/g,de=/\{?[\w-]+\}?/,Ot=/(!|\s)?defined\(([\w-]+)\)/,Ct=/!?defined\s*\([^)]*\)/g,Dt=/!?defined\s*$/,Mt=/([a-z_]\w*)\s*(==|!=|<|<=|>|>=)\s*([\w"']+)/i,Pt=/[+\-]/g,re=/include[ \t]+"([\w-]+)(?:\s*,\s*([\w-]+))?"/g,Nt=/\{i\}/g,me=/(pcFragColor[1-8])\b/g,wt=/^\d+(?:\.\d+)?$/,Te=class O{static run(e,t=new Map,a={}){O.sourceName=a.sourceName,e=this.stripComments(e),e=e.split(/\r?\n/).map(u=>u.trimEnd()).join(`
`);const r=new Map,o=new Map;if(e=this._preprocess(e,r,o,t,a.stripDefines),e===null)return null;const n=new Map;return r.forEach((u,i)=>{Number.isInteger(parseFloat(u))&&!u.includes(".")&&n.set(i,u)}),e=this.stripComments(e),e=this.injectDefines(e,o),e=this.stripUnusedColorAttachments(e,a),e=this.RemoveEmptyLines(e),e=this.processArraySize(e,n),e}static stripUnusedColorAttachments(e,t){if(t.stripUnusedColorAttachments){const a=new Map;if(e.match(me)?.forEach(n=>{const u=parseInt(n.charAt(n.length-1),10);a.set(u,(a.get(u)??0)+1)}),Array.from(a.values()).some(n=>n===1)){const n=e.split(`
`),u=[];for(let i=0;i<n.length;i++){const c=n[i].match(me);if(c){const d=parseInt(c[0].charAt(c[0].length-1),10);if(d>0&&a.get(d)===1)continue}u.push(n[i])}e=u.join(`
`)}}return e}static stripComments(e){return e.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,"$1")}static processArraySize(e,t){return e!==null&&t.forEach((a,r)=>{e=e.replace(new RegExp(`\\[${r}\\]`,"g"),`[${a}]`)}),e}static injectDefines(e,t){if(e!==null&&t.size>0){const a=e.split(`
`);t.forEach((r,o)=>{const n=new RegExp(o,"g");for(let u=0;u<a.length;u++)a[u].includes("#")||(a[u]=a[u].replace(n,r))}),e=a.join(`
`)}return e}static RemoveEmptyLines(e){return e!==null&&(e=e.split(/\r?\n/).map(t=>t.trim()===""?"":t).join(`
`),e=e.replace(/(\n\n){3,}/g,`

`)),e}static _preprocess(e,t=new Map,a,r,o){const n=e,u=[];let i=!1,c;for(;(c=M.exec(e))!==null&&!i;){const d=c[1];switch(d){case"define":{Z.lastIndex=c.index;const f=Z.exec(e);i||(i=f===null);const p=f[1];de.lastIndex=f.index;const T=de.exec(p)[0];let h=p.substring(T.length).trim();h===""&&(h="true");const _=O._keep(u);let v=o;if(_){const A=T.startsWith("{")&&T.endsWith("}");A&&(v=!0),A?a.set(T,h):t.set(T,h),v&&(e=e.substring(0,f.index-1)+e.substring(Z.lastIndex),M.lastIndex=f.index-1)}v||(M.lastIndex=f.index+f[0].length);break}case"undef":{J.lastIndex=c.index;const f=J.exec(e),p=f[1].trim();O._keep(u)&&(t.delete(p),o&&(e=e.substring(0,f.index-1)+e.substring(J.lastIndex),M.lastIndex=f.index-1)),o||(M.lastIndex=f.index+f[0].length);break}case"extension":{fe.lastIndex=c.index;const f=fe.exec(e);if(i||(i=f===null),f){const p=f[1];O._keep(u)&&t.set(p,"true")}M.lastIndex=f.index+f[0].length;break}case"ifdef":case"ifndef":case"if":{ee.lastIndex=c.index;const f=ee.exec(e),p=f[2],m=O.evaluate(p,t);i||(i=m.error);let T=m.result;d==="ifndef"&&(T=!T),u.push({anyKeep:T,keep:T,start:c.index,end:ee.lastIndex}),M.lastIndex=f.index+f[0].length;break}case"endif":case"else":case"elif":{te.lastIndex=c.index;const f=te.exec(e),p=u.pop();if(!p){console.error(`Shader preprocessing encountered "#${f[1]}" without a preceding #if #ifdef #ifndef while preprocessing ${O.sourceName} on line:
 ${e.substring(c.index,c.index+100)}...`,{source:n}),i=!0;continue}const m=p.keep?e.substring(p.end,c.index):"";e=e.substring(0,p.start)+m+e.substring(te.lastIndex),M.lastIndex=p.start+m.length;const T=f[1];if(T==="else"||T==="elif"){let h=!1;if(!p.anyKeep)if(T==="else")h=!p.keep;else{const _=O.evaluate(f[2],t);h=_.result,i||(i=_.error)}u.push({anyKeep:p.anyKeep||h,keep:h,start:M.lastIndex,end:M.lastIndex})}break}case"include":{re.lastIndex=c.index;const f=re.exec(e);if(i||(i=f===null),!f){i=!0;continue}const p=f[1].trim(),m=f[2]?.trim();if(O._keep(u)){let h=r?.get(p);if(h!==void 0){if(h=this.stripComments(h),m){const _=t.get(m),v=parseFloat(_);if(Number.isInteger(v)){let A="";for(let I=0;I<v;I++)A+=h.replace(Nt,String(I));h=A}else console.error(`Include Count identifier "${m}" not resolved while preprocessing ${O.sourceName} on line:
 ${e.substring(c.index,c.index+100)}...`,{originalSource:n,source:e}),i=!0}e=e.substring(0,f.index-1)+h+e.substring(re.lastIndex),M.lastIndex=f.index-1}else{console.error(`Include "${p}" not resolved while preprocessing ${O.sourceName}`,{originalSource:n,source:e}),i=!0;continue}}break}}}return u.length>0&&(console.error(`Shader preprocessing reached the end of the file without encountering the necessary #endif to close a preceding #if, #ifdef, or #ifndef block. ${O.sourceName}`),i=!0),i?(console.error("Failed to preprocess shader: ",{source:n}),null):e}static _keep(e){for(let t=0;t<e.length;t++)if(!e[t].keep)return!1;return!0}static evaluateAtomicExpression(e,t){let a=!1;e=e.trim();let r=!1;if(e==="true")return{result:!0,error:a};if(e==="false")return{result:!1,error:a};if(wt.test(e))return{result:parseFloat(e)!==0,error:a};const o=Ot.exec(e);if(o){r=o[1]==="!",e=o[2].trim();const i=t.has(e);return{result:r?!i:i,error:a}}const n=Mt.exec(e);if(n){const i=t.get(n[1].trim())??n[1].trim(),c=t.get(n[3].trim())??n[3].trim(),d=n[2].trim();let f=!1;switch(d){case"==":f=i===c;break;case"!=":f=i!==c;break;case"<":f=i<c;break;case"<=":f=i<=c;break;case">":f=i>c;break;case">=":f=i>=c;break;default:a=!0}return{result:f,error:a}}return{result:t.has(e),error:a}}static processParentheses(e,t){let a=!1,r=e.trim();for(;r.startsWith("(")&&r.endsWith(")");){let o=0,n=!0;for(let u=0;u<r.length-1;u++)if(r[u]==="(")o++;else if(r[u]===")"&&(o--,o===0)){n=!1;break}if(n)r=r.slice(1,-1).trim();else break}for(;;){let o=!1,n=0,u=0,i=-1,c=-1,d=0;for(let T=0;T<r.length;T++)if(r[T]==="("){const h=r.substring(0,T);Dt.test(h)?d++:d===0&&(n++,n>u&&(u=n,i=T),o=!0)}else r[T]===")"&&(d>0?d--:n>0&&(n===u&&i!==-1&&(c=T),n--));if(!o||i===-1||c===-1)break;const f=r.substring(i+1,c),{result:p,error:m}=O.evaluate(f,t);a=a||m,r=r.substring(0,i)+(p?"true":"false")+r.substring(c+1)}return{expression:r,error:a}}static evaluate(e,t){const a=Pt.exec(e)===null;let r=e,o=!1;if(e.replace(Ct,"").indexOf("(")!==-1){const i=O.processParentheses(e,t);r=i.expression,o=i.error}if(o)return{result:!1,error:!0};const u=r.split("||");for(const i of u){const c=i.split("&&");let d=!0;for(const f of c){const{result:p,error:m}=O.evaluateAtomicExpression(f.trim(),t);if(!p||m){d=!1;break}}if(d)return{result:!0,error:!a}}return{result:!1,error:!a}}};R(Te,"sourceName");var Lt=Te,$t=0,Ut=1,Xt=2,Bt=3,Gt=4,kt=5,Yt=6,he=7,Vt=8,Wt=9,Ht=10,jt=11,zt=12,qt=13,Kt=14,Qt=15,Zt=16,Jt=17,er=18,tr=19,rr=20,ar=21,sr=22,nr=23,ir=24,or=25,ur=26,cr=27,lr=28,pr=29,fr=30,dr=31,mr=32,Tr=33,hr=34,_r=35,gr=36,vr=37,Er=38,xr=39,Rr=40,Ar=41,br=42,yr=43,Ir=44,Sr=45,Fr=46,Or=47,Cr=48,Dr=49,Mr=50,Pr=51,Nr=52,wr=53,Lr=54,$r=55,Ur=56,Xr=61,Br=62,Gr=63,kr=64,Yr=65,Vr=66,Wr=67,Hr=68,jr=69,zr=70,qr=71,Kr=72,Qr=73,Zr=74,Jr=75,_e="POSITION",ge="NORMAL",ve="TANGENT",Ee="BLENDWEIGHT",xe="BLENDINDICES",Re="COLOR",Ae="TEXCOORD0",be="TEXCOORD1",ye="TEXCOORD2",Ie="TEXCOORD3",Se="TEXCOORD4",Fe="TEXCOORD5",Oe="TEXCOORD6",Ce="TEXCOORD7",ea="ATTR0",ta="ATTR1",ra="ATTR2",aa="ATTR3",sa="ATTR4",na="ATTR5",ia="ATTR6",oa="ATTR7",ua="ATTR8",ca="ATTR9",la="ATTR10",pa="ATTR11",fa="ATTR12",da="ATTR13",ma="ATTR14",Ta="ATTR15",De="1d",S="2d",P="2d-array",L="cube",j="cube-array",G="3d",F=0,X=1,$=2,Y=3,V=4,ha="glsl",_a="wgsl",Me=0,Pe=2,E=4,D=5,C=6,Ne=7,we=0,Le=1,z=2,$e=3,Ue=4,Xe=5,Be=6,Ge=7,ke=8,Ye=9,Ve=10,We=11,ga=12,va=13,He=14,Ea=17,xa=21,Ra=22,Aa=23,ba=24,je=26,ze=27,qe=28,Ke=29,ya=30,Ia=31,Sa=32,Fa=33,Oa=34,Ca=35,Da=36,Ma=37,Pa=38,Na=39,wa=40,La=41,Qe=["bool","int","float","vec2","vec3","vec4","ivec2","ivec3","ivec4","bvec2","bvec3","bvec4","mat2","mat3","mat4","sampler2D","samplerCube","","sampler2DShadow","samplerCubeShadow","sampler3D","","","","","sampler2DArray","uint","uvec2","uvec3","uvec4","","","","","","","","","","","","","isampler2D","usampler2D","isamplerCube","usamplerCube","isampler3D","usampler3D","isampler2DArray","usampler2DArray"],Ze=[["bool"],["i32"],["f32"],["vec2f","vec2<f32>"],["vec3f","vec3<f32>"],["vec4f","vec4<f32>"],["vec2i","vec2<i32>"],["vec3i","vec3<i32>"],["vec4i","vec4<i32>"],["vec2<bool>"],["vec3<bool>"],["vec4<bool>"],["mat2x2f","mat2x2<f32>"],["mat3x3f","mat3x3<f32>"],["mat4x4f","mat4x4<f32>"],["texture_2d<f32>"],["texture_cube<f32>"],["array<f32>"],["texture_depth_2d"],["texture_depth_cube"],["texture_3d<f32>"],["array<vec2<f32>>"],["array<vec3<f32>>"],["array<vec4<f32>>"],["array<mat4x4<f32>>"],["texture_2d_array<f32>"],["u32"],["vec2u","vec2<u32>"],["vec3u","vec3<u32>"],["vec4u","vec4<u32>"],["array<i32>"],["array<u32>"],["array<bool>"],["array<vec2i>","array<vec2<i32>>"],["array<vec2u>","array<vec2<u32>>"],["array<vec2b>","array<vec2<bool>>"],["array<vec3i>","array<vec3<i32>>"],["array<vec3u>","array<vec3<u32>>"],["array<vec3b>","array<vec3<bool>>"],["array<vec4i>","array<vec4<i32>>"],["array<vec4u>","array<vec4<u32>>"],["array<vec4b>","array<vec4<bool>>"],["texture_2d<i32>"],["texture_2d<u32>"],["texture_cube<i32>"],["texture_cube<u32>"],["texture_3d<i32>"],["texture_3d<u32>"],["texture_2d_array<i32>"],["texture_2d_array<u32>"]],ae=new Map;Ze.forEach((s,e)=>{s.forEach(t=>ae.set(t,e))});var fs=new Uint8Array([E,E,C,C,C,C,E,E,E,E,E,E,C,C,C,E,E,C,E,E,E,C,C,C,C,E,D,D,D,D,E,D,E,E,D,E,E,D,E,E,D,E,E,D,E,D,E,D,E,D]),Je=1,et=2,se=4,tt=1,rt=2,at=["view","mesh","mesh_ub"],st="_unused_float_uniform",$a=new Map([["float","f32"],["vec2","vec2f"],["vec3","vec3f"],["vec4","vec4f"],["int","i32"],["ivec2","vec2i"],["ivec3","vec3i"],["ivec4","vec4i"],["uint","u32"],["uvec2","vec2u"],["uvec3","vec3u"],["uvec4","vec4u"]]),g={};g[_e]=0,g[ge]=1,g[Ee]=2,g[xe]=3,g[Re]=4,g[Ae]=5,g[be]=6,g[ye]=7,g[Ie]=8,g[Se]=9,g[Fe]=10,g[Oe]=11,g[Ce]=12,g[ve]=13,g[ea]=0,g[ta]=1,g[ra]=2,g[aa]=3,g[sa]=4,g[na]=5,g[ia]=6,g[oa]=7,g[ua]=8,g[ca]=9,g[la]=10,g[pa]=11,g[fa]=12,g[da]=13,g[ma]=14,g[Ta]=15;var k={DEG_TO_RAD:Math.PI/180,RAD_TO_DEG:180/Math.PI,clamp(s,e,t){return s>=t?t:s<=e?e:s},intToBytes24(s){const e=s>>16&255,t=s>>8&255,a=s&255;return[e,t,a]},intToBytes32(s){const e=s>>24&255,t=s>>16&255,a=s>>8&255,r=s&255;return[e,t,a,r]},bytesToInt24(s,e,t){return s.length&&(t=s[2],e=s[1],s=s[0]),s<<16|e<<8|t},bytesToInt32(s,e,t,a){return s.length&&(a=s[3],t=s[2],e=s[1],s=s[0]),(s<<24|e<<16|t<<8|a)>>>0},lerp(s,e,t){return s+(e-s)*k.clamp(t,0,1)},lerpUnclamped(s,e,t){return s+(e-s)*t},lerpAngle(s,e,t){return e-s>180&&(e-=360),e-s<-180&&(e+=360),k.lerp(s,e,k.clamp(t,0,1))},powerOfTwo(s){return s!==0&&!(s&s-1)},nextPowerOfTwo(s){return s--,s|=s>>1,s|=s>>2,s|=s>>4,s|=s>>8,s|=s>>16,s++,s},nearestPowerOfTwo(s){return Math.pow(2,Math.round(Math.log2(s)))},random(s,e){const t=e-s;return Math.random()*t+s},smoothstep(s,e,t){return t<=s?0:t>=e?1:(t=(t-s)/(e-s),t*t*(3-2*t))},smootherstep(s,e,t){return t<=s?0:t>=e?1:(t=(t-s)/(e-s),t*t*t*(t*(t*6-15)+10))},roundUp(s,e){return e===0?s:Math.ceil(s/e)*e},between(s,e,t,a){const r=Math.min(e,t),o=Math.max(e,t);return a?s>=r&&s<=o:s>r&&s<o}},b=[];b[z]=1,b[$e]=2,b[Ue]=3,b[Xe]=4,b[Le]=1,b[Be]=2,b[Ge]=3,b[ke]=4,b[we]=1,b[Ye]=2,b[Ve]=3,b[We]=4,b[ga]=8,b[va]=12,b[He]=16,b[je]=1,b[ze]=2,b[qe]=3,b[Ke]=4;var W=class{constructor(s,e,t=0){if(R(this,"name"),R(this,"type"),R(this,"byteSize"),R(this,"offset"),R(this,"scopeId"),R(this,"count"),R(this,"numComponents"),this.shortName=s,this.name=t?`${s}[0]`:s,this.type=e,this.numComponents=b[e],this.updateType=e,t>0)switch(e){case z:this.updateType=Ea;break;case Le:this.updateType=ya;break;case je:this.updateType=Ia;break;case we:this.updateType=Sa;break;case $e:this.updateType=xa;break;case Be:this.updateType=Fa;break;case ze:this.updateType=Oa;break;case Ye:this.updateType=Ca;break;case Ue:this.updateType=Ra;break;case Ge:this.updateType=Da;break;case qe:this.updateType=Ma;break;case Ve:this.updateType=Pa;break;case Xe:this.updateType=Aa;break;case ke:this.updateType=Na;break;case Ke:this.updateType=wa;break;case We:this.updateType=La;break;case He:this.updateType=ba;break;default:break}this.count=t;let a=this.numComponents;t&&(a=k.roundUp(a,4)),this.byteSize=a*4,t&&(this.byteSize*=t)}get isArrayType(){return this.count>0}calculateOffset(s){let e=this.byteSize<=8?this.byteSize:16;this.count&&(e=16),s=k.roundUp(s,e),this.offset=s/4}},ne=class{constructor(s,e){R(this,"byteSize",0),R(this,"map",new Map),this.scope=s.scope,this.uniforms=e;let t=0;for(let a=0;a<e.length;a++){const r=e[a];r.calculateOffset(t),t=r.offset*4+r.byteSize,r.scopeId=this.scope.resolve(r.name),this.map.set(r.name,r)}this.byteSize=k.roundUp(t,16)}get(s){return this.map.get(s)}},Ua=0,q=class{constructor(s,e){R(this,"slot",-1),R(this,"scopeId",null),this.name=s,this.visibility=e}},nt=class extends q{},it=class extends q{constructor(s,e,t=!1){super(s,e),R(this,"format",""),this.readOnly=t}},K=class extends q{constructor(s,e,t=S,a=F,r=!0,o=null,n=!1){super(s,e),R(this,"samplerName",null),R(this,"hasSampler"),R(this,"multisampled"),this.textureDimension=t,this.multisampled=n,this.hasSampler=n?!1:r,this.samplerName=n?null:o??`${s}_sampler`,this.sampleType=n&&a===F?X:a}},ot=class extends q{constructor(s,e=he,t=S,a=!0,r=!1){super(s,se),this.format=e,this.textureDimension=t,this.write=a,this.read=r}},ie=class{constructor(s,e){R(this,"uniformBufferFormats",[]),R(this,"textureFormats",[]),R(this,"storageTextureFormats",[]),R(this,"storageBufferFormats",[]),this.id=Ua++;let t=0;e.forEach(r=>{r.slot=t++,r instanceof K&&r.hasSampler&&t++,r instanceof nt?this.uniformBufferFormats.push(r):r instanceof K?this.textureFormats.push(r):r instanceof ot?this.storageTextureFormats.push(r):r instanceof it&&this.storageBufferFormats.push(r)}),this.device=s;const a=s.scope;this.bufferFormatsMap=new Map,this.uniformBufferFormats.forEach((r,o)=>this.bufferFormatsMap.set(r.name,o)),this.textureFormatsMap=new Map,this.textureFormats.forEach((r,o)=>{this.textureFormatsMap.set(r.name,o),r.scopeId=a.resolve(r.name)}),this.storageTextureFormatsMap=new Map,this.storageTextureFormats.forEach((r,o)=>{this.storageTextureFormatsMap.set(r.name,o),r.scopeId=a.resolve(r.name)}),this.storageBufferFormatsMap=new Map,this.storageBufferFormats.forEach((r,o)=>{this.storageBufferFormatsMap.set(r.name,o),r.scopeId=a.resolve(r.name)}),this.impl=s.createBindGroupFormatImpl(this)}destroy(){this.impl.destroy()}getTexture(s){const e=this.textureFormatsMap.get(s);return e!==void 0?this.textureFormats[e]:null}getStorageTexture(s){const e=this.storageTextureFormatsMap.get(s);return e!==void 0?this.storageTextureFormats[e]:null}loseContext(){}},l=[];l[$t]="",l[Ut]="",l[Xt]="",l[Nr]="r8unorm",l[wr]="rg8unorm",l[Bt]="",l[Gt]="",l[kt]="",l[Yt]="rgba8unorm",l[he]="rgba8unorm",l[Vt]="bc1-rgba-unorm",l[Wt]="bc2-rgba-unorm",l[Ht]="bc3-rgba-unorm",l[jt]="",l[zt]="rgba16float",l[Mr]="r16float",l[Pr]="rg16float",l[qt]="",l[Kt]="rgba32float",l[Qt]="r32float",l[zr]="rg32float",l[Zt]="depth32float",l[jr]="depth16unorm",l[Jt]="depth24plus-stencil8",l[er]="rg11b10ufloat",l[tr]="",l[rr]="rgba8unorm-srgb",l[ar]="",l[sr]="etc2-rgb8unorm",l[nr]="etc2-rgba8unorm",l[ir]="",l[or]="",l[ur]="",l[cr]="",l[lr]="astc-4x4-unorm",l[pr]="",l[fr]="",l[dr]="bgra8unorm",l[kr]="bgra8unorm-srgb",l[mr]="r8sint",l[Tr]="r8uint",l[hr]="r16sint",l[_r]="r16uint",l[gr]="r32sint",l[vr]="r32uint",l[Er]="rg8sint",l[xr]="rg8uint",l[Rr]="rg16sint",l[Ar]="rg16uint",l[br]="rg32sint",l[yr]="rg32uint",l[Ir]="rgba8sint",l[Sr]="rgba8uint",l[Fr]="rgba16sint",l[Or]="rgba16uint",l[Cr]="rgba32sint",l[Dr]="rgba32uint",l[Yr]="bc6h-rgb-float",l[Vr]="bc6h-rgb-ufloat",l[Wr]="bc7-rgba-unorm",l[qr]="rgb9e5ufloat",l[Kr]="rg8snorm",l[Qr]="rgba8snorm",l[Zr]="rgb10a2unorm",l[Jr]="rgb10a2uint",l[Lr]="bc1-rgba-unorm-srgb",l[$r]="bc2-rgba-unorm-srgb",l[Ur]="bc3-rgba-unorm-srgb",l[Xr]="etc2-rgb8unorm-srgb",l[Br]="etc2-rgba8unorm-srgb",l[Hr]="bc7-rgba-unorm-srgb",l[Gr]="astc-4x4-unorm-srgb";var ut=/^[ \t]*(attribute|varying|uniform)[\t ]+/gm,oe=/^[ \t]*(attribute|varying|uniform)[ \t]*([^;]+)(;+)/gm,ue=/^[ \t]*var\s*(?:(<storage,[^>]*>)\s*([\w\d_]+)\s*:\s*(.*?)\s*;|(<(?!storage,)[^>]*>)?\s*([\w\d_]+)\s*:\s*(texture_.*|storage_texture_.*|storage\w.*|external_texture|sampler(?:_comparison)?)\s*;)\s*$/gm,Xa=/(?:@interpolate\([^)]*\)\s*)?([\w]+)\s*:\s*([\w<>]+)/,H="@@@",ce=/(@vertex|@fragment)\s*fn\s+\w+\s*\(\s*(\w+)\s*:[\s\S]*?\{/,Ba=/\.fragDepth\s*=/,Ga=/\.sampleMask\s*=(?!=)/,ct=[{wgslName:"position",wgslType:"vec4f",wgslBuiltin:"position",pcName:"pcPosition",isFallback:!0},{wgslName:"frontFacing",wgslType:"bool",wgslBuiltin:"front_facing",pcName:"pcFrontFacing"},{wgslName:"sampleIndex",wgslType:"u32",wgslBuiltin:"sample_index",pcName:"pcSampleIndex"},{wgslName:"sampleMask",wgslType:"u32",wgslBuiltin:"sample_mask",pcName:"pcSampleMask"},{wgslName:"primitiveIndex",wgslType:"u32",wgslBuiltin:"primitive_index",pcName:"pcPrimitiveIndex",requiresFeature:"supportsPrimitiveIndex"}],lt=[{wgslName:"vertexIndex",wgslType:"u32",wgslBuiltin:"vertex_index",pcName:"pcVertexIndex",isFallback:!0},{wgslName:"instanceIndex",wgslType:"u32",wgslBuiltin:"instance_index",pcName:"pcInstanceIndex"}],pt=(s,e,t,a)=>s.filter(r=>r.requiresFeature&&!a[r.requiresFeature]?!1:new RegExp(`\\b(?:${r.pcName}|${t}\\.${r.wgslName})\\b`).test(e)),ft=(s,e,t,a)=>{if(s.length===0&&!a){const r=e.find(o=>o.isFallback&&(!o.requiresFeature||t[o.requiresFeature]));if(r)return[r]}return s},dt=s=>s.map(e=>`    @builtin(${e.wgslBuiltin}) ${e.wgslName} : ${e.wgslType},
`).join(""),mt=s=>s.map(e=>`    var<private> ${e.pcName}: ${e.wgslType};
`).join(""),Tt=s=>s.map(e=>`    ${e.pcName} = input.${e.wgslName};
`).join(""),ka={texture_1d:{viewDimension:De,baseSampleType:F},texture_2d:{viewDimension:S,baseSampleType:F},texture_2d_array:{viewDimension:P,baseSampleType:F},texture_3d:{viewDimension:G,baseSampleType:F},texture_cube:{viewDimension:L,baseSampleType:F},texture_cube_array:{viewDimension:j,baseSampleType:F},texture_multisampled_2d:{viewDimension:S,baseSampleType:F,multisampled:!0},texture_depth_2d:{viewDimension:S,baseSampleType:$},texture_depth_2d_array:{viewDimension:P,baseSampleType:$},texture_depth_cube:{viewDimension:L,baseSampleType:$},texture_depth_cube_array:{viewDimension:j,baseSampleType:$},texture_depth_multisampled_2d:{viewDimension:S,baseSampleType:$,multisampled:!0},texture_external:{viewDimension:S,baseSampleType:X}},Ya=(s,e)=>{const t=ka[s];let a=t.baseSampleType;const r=!!t.multisampled;if(t.baseSampleType===F){switch(e){case"u32":a=V;break;case"i32":a=Y;break;case"f32":a=F;break;case"uff":a=X;break}r&&a===F&&(a=X)}return{viewDimension:t.viewDimension,sampleType:a,multisampled:r}},Va=(s,e,t=!1)=>{if(t){if(e===$)return"texture_depth_multisampled_2d";let o;switch(e){case F:case X:o="f32";break;case V:o="u32";break;case Y:o="i32";break;default:}return`texture_multisampled_2d<${o}>`}if(e===$)switch(s){case S:return"texture_depth_2d";case P:return"texture_depth_2d_array";case L:return"texture_depth_cube";case j:return"texture_depth_cube_array";default:}let a;switch(s){case De:a="texture_1d";break;case S:a="texture_2d";break;case P:a="texture_2d_array";break;case G:a="texture_3d";break;case L:a="texture_cube";break;case j:a="texture_cube_array";break;default:}let r;switch(e){case F:case X:r="f32";break;case V:r="u32";break;case Y:r="i32";break;default:}return`${a}<${r}>`},ht=new Map;l.forEach((s,e)=>{s&&ht.set(s,e)});var _t={f32:"WrappedF32",i32:"WrappedI32",u32:"WrappedU32",vec2f:"WrappedVec2F",vec2i:"WrappedVec2I",vec2u:"WrappedVec2U"},gt=s=>(s=s.replace(/\s+/g," ").trim(),s.split(/[\s:]+/)),Wa=/array<([^,]+),\s*([^>]+)>/,vt=class{constructor(s,e){R(this,"ubName",null),R(this,"arraySize",0),this.line=s;const t=gt(s);if(t.length<2){e.failed=!0;return}if(this.name=t[0],this.type=t.slice(1).join(" "),this.type.includes("array<")){const a=Wa.exec(this.type);this.type=a[1].trim(),this.arraySize=Number(a[2]),isNaN(this.arraySize)&&(e.failed=!0)}}},Ha=/^\s*var\s+(\w+)\s*:\s*(texture_\w+)(?:<(\w+)>)?;\s*$/,ja=/^\s*var\s+([\w\d_]+)\s*:\s*(texture_storage_2d|texture_storage_2d_array)<([\w\d_]+),\s*(\w+)>\s*;\s*$/,za=/^\s*var\s*<storage,\s*(read_write|read)?>\s*([\w\d_]+)\s*:\s*(.*)\s*;\s*$/,qa=/^\s*var\s+([\w\d_]+)\s*:\s*texture_external;\s*$/,Ka=/^\s*var\s+([\w\d_]+)\s*:\s*(sampler|sampler_comparison)\s*;\s*$/,Et=class{constructor(s,e){this.originalLine=s,this.line=s,this.isTexture=!1,this.isSampler=!1,this.isStorageTexture=!1,this.isStorageBuffer=!1,this.isExternalTexture=!1,this.multisampled=!1,this.type="",this.matchedElements=[];const t=this.line.match(Ha);if(t){this.name=t[1],this.type=t[2],this.textureFormat=t[3],this.isTexture=!0,this.matchedElements.push(...t);const u=Ya(this.type,this.textureFormat);this.textureDimension=u.viewDimension,this.sampleType=u.sampleType,this.multisampled=u.multisampled}const a=this.line.match(ja);a&&(this.isStorageTexture=!0,this.name=a[1],this.textureType=a[2],this.format=a[3],this.access=a[4],this.matchedElements.push(...a));const r=this.line.match(za);r&&(this.isStorageBuffer=!0,this.accessMode=r[1]||"none",this.name=r[2],this.type=r[3],this.matchedElements.push(...r));const o=this.line.match(qa);o&&(this.name=o[1],this.isExternalTexture=!0,this.matchedElements.push(...r));const n=this.line.match(Ka);n&&(this.name=n[1],this.samplerType=n[2],this.isSampler=!0,this.matchedElements.push(...n)),this.matchedElements.length===0&&(e.failed=!0)}equals(s){return!(this.name!==s.name||this.type!==s.type||this.isTexture!==s.isTexture||this.isSampler!==s.isSampler||this.isStorageTexture!==s.isStorageTexture||this.isStorageBuffer!==s.isStorageBuffer||this.isExternalTexture!==s.isExternalTexture||this.textureFormat!==s.textureFormat||this.textureDimension!==s.textureDimension||this.sampleType!==s.sampleType||this.multisampled!==s.multisampled||this.textureType!==s.textureType||this.format!==s.format||this.access!==s.access||this.accessMode!==s.accessMode||this.samplerType!==s.samplerType)}},Qa=class x{static run(e,t,a){const r=new Map,o=x.extract(t.vshader),n=x.extract(t.fshader),u=o.src.match(ce)?.[2]??"",i=n.src.match(ce)?.[2]??"",c=new Map,d=x.processAttributes(o.attributes,t.attributes,c,t.processingOptions,a,e,o.src,u),f=x.processVaryings(o.varyings,r,!0,e),p=x.processVaryings(n.varyings,r,!1,e,n.src,i),m=o.uniforms.concat(n.uniforms),h=Array.from(new Set(m)).map(It=>new vt(It,a)),_=x.processUniforms(e,h,t.processingOptions,a);o.src=x.renameUniformAccess(o.src,h),n.src=x.renameUniformAccess(n.src,h);const v=x.mergeResources(o.resources,n.resources,a),A=x.processResources(e,v,t.processingOptions,a),I=x.generateFragmentOutputStruct(n.src,e.maxColorAttachments,t.useDualSourceBlending);o.src=x.copyInputs(o.src,a),n.src=x.copyInputs(n.src,a);const w=`${d}
${f}
${_.code}
${A.code}
`,B=o.src.replace(H,w),U=`${p}
${I}
${_.code}
${A.code}
`,Q=n.src.replace(H,U);return{vshader:B,fshader:Q,attributes:c,meshUniformBufferFormat:_.meshUniformBufferFormat,meshBindGroupFormat:A.meshBindGroupFormat}}static runCompute(e,t,a,r,o){const n=x.extract(t),u=n.uniforms.map(_=>new vt(_,r)),i=[];u.forEach(_=>{_.ubName="ub_compute";const v=ae.get(_.type);i.push(new W(_.name,v,_.arraySize))});const c=i.length>0?new ne(e,i):null,d=x.mergeResources(n.resources,[],r),f=x.buildResourceFormats(d,se,r),p=c?new nt("ub_compute",se):null,m=p?[...f,p]:f;let T=t,h=null;if(m.length>0){h=new ie(e,m);let _=x.getTextureShaderDeclaration(h,o);c&&(_+=x.getUniformShaderDeclaration(c,o,p.slot,"compute"));const v=x.renameUniformAccess(n.src,u);T=v.includes(H)?v.replace(H,_):`${_}
${v}`}return{cshader:T,computeBindGroupFormat:h,computeUniformBufferFormat:c}}static extract(e){const t=[],a=[],r=[],o=[];let n=`${H}
`,u;for(;(u=ut.exec(e))!==null;){const i=u[1];oe.lastIndex=u.index;const c=oe.exec(e);i==="attribute"?t.push(c[2]):i==="varying"?a.push(c[2]):i==="uniform"&&r.push(c[2]),e=x.cutOut(e,u.index,oe.lastIndex,n),ut.lastIndex=u.index+n.length,n=""}for(;(u=ue.exec(e))!==null;)o.push(u[0]),e=x.cutOut(e,u.index,ue.lastIndex,n),ue.lastIndex=u.index+n.length,n="";if(n){const i=e.match(/^(?:\s*(?:enable|requires)\s+\w+\s*;)*/)?.[0]??"";e=`${i}
${n}${e.slice(i.length)}`}return{src:e,attributes:t,varyings:a,uniforms:r,resources:o}}static processUniforms(e,t,a,r){const o=[];t.forEach(i=>{if(a.hasUniform(i.name))i.ubName="ub_view";else{i.ubName="ub_mesh_ub";const c=ae.get(i.type),d=new W(i.name,c,i.arraySize);o.push(d)}}),o.length===0&&o.push(new W(st,z));const n=new ne(e,o);let u="";return a.uniformFormats.forEach((i,c)=>{i&&(u+=x.getUniformShaderDeclaration(i,c,0))}),n&&(u+=x.getUniformShaderDeclaration(n,rt,0)),{code:u,meshUniformBufferFormat:n}}static renameUniformAccess(e,t){return t.forEach(a=>{const r=`uniform.${a.name}`,o=`${a.ubName}.${a.name}`,n=new RegExp(`\\b${r}\\b`,"g");e=e.replace(n,o)}),e}static mergeResources(e,t,a){const r=e.map(n=>new Et(n,a));return t.map(n=>new Et(n,a)).forEach(n=>{const u=r.find(i=>i.name===n.name);u?u.equals(n)||(a.failed=!0):r.push(n)}),r}static buildResourceFormats(e,t,a){const r=[];for(let o=0;o<e.length;o++){const n=e[o];if(n.isTexture){const u=e[o+1],i=(u?.isSampler??!1)&&!n.multisampled,c=n.sampleType,d=n.textureDimension;r.push(new K(n.name,t,d,c,i,i?u.name:null,n.multisampled)),i&&o++}if(n.isStorageBuffer){const u=n.accessMode!=="read_write",i=new it(n.name,t,u);i.format=n.type,r.push(i)}if(n.isStorageTexture){const u=n.textureType==="texture_storage_2d_array"?P:S,i=ht.get(n.format),c=n.access==="write"||n.access==="read_write",d=n.access==="read"||n.access==="read_write";r.push(new ot(n.name,i,u,c,d))}}return r}static processResources(e,t,a,r,o=Je|et,n=tt){const u=x.buildResourceFormats(t,o,r),i=new ie(e,u);let c="";return a?.bindGroupFormats?.forEach((d,f)=>{d&&(c+=x.getTextureShaderDeclaration(d,f))}),c+=x.getTextureShaderDeclaration(i,n),{code:c,meshBindGroupFormat:i}}static getUniformShaderDeclaration(e,t,a,r=at[t]){const o=`struct_ub_${r}`;let n=`struct ${o} {
`;return e.uniforms.forEach(u=>{let i=Ze[u.type][0];u.count>0?(_t.hasOwnProperty(i)&&(i=_t[i]),n+=`    ${u.shortName}: array<${i}, ${u.count}>,
`):n+=`    ${u.shortName}: ${i},
`}),n+=`};
`,n+=`@group(${t}) @binding(${a}) var<uniform> ub_${r} : ${o};

`,n}static getTextureShaderDeclaration(e,t){let a="";return e.textureFormats.forEach(r=>{const o=Va(r.textureDimension,r.sampleType,r.multisampled);if(a+=`@group(${t}) @binding(${r.slot}) var ${r.name}: ${o};
`,r.hasSampler){const n=r.sampleType===$?"sampler_comparison":"sampler";a+=`@group(${t}) @binding(${r.slot+1}) var ${r.samplerName}: ${n};
`}}),e.storageBufferFormats.forEach(r=>{const o=r.readOnly?"read":"read_write";a+=`@group(${t}) @binding(${r.slot}) var<storage, ${o}> ${r.name} : ${r.format};
`}),e.storageTextureFormats.forEach(r=>{const o=r.textureDimension===P?"texture_storage_2d_array":"texture_storage_2d",n=l[r.format],u=r.read?r.write?"read_write":"read":"write";a+=`@group(${t}) @binding(${r.slot}) var ${r.name}: ${o}<${n}, ${u}>;
`}),a}static processVaryings(e,t,a,r,o="",n=""){let u="",i="",c="";if(e.forEach((f,p)=>{const m=f.match(Xa);if(m){const T=m[1],h=m[2];a?t.set(T,p):p=t.get(T),u+=`    @location(${p}) ${f},
`,a||(i+=`    var<private> ${T}: ${h};
`,c+=`    ${T} = input.${T};
`)}}),a)return u+=`    @builtin(position) position : vec4f,
`,`
                struct VertexOutput {
                    ${u}
                };
            `;const d=ft(pt(ct,o,n,r),ct,r,u.length>0);return u+=dt(d),`
            struct FragmentInput {
                ${u}
            };

            ${mt(d)}
            ${i}

            // function to copy inputs (varyings) to private global variables
            fn _pcCopyInputs(input: FragmentInput) {
                ${c}
                ${Tt(d)}
            }
        `}static generateFragmentOutputStruct(e,t,a=!1){let r=`struct FragmentOutput {
`;if(a)r+=`    @location(0) @blend_src(0) color : pcOutType0,
`,r+=`    @location(0) @blend_src(1) colorSecondary : pcOutType0,
`;else{const u=i=>`color${i>0?i:""}`;for(let i=0;i<t;i++){const c=u(i);e.search(new RegExp(`\\.${c}\\s*=`))!==-1&&(r+=`    @location(${i}) ${c} : pcOutType${i},
`)}}return e.search(Ba)!==-1&&(r+=`    @builtin(frag_depth) fragDepth : f32,
`),e.search(Ga)!==-1&&(r+=`    @builtin(sample_mask) sampleMask : u32,
`),`${r}};
`}static floatAttributeToInt(e,t){const r={f32:"f32","vec2<f32>":"vec2f","vec3<f32>":"vec3f","vec4<f32>":"vec4f"}[e]||e;return{f32:t?"i32":"u32",vec2f:t?"vec2i":"vec2u",vec3f:t?"vec3i":"vec3u",vec4f:t?"vec4i":"vec4u"}[r]||null}static processAttributes(e,t={},a,r,o,n,u="",i=""){let c="",d="",f="";const p={};e.forEach(T=>{const h=gt(T),_=h[0];let v=h[1];const A=v;if(t.hasOwnProperty(_)){const I=t[_],w=g[I];p[w]=I,a.set(w,_);const B=r.getVertexElement(I);if(B){const U=B.dataType;if(U!==C&&U!==Ne&&!B.normalize&&!B.asInt){const Q=U===Me||U===Pe||U===E;v=x.floatAttributeToInt(v,Q)}}c+=`    @location(${w}) ${_}: ${v},
`,d+=`    var<private> ${T};
`,f+=`    ${_} = ${A}(input.${_});
`}});const m=ft(pt(lt,u,i,n),lt,n,c.length>0);return`
            struct VertexInput {
                ${c}
                ${dt(m)}
            };

            ${d}
            ${mt(m)}

            fn _pcCopyInputs(input: VertexInput) {
                ${f}
                ${Tt(m)}
            }
        `}static copyInputs(e,t){const a=e.match(ce);if(!a||!a[2])return e;const r=a[2],o=a.index+a[0].length-1,n=e.slice(0,o+1),u=e.slice(o+1),i=`
    _pcCopyInputs(${r});`;return n+i+u}static cutOut(e,t,a,r){return e.substring(0,t)+r+e.substring(a)}},xt=/[ \t]*(\battribute\b|\bvarying\b|\buniform\b)/g,le=/(\battribute\b|\bvarying\b|\bout\b|\buniform\b)[ \t]*([^;]+)(;+)/g,Za=/([\w-]+)\[(.*?)\]/,Ja=new Set(["highp","mediump","lowp"]),es=new Set(["sampler2DShadow","samplerCubeShadow","sampler2DArrayShadow"]),ts={sampler2D:S,sampler3D:G,samplerCube:L,samplerCubeShadow:L,sampler2DShadow:S,sampler2DArray:P,sampler2DArrayShadow:P,isampler2D:S,usampler2D:S,isampler3D:G,usampler3D:G,isamplerCube:L,usamplerCube:L,isampler2DArray:P,usampler2DArray:P},rs={[S]:"texture2D",[L]:"textureCube",[G]:"texture3D",[P]:"texture2DArray"},pe=class{constructor(s,e){this.line=s;const t=s.trim().split(/\s+/);if(Ja.has(t[0])&&(this.precision=t.shift()),this.type=t.shift(),s.includes(","),s.includes("[")){const a=t.join(" "),r=Za.exec(a);this.name=r[1],this.arraySize=Number(r[2]),isNaN(this.arraySize)&&(e.failed=!0)}else this.name=t.shift(),this.arraySize=0;this.isSampler=this.type.indexOf("sampler")!==-1,this.isSignedInt=this.type.indexOf("isampler")!==-1,this.isUnsignedInt=this.type.indexOf("usampler")!==-1}},Rt=class y{static run(e,t,a){const r=new Map,o=y.extract(t.vshader),n=y.extract(t.fshader),u=new Map,i=y.processAttributes(o.attributes,t.attributes,u,t.processingOptions),c=y.processVaryings(o.varyings,r,!0),d=y.processVaryings(n.varyings,r,!1),f=y.processOuts(n.outs),p=o.uniforms.concat(n.uniforms),T=Array.from(new Set(p)).map(w=>new pe(w,a)),h=y.processUniforms(e,T,t.processingOptions,a),_=`${i}
${c}
${h.code}`,v=o.src.replace(y.MARKER,_),A=`${d}
${f}
${h.code}`,I=n.src.replace(y.MARKER,A);return{vshader:v,fshader:I,attributes:u,meshUniformBufferFormat:h.meshUniformBufferFormat,meshBindGroupFormat:h.meshBindGroupFormat}}static extract(e,t=!1){const a=[],r=[],o=[],n=[];let u=`${y.MARKER}
`,i;for(;(i=xt.exec(e))!==null;){const c=i[1];if(!(t&&c!=="uniform"))switch(c){case"attribute":case"varying":case"uniform":case"out":{le.lastIndex=i.index;const d=le.exec(e);c==="attribute"?a.push(d[2]):c==="varying"?r.push(d[2]):c==="out"?o.push(d[2]):c==="uniform"&&n.push(d[2]),e=y.cutOut(e,i.index,le.lastIndex,u),xt.lastIndex=i.index+u.length,u="";break}}}return{src:e,attributes:a,varyings:r,outs:o,uniforms:n}}static parseUniformLines(e,t){return e.map(a=>new pe(a,t))}static processUniforms(e,t,a,r){const o=[],n=[];t.forEach(p=>{p.isSampler?o.push(p):n.push(p)});const u=[];n.forEach(p=>{if(!a.hasUniform(p.name)){const m=Qe.indexOf(p.type),T=new W(p.name,m,p.arraySize);u.push(T)}}),u.length===0&&u.push(new W(st,z));const i=u.length?new ne(e,u):null,c=[];o.forEach(p=>{if(!a.hasTexture(p.name)){let m=F;p.isSignedInt?m=Y:p.isUnsignedInt?m=V:(p.precision==="highp"&&(m=X),es.has(p.type)&&(m=$));const T=ts[p.type];c.push(new K(p.name,Je|et,T,m))}});const d=new ie(e,c);let f="";return a.uniformFormats.forEach((p,m)=>{p&&(f+=y.getUniformShaderDeclaration(p,m,0))}),i&&(f+=y.getUniformShaderDeclaration(i,rt,0)),a.bindGroupFormats.forEach((p,m)=>{p&&(f+=y.getTexturesShaderDeclaration(p,m))}),f+=y.getTexturesShaderDeclaration(d,tt),{code:f,meshUniformBufferFormat:i,meshBindGroupFormat:d}}static processVaryings(e,t,a){let r="";const o=a?"out":"in";return e.forEach((n,u)=>{const i=y.splitToWords(n),c=i.slice(0,-1).join(" "),d=i[i.length-1];a?t.set(d,u):u=t.get(d),r+=`layout(location = ${u}) ${o} ${c} ${d};
`}),r}static processOuts(e){let t="";return e.forEach((a,r)=>{t+=`layout(location = ${r}) out ${a};
`}),t}static getTypeCount(e){const t=e.substring(e.length-1),a=parseInt(t,10);return isNaN(a)?1:a}static processAttributes(e,t,a,r){let o="";const n={};return e.forEach(u=>{const i=y.splitToWords(u);let c=i[0],d=i[1];if(t.hasOwnProperty(d)){const f=t[d],p=g[f];n[p]=f,a.set(p,d);let m;const T=r.getVertexElement(f);if(T){const h=T.dataType;if(h!==C&&h!==Ne&&!T.normalize&&!T.asInt){const _=y.getTypeCount(c),v=`_private_${d}`;m=`vec${_} ${d} = vec${_}(${v});
`,d=v;const A=h===Me||h===Pe||h===E;_===1?c=A?"int":"uint":c=A?`ivec${_}`:`uvec${_}`}}o+=`layout(location = ${p}) in ${c} ${d};
`,m&&(o+=m)}}),o}static splitToWords(e){return e=e.replace(/\s+/g," ").trim(),e.split(" ")}static cutOut(e,t,a,r){return e.substring(0,t)+r+e.substring(a)}static getUniformShaderDeclaration(e,t,a){const r=at[t];let o=`layout(set = ${t}, binding = ${a}, std140) uniform ub_${r} {
`;return e.uniforms.forEach(n=>{const u=Qe[n.type];o+=`    ${u} ${n.shortName}${n.count?`[${n.count}]`:""};
`}),`${o}};
`}static getTexturesShaderDeclaration(e,t){let a="";return e.textureFormats.forEach(r=>{let o=rs[r.textureDimension];const n=o==="texture2DArray",u=r.sampleType===V?"u":r.sampleType===Y?"i":"";o=`${u}${o}`;let i="",c="";n&&(i="_texture",c=`#define ${r.name} ${u}sampler2DArray(${r.name}${i}, ${r.name}_sampler)
`),a+=`layout(set = ${t}, binding = ${r.slot}) uniform ${o} ${r.name}${i};
`,r.hasSampler&&(a+=`layout(set = ${t}, binding = ${r.slot+1}) uniform sampler ${r.name}_sampler;
`),a+=c}),a}};R(Rt,"MARKER","@@@");var as=Rt,ss=`

#ifdef DUAL_SOURCE_BLENDING
#extension GL_EXT_blend_func_extended : require
#endif

#ifndef outType_0
#define outType_0 vec4
#endif

#ifdef DUAL_SOURCE_BLENDING
layout(location = 0, index = 0) out highp outType_0 pcFragColor0;
layout(location = 0, index = 1) out highp outType_0 pcFragColorSecondary;
#else
layout(location = 0) out highp outType_0 pcFragColor0;

#if COLOR_ATTACHMENT_1
layout(location = 1) out highp outType_1 pcFragColor1;
#endif

#if COLOR_ATTACHMENT_2
layout(location = 2) out highp outType_2 pcFragColor2;
#endif

#if COLOR_ATTACHMENT_3
layout(location = 3) out highp outType_3 pcFragColor3;
#endif

#if COLOR_ATTACHMENT_4
layout(location = 4) out highp outType_4 pcFragColor4;
#endif

#if COLOR_ATTACHMENT_5
layout(location = 5) out highp outType_5 pcFragColor5;
#endif

#if COLOR_ATTACHMENT_6
layout(location = 6) out highp outType_6 pcFragColor6;
#endif

#if COLOR_ATTACHMENT_7
layout(location = 7) out highp outType_7 pcFragColor7;
#endif
#endif

#define gl_FragColor pcFragColor0

#define varying in

#define texture2D texture
#define texture2DBias texture
#define textureCube texture
#define texture2DProj textureProj
#define texture2DLod textureLod
#define texture2DProjLod textureProjLod
#define textureCubeLod textureLod
#define texture2DGrad textureGrad
#define texture2DProjGrad textureProjGrad
#define textureCubeGrad textureGrad
#define utexture2D texture
#define itexture2D texture

// deprecated defines
#define texture2DLodEXT texture2DLodEXT_is_no_longer_supported_use_texture2DLod_instead
#define texture2DProjLodEXT texture2DProjLodEXT_is_no_longer_supported_use_texture2DProjLod
#define textureCubeLodEXT textureCubeLodEXT_is_no_longer_supported_use_textureCubeLod_instead
#define texture2DGradEXT texture2DGradEXT_is_no_longer_supported_use_texture2DGrad_instead
#define texture2DProjGradEXT texture2DProjGradEXT_is_no_longer_supported_use_texture2DProjGrad_instead
#define textureCubeGradEXT textureCubeGradEXT_is_no_longer_supported_use_textureCubeGrad_instead

// sample shadows using textureGrad to remove derivatives in the dynamic loops (which are used by
// clustered lighting) - as DirectX shader compiler tries to unroll the loops and takes long time
// to compile the shader. Using textureLod would be even better, but WebGl does not translate it to
// lod instruction for DirectX correctly and uses SampleCmp instead of SampleCmpLevelZero or similar.
#define textureShadow(res, uv) textureGrad(res, uv, vec2(1, 1), vec2(1, 1))

// pass / accept shadow map or texture as a function parameter, on webgl this is simply passed as is
// but this is needed for WebGPU
#define SHADOWMAP_PASS(name) name
#define SHADOWMAP_ACCEPT(name) sampler2DShadow name
#define TEXTURE_PASS(name) name
#define TEXTURE_ACCEPT(name) sampler2D name
#define TEXTURE_ACCEPT_HIGHP(name) highp sampler2D name

#define GL2
`,ns=`

// WEBGL_multi_draw
#extension GL_ANGLE_multi_draw : enable

#define attribute in
#define varying out
#define texture2D texture
#define utexture2D texture
#define itexture2D texture
#define GL2
#define VERTEXSHADER

#define TEXTURE_PASS(name) name
#define TEXTURE_ACCEPT(name) sampler2D name
#define TEXTURE_ACCEPT_HIGHP(name) highp sampler2D name
`,is=`

// texelFetch support and others
#extension GL_EXT_samplerless_texture_functions : require

#ifndef outType_0
#define outType_0 vec4
#endif
#ifndef outType_1
#define outType_1 vec4
#endif
#ifndef outType_2
#define outType_2 vec4
#endif
#ifndef outType_3
#define outType_3 vec4
#endif
#ifndef outType_4
#define outType_4 vec4
#endif
#ifndef outType_5
#define outType_5 vec4
#endif
#ifndef outType_6
#define outType_6 vec4
#endif
#ifndef outType_7
#define outType_7 vec4
#endif

#ifdef DUAL_SOURCE_BLENDING
layout(location = 0, index = 0) out highp outType_0 pcFragColor0;
layout(location = 0, index = 1) out highp outType_0 pcFragColorSecondary;
#else
layout(location = 0) out highp outType_0 pcFragColor0;
layout(location = 1) out highp outType_1 pcFragColor1;
layout(location = 2) out highp outType_2 pcFragColor2;
layout(location = 3) out highp outType_3 pcFragColor3;
layout(location = 4) out highp outType_4 pcFragColor4;
layout(location = 5) out highp outType_5 pcFragColor5;
layout(location = 6) out highp outType_6 pcFragColor6;
layout(location = 7) out highp outType_7 pcFragColor7;
#endif

#define gl_FragColor pcFragColor0

#define texture2D(res, uv) texture(sampler2D(res, res ## _sampler), uv)
#define texture2DBias(res, uv, bias) texture(sampler2D(res, res ## _sampler), uv, bias)
#define texture2DLod(res, uv, lod) textureLod(sampler2D(res, res ## _sampler), uv, lod)
#define textureCube(res, uv) texture(samplerCube(res, res ## _sampler), uv)
#define textureCubeLod(res, uv, lod) textureLod(samplerCube(res, res ## _sampler), uv, lod)
#define textureShadow(res, uv) textureLod(sampler2DShadow(res, res ## _sampler), uv, 0.0)
#define itexture2D(res, uv) texture(isampler2D(res, res ## _sampler), uv)
#define utexture2D(res, uv) texture(usampler2D(res, res ## _sampler), uv)

// deprecated defines
#define texture2DLodEXT texture2DLodEXT_is_no_longer_supported_use_texture2DLod_instead
#define texture2DProjLodEXT texture2DProjLodEXT_is_no_longer_supported_use_texture2DProjLod
#define textureCubeLodEXT textureCubeLodEXT_is_no_longer_supported_use_textureCubeLod_instead
#define texture2DGradEXT texture2DGradEXT_is_no_longer_supported_use_texture2DGrad_instead
#define texture2DProjGradEXT texture2DProjGradEXT_is_no_longer_supported_use_texture2DProjGrad_instead
#define textureCubeGradEXT textureCubeGradEXT_is_no_longer_supported_use_textureCubeGrad_instead

// TODO: implement other texture sampling macros
// #define texture2DProj textureProj
// #define texture2DProjLod textureProjLod
// #define texture2DGrad textureGrad
// #define texture2DProjGrad textureProjGrad
// #define textureCubeGrad textureGrad

// pass / accept shadow map as a function parameter, passes both the texture as well as sampler
// as the combined sampler can be only created at a point of use
#define SHADOWMAP_PASS(name) name, name ## _sampler
#define SHADOWMAP_ACCEPT(name) texture2D name, sampler name ## _sampler
#define TEXTURE_PASS(name) name, name ## _sampler
#define TEXTURE_ACCEPT(name) texture2D name, sampler name ## _sampler
#define TEXTURE_ACCEPT_HIGHP TEXTURE_ACCEPT

#define GL2
#define WEBGPU
`,os=`

// texelFetch support and others
#extension GL_EXT_samplerless_texture_functions : require

#define texture2D(res, uv) texture(sampler2D(res, res ## _sampler), uv)
#define itexture2D(res, uv) texture(isampler2D(res, res ## _sampler), uv)
#define utexture2D(res, uv) texture(usampler2D(res, res ## _sampler), uv)

#define TEXTURE_PASS(name) name, name ## _sampler
#define TEXTURE_ACCEPT(name) texture2D name, sampler name ## _sampler
#define TEXTURE_ACCEPT_HIGHP TEXTURE_ACCEPT

#define GL2
#define WEBGPU
#define VERTEXSHADER
#define gl_VertexID gl_VertexIndex
#define gl_InstanceID gl_InstanceIndex
`,us=`
`,cs=`
#define VERTEXSHADER
`,At=`

// convert clip space position into texture coordinates to sample scene grab textures
vec2 getGrabScreenPos(vec4 clipPos) {
    vec2 uv = (clipPos.xy / clipPos.w) * 0.5 + 0.5;

    #ifdef WEBGPU
        uv.y = 1.0 - uv.y;
    #endif

    return uv;
}

// convert uv coordinates to sample image effect texture (render target texture rendered without
// forward renderer which does the flip in the projection matrix)
vec2 getImageEffectUV(vec2 uv) {
    #ifdef WEBGPU
        uv.y = 1.0 - uv.y;
    #endif

    return uv;
}
`,bt=`

#define WEBGPU

// convert clip space position into texture coordinates for sampling scene grab textures
fn getGrabScreenPos(clipPos: vec4<f32>) -> vec2<f32> {
    var uv: vec2<f32> = (clipPos.xy / clipPos.w) * 0.5 + vec2<f32>(0.5);
    uv.y = 1.0 - uv.y;
    return uv;
}

// convert uv coordinates to sample image effect texture (render target texture rendered without
// forward renderer which does the flip in the projection matrix)
fn getImageEffectUV(uv: vec2<f32>) -> vec2<f32> {
    var modifiedUV: vec2<f32> = uv;
    modifiedUV.y = 1.0 - modifiedUV.y;
    return modifiedUV;
}

// types wrapped in size aligned structures to ensure correct alignment in uniform buffer arrays
struct WrappedF32 { @size(16) element: f32 }
struct WrappedI32 { @size(16) element: i32 }
struct WrappedU32 { @size(16) element: u32 }
struct WrappedVec2F { @size(16) element: vec2f }
struct WrappedVec2I { @size(16) element: vec2i }
struct WrappedVec2U { @size(16) element: vec2u }
`,yt=`
#ifdef CAPS_SHADER_F16
    alias half = f16;
    alias half2 = vec2<f16>;
    alias half3 = vec3<f16>;
    alias half4 = vec4<f16>;
    alias half2x2 = mat2x2<f16>;
    alias half3x3 = mat3x3<f16>;
    alias half4x4 = mat4x4<f16>;
#else
    alias half = f32;
    alias half2 = vec2f;
    alias half3 = vec3f;
    alias half4 = vec4f;
    alias half2x2 = mat2x2f;
    alias half3x3 = mat3x3f;
    alias half4x4 = mat4x4f;
#endif
`,ls={vertex_position:_e,vertex_normal:ge,vertex_tangent:ve,vertex_texCoord0:Ae,vertex_texCoord1:be,vertex_texCoord2:ye,vertex_texCoord3:Ie,vertex_texCoord4:Se,vertex_texCoord5:Fe,vertex_texCoord6:Oe,vertex_texCoord7:Ce,vertex_color:Re,vertex_boneIndices:xe,vertex_boneWeights:Ee},ps=class N{static createDefinition(e,t){const a=p=>{let m=p.fragmentOutputTypes??"vec4";return Array.isArray(m)||(m=[m]),m},r=(p,m,T,h)=>{const _=e.isWebGPU?p:m;let v="";if(!T){h.useDualSourceBlending&&(v+=`#define DUAL_SOURCE_BLENDING
`);const A=a(h);for(let I=0;I<e.maxColorAttachments;I++){v+=`#define COLOR_ATTACHMENT_${I}
`;const w=A[I]??"vec4";v+=`#define outType_${I} ${w}
`}}return v+_},o=(p,m)=>{let T=N.getWGSLEnables(e,p?"vertex":"fragment",!p&&m.useDualSourceBlending);if(!p){const h=a(m);for(let _=0;_<e.maxColorAttachments;_++){const v=h[_]??"vec4",A=$a.get(v);T+=`alias pcOutType${_} = ${A};
`}}return T},n=t.name??"Untitled";let u,i;const c=N.getDefinesCode(e,t.vertexDefines),d=N.getDefinesCode(e,t.fragmentDefines);return t.shaderLanguage===_a?(u=`
                ${o(!0,t)}
                ${c}
                ${yt}
                ${cs}
                ${bt}
                ${t.vertexCode}
            `,i=`
                ${o(!1,t)}
                ${d}
                ${yt}
                ${us}
                ${bt}
                ${t.fragmentCode}
            `):(u=`${N.versionCode(e)+r(os,ns,!0,t)+c+N.precisionCode(e)}
                ${At}
                ${N.getShaderNameCode(n)}
                ${t.vertexCode}`,i=`${(t.fragmentPreamble||"")+N.versionCode(e)+r(is,ss,!1,t)+d+N.precisionCode(e)}
                ${At}
                ${N.getShaderNameCode(n)}
                ${t.fragmentCode}`),{name:n,shaderLanguage:t.shaderLanguage??ha,attributes:t.attributes,vshader:u,vincludes:t.vertexIncludes,fincludes:t.fragmentIncludes,fshader:i,feedbackVaryings:t.feedbackVaryings,feedbackVaryingsMode:t.feedbackVaryingsMode,useTransformFeedback:t.useTransformFeedback,meshUniformBufferFormat:t.meshUniformBufferFormat,meshBindGroupFormat:t.meshBindGroupFormat,useDualSourceBlending:!!t.useDualSourceBlending}}static getWGSLEnables(e,t,a=!1){let r="";return e.supportsShaderF16&&(r+=`enable f16;
`),t==="fragment"&&e.supportsPrimitiveIndex&&(r+=`enable primitive_index;
`),t==="fragment"&&a&&(r+=`enable dual_source_blending;
`),e.supportsSubgroups&&(r+=`enable subgroups;
`),e.supportsSubgroupId&&(r+=`requires subgroup_id;
`),t==="compute"&&e.supportsLinearIndexing&&(r+=`requires linear_indexing;
`),e.supportsUnrestrictedPointerParameters&&(r+=`requires unrestricted_pointer_parameters;
`),e.supportsPointerCompositeAccess&&(r+=`requires pointer_composite_access;
`),e.supportsPacked4x8IntegerDotProduct&&(r+=`requires packed_4x8_integer_dot_product;
`),e.supportsTextureAndSamplerLet&&(r+=`requires texture_and_sampler_let;
`),r}static getDefinesCode(e,t){let a="";return e.capsDefines.forEach((r,o)=>{a+=`#define ${o} ${r}
`}),a+=`
`,t?.forEach((r,o)=>{a+=`#define ${o} ${r}
`}),a+=`
`,a}static getShaderNameCode(e){return`#define SHADER_NAME ${e}
`}static versionCode(e){return e.isWebGPU?`#version 450
`:`#version 300 es
`}static precisionCode(e,t){t&&t!=="highp"&&t!=="mediump"&&t!=="lowp"&&(t=null),t&&(t==="highp"&&e.maxPrecision!=="highp"&&(t="mediump"),t==="mediump"&&e.maxPrecision==="lowp"&&(t="lowp"));const a=t||e.precision;return`
            precision ${a} float;
            precision ${a} int;
            precision ${a} usampler2D;
            precision ${a} isampler2D;
            precision ${a} sampler2DShadow;
            precision ${a} samplerCubeShadow;
            precision ${a} sampler2DArray;
        `}static collectAttributes(e){const t={};let a=0,r=e.indexOf("attribute");for(;r>=0&&!(r>0&&e[r-1]==="/");){let o=!1;if(r>0){let n=e.lastIndexOf(`
`,r);n=n!==-1?n+1:0,e.substring(n,r).includes("#")&&(o=!0)}if(!o){const n=e.indexOf(";",r),u=e.lastIndexOf(" ",n),i=e.substring(u+1,n);if(!t[i]){const c=ls[i];c!==void 0?t[i]=c:(t[i]=`ATTR${a}`,a++)}}r=e.indexOf("attribute",r+1)}return t}};export{Lt as Preprocessor,ps as ShaderDefinitionUtils,as as ShaderProcessorGLSL,pe as UniformLine,Qa as WebgpuShaderProcessorWGSL};
