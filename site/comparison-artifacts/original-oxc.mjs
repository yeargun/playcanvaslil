var e=Object.defineProperty,t=(t,n,r)=>n in t?e(t,n,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[n]=r,n=(e,n,r)=>t(e,typeof n==`symbol`?n:n+``,r),r=/[ \t]*#(ifn?def|if|endif|else|elif|define|undef|extension|include)/g,i=/define[ \t]+([^\n]+)\r?(?:\n|$)/g,a=/extension[ \t]+([\w-]+)[ \t]*:[ \t]*(enable|require)/g,o=/undef[ \t]+([^\n]+)\r?(?:\n|$)/g,s=/(ifdef|ifndef|if)[ \t]*([^\r\n]+)\r?\n/g,c=/(endif|else|elif)(?:[ \t]+([^\r\n]*))?\r?\n?/g,l=/\{?[\w-]+\}?/,u=/(!|\s)?defined\(([\w-]+)\)/,d=/!?defined\s*\([^)]*\)/g,f=/!?defined\s*$/,p=/([a-z_]\w*)\s*(==|!=|<|<=|>|>=)\s*([\w"']+)/i,m=/[+\-]/g,h=/include[ \t]+"([\w-]+)(?:\s*,\s*([\w-]+))?"/g,g=/\{i\}/g,_=/(pcFragColor[1-8])\b/g,v=/^\d+(?:\.\d+)?$/,y=class e{static run(t,n=new Map,r={}){e.sourceName=r.sourceName,t=this.stripComments(t),t=t.split(/\r?\n/).map(e=>e.trimEnd()).join(`
`);let i=new Map,a=new Map;if(t=this._preprocess(t,i,a,n,r.stripDefines),t===null)return null;let o=new Map;return i.forEach((e,t)=>{Number.isInteger(parseFloat(e))&&!e.includes(`.`)&&o.set(t,e)}),t=this.stripComments(t),t=this.injectDefines(t,a),t=this.stripUnusedColorAttachments(t,r),t=this.RemoveEmptyLines(t),t=this.processArraySize(t,o),t}static stripUnusedColorAttachments(e,t){if(t.stripUnusedColorAttachments){let t=new Map;if(e.match(_)?.forEach(e=>{let n=parseInt(e.charAt(e.length-1),10);t.set(n,(t.get(n)??0)+1)}),Array.from(t.values()).some(e=>e===1)){let n=e.split(`
`),r=[];for(let e=0;e<n.length;e++){let i=n[e].match(_);if(i){let e=parseInt(i[0].charAt(i[0].length-1),10);if(e>0&&t.get(e)===1)continue}r.push(n[e])}e=r.join(`
`)}}return e}static stripComments(e){return e.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm,`$1`)}static processArraySize(e,t){return e!==null&&t.forEach((t,n)=>{e=e.replace(RegExp(`\\[${n}\\]`,`g`),`[${t}]`)}),e}static injectDefines(e,t){if(e!==null&&t.size>0){let n=e.split(`
`);t.forEach((e,t)=>{let r=new RegExp(t,`g`);for(let t=0;t<n.length;t++)n[t].includes(`#`)||(n[t]=n[t].replace(r,e))}),e=n.join(`
`)}return e}static RemoveEmptyLines(e){return e!==null&&(e=e.split(/\r?\n/).map(e=>e.trim()===``?``:e).join(`
`),e=e.replace(/(\n\n){3,}/g,`

`)),e}static _preprocess(t,n=new Map,u,d,f){let p=t,m=[],_=!1,v;for(;(v=r.exec(t))!==null&&!_;){let y=v[1];switch(y){case`define`:{i.lastIndex=v.index;let a=i.exec(t);_||=a===null;let o=a[1];l.lastIndex=a.index;let s=l.exec(o)[0],c=o.substring(s.length).trim();c===``&&(c=`true`);let d=e._keep(m),p=f;if(d){let e=s.startsWith(`{`)&&s.endsWith(`}`);e&&(p=!0),e?u.set(s,c):n.set(s,c),p&&(t=t.substring(0,a.index-1)+t.substring(i.lastIndex),r.lastIndex=a.index-1)}p||(r.lastIndex=a.index+a[0].length);break}case`undef`:{o.lastIndex=v.index;let i=o.exec(t),a=i[1].trim();e._keep(m)&&(n.delete(a),f&&(t=t.substring(0,i.index-1)+t.substring(o.lastIndex),r.lastIndex=i.index-1)),f||(r.lastIndex=i.index+i[0].length);break}case`extension`:{a.lastIndex=v.index;let i=a.exec(t);if(_||=i===null,i){let t=i[1];e._keep(m)&&n.set(t,`true`)}r.lastIndex=i.index+i[0].length;break}case`ifdef`:case`ifndef`:case`if`:{s.lastIndex=v.index;let i=s.exec(t),a=i[2],o=e.evaluate(a,n);_||=o.error;let c=o.result;y===`ifndef`&&(c=!c),m.push({anyKeep:c,keep:c,start:v.index,end:s.lastIndex}),r.lastIndex=i.index+i[0].length;break}case`endif`:case`else`:case`elif`:{c.lastIndex=v.index;let i=c.exec(t),a=m.pop();if(!a){console.error(`Shader preprocessing encountered "#${i[1]}" without a preceding #if #ifdef #ifndef while preprocessing ${e.sourceName} on line:
 ${t.substring(v.index,v.index+100)}...`,{source:p}),_=!0;continue}let o=a.keep?t.substring(a.end,v.index):``;t=t.substring(0,a.start)+o+t.substring(c.lastIndex),r.lastIndex=a.start+o.length;let s=i[1];if(s===`else`||s===`elif`){let t=!1;if(!a.anyKeep){if(s===`else`)t=!a.keep;else{let r=e.evaluate(i[2],n);t=r.result,_||=r.error}}m.push({anyKeep:a.anyKeep||t,keep:t,start:r.lastIndex,end:r.lastIndex})}break}case`include`:{h.lastIndex=v.index;let i=h.exec(t);if(_||=i===null,!i){_=!0;continue}let a=i[1].trim(),o=i[2]?.trim();if(e._keep(m)){let s=d?.get(a);if(s!==void 0){if(s=this.stripComments(s),o){let r=n.get(o),i=parseFloat(r);if(Number.isInteger(i)){let e=``;for(let t=0;t<i;t++)e+=s.replace(g,String(t));s=e}else console.error(`Include Count identifier "${o}" not resolved while preprocessing ${e.sourceName} on line:
 ${t.substring(v.index,v.index+100)}...`,{originalSource:p,source:t}),_=!0}t=t.substring(0,i.index-1)+s+t.substring(h.lastIndex),r.lastIndex=i.index-1}else{console.error(`Include "${a}" not resolved while preprocessing ${e.sourceName}`,{originalSource:p,source:t}),_=!0;continue}}break}}}return m.length>0&&(console.error(`Shader preprocessing reached the end of the file without encountering the necessary #endif to close a preceding #if, #ifdef, or #ifndef block. ${e.sourceName}`),_=!0),_?(console.error(`Failed to preprocess shader: `,{source:p}),null):t}static _keep(e){for(let t=0;t<e.length;t++)if(!e[t].keep)return!1;return!0}static evaluateAtomicExpression(e,t){let n=!1;e=e.trim();let r=!1;if(e===`true`)return{result:!0,error:n};if(e===`false`)return{result:!1,error:n};if(v.test(e))return{result:parseFloat(e)!==0,error:n};let i=u.exec(e);if(i){r=i[1]===`!`,e=i[2].trim();let a=t.has(e);return{result:r?!a:a,error:n}}let a=p.exec(e);if(a){let e=t.get(a[1].trim())??a[1].trim(),r=t.get(a[3].trim())??a[3].trim(),i=a[2].trim(),o=!1;switch(i){case`==`:o=e===r;break;case`!=`:o=e!==r;break;case`<`:o=e<r;break;case`<=`:o=e<=r;break;case`>`:o=e>r;break;case`>=`:o=e>=r;break;default:n=!0}return{result:o,error:n}}return{result:t.has(e),error:n}}static processParentheses(t,n){let r=!1,i=t.trim();for(;i.startsWith(`(`)&&i.endsWith(`)`);){let e=0,t=!0;for(let n=0;n<i.length-1;n++)if(i[n]===`(`)e++;else if(i[n]===`)`&&(e--,e===0)){t=!1;break}if(t)i=i.slice(1,-1).trim();else break}for(;;){let t=!1,a=0,o=0,s=-1,c=-1,l=0;for(let e=0;e<i.length;e++)if(i[e]===`(`){let n=i.substring(0,e);f.test(n)?l++:l===0&&(a++,a>o&&(o=a,s=e),t=!0)}else i[e]===`)`&&(l>0?l--:a>0&&(a===o&&s!==-1&&(c=e),a--));if(!t||s===-1||c===-1)break;let u=i.substring(s+1,c),{result:d,error:p}=e.evaluate(u,n);r||=p,i=i.substring(0,s)+(d?`true`:`false`)+i.substring(c+1)}return{expression:i,error:r}}static evaluate(t,n){let r=m.exec(t)===null,i=t,a=!1;if(t.replace(d,``).indexOf(`(`)!==-1){let r=e.processParentheses(t,n);i=r.expression,a=r.error}if(a)return{result:!1,error:!0};let o=i.split(`||`);for(let t of o){let i=t.split(`&&`),a=!0;for(let t of i){let{result:r,error:i}=e.evaluateAtomicExpression(t.trim(),n);if(!r||i){a=!1;break}}if(a)return{result:!0,error:!r}}return{result:!1,error:!r}}};n(y,`sourceName`);var ee=y,te=0,ne=1,re=2,ie=3,ae=4,oe=5,se=6,ce=7,le=8,ue=9,de=10,fe=11,pe=12,me=13,he=14,ge=15,_e=16,ve=17,ye=18,be=19,xe=20,Se=21,Ce=22,we=23,Te=24,Ee=25,De=26,Oe=27,ke=28,Ae=29,je=30,Me=31,Ne=32,Pe=33,Fe=34,Ie=35,Le=36,Re=37,ze=38,Be=39,Ve=40,He=41,Ue=42,We=43,Ge=44,Ke=45,qe=46,Je=47,Ye=48,Xe=49,Ze=50,Qe=51,$e=52,et=53,tt=54,nt=55,rt=56,it=61,at=62,ot=63,st=64,ct=65,lt=66,ut=67,dt=68,ft=69,pt=70,mt=71,ht=72,gt=73,_t=74,vt=75,b=`POSITION`,x=`NORMAL`,yt=`TANGENT`,bt=`BLENDWEIGHT`,xt=`BLENDINDICES`,St=`COLOR`,Ct=`TEXCOORD0`,wt=`TEXCOORD1`,Tt=`TEXCOORD2`,Et=`TEXCOORD3`,Dt=`TEXCOORD4`,Ot=`TEXCOORD5`,kt=`TEXCOORD6`,At=`TEXCOORD7`,jt=`ATTR0`,Mt=`ATTR1`,Nt=`ATTR2`,Pt=`ATTR3`,Ft=`ATTR4`,It=`ATTR5`,Lt=`ATTR6`,Rt=`ATTR7`,zt=`ATTR8`,Bt=`ATTR9`,Vt=`ATTR10`,Ht=`ATTR11`,Ut=`ATTR12`,Wt=`ATTR13`,Gt=`ATTR14`,Kt=`ATTR15`,qt=`1d`,S=`2d`,C=`2d-array`,w=`cube`,T=`cube-array`,E=`3d`,D=0,O=1,k=2,A=3,j=4,Jt=`glsl`,Yt=`wgsl`,Xt=0,Zt=2,M=4,N=5,P=6,Qt=7,$t=0,en=1,F=2,I=3,tn=4,nn=5,rn=6,an=7,on=8,sn=9,cn=10,ln=11,un=12,dn=13,fn=14,pn=17,mn=21,hn=22,gn=23,_n=24,vn=26,yn=27,bn=28,xn=29,Sn=30,Cn=31,wn=32,Tn=33,En=34,Dn=35,On=36,kn=37,An=38,jn=39,Mn=40,Nn=41,Pn=`bool.int.float.vec2.vec3.vec4.ivec2.ivec3.ivec4.bvec2.bvec3.bvec4.mat2.mat3.mat4.sampler2D.samplerCube..sampler2DShadow.samplerCubeShadow.sampler3D.....sampler2DArray.uint.uvec2.uvec3.uvec4.............isampler2D.usampler2D.isamplerCube.usamplerCube.isampler3D.usampler3D.isampler2DArray.usampler2DArray`.split(`.`),Fn=[[`bool`],[`i32`],[`f32`],[`vec2f`,`vec2<f32>`],[`vec3f`,`vec3<f32>`],[`vec4f`,`vec4<f32>`],[`vec2i`,`vec2<i32>`],[`vec3i`,`vec3<i32>`],[`vec4i`,`vec4<i32>`],[`vec2<bool>`],[`vec3<bool>`],[`vec4<bool>`],[`mat2x2f`,`mat2x2<f32>`],[`mat3x3f`,`mat3x3<f32>`],[`mat4x4f`,`mat4x4<f32>`],[`texture_2d<f32>`],[`texture_cube<f32>`],[`array<f32>`],[`texture_depth_2d`],[`texture_depth_cube`],[`texture_3d<f32>`],[`array<vec2<f32>>`],[`array<vec3<f32>>`],[`array<vec4<f32>>`],[`array<mat4x4<f32>>`],[`texture_2d_array<f32>`],[`u32`],[`vec2u`,`vec2<u32>`],[`vec3u`,`vec3<u32>`],[`vec4u`,`vec4<u32>`],[`array<i32>`],[`array<u32>`],[`array<bool>`],[`array<vec2i>`,`array<vec2<i32>>`],[`array<vec2u>`,`array<vec2<u32>>`],[`array<vec2b>`,`array<vec2<bool>>`],[`array<vec3i>`,`array<vec3<i32>>`],[`array<vec3u>`,`array<vec3<u32>>`],[`array<vec3b>`,`array<vec3<bool>>`],[`array<vec4i>`,`array<vec4<i32>>`],[`array<vec4u>`,`array<vec4<u32>>`],[`array<vec4b>`,`array<vec4<bool>>`],[`texture_2d<i32>`],[`texture_2d<u32>`],[`texture_cube<i32>`],[`texture_cube<u32>`],[`texture_3d<i32>`],[`texture_3d<u32>`],[`texture_2d_array<i32>`],[`texture_2d_array<u32>`]],L=new Map;Fn.forEach((e,t)=>{e.forEach(e=>L.set(e,t))}),new Uint8Array([M,M,P,P,P,P,M,M,M,M,M,M,P,P,P,M,M,P,M,M,M,P,P,P,P,M,N,N,N,N,M,N,M,M,N,M,M,N,M,M,N,M,M,N,M,N,M,N,M,N]);var In=1,Ln=2,R=4,Rn=1,zn=2,Bn=[`view`,`mesh`,`mesh_ub`],Vn=`_unused_float_uniform`,Hn=new Map([[`float`,`f32`],[`vec2`,`vec2f`],[`vec3`,`vec3f`],[`vec4`,`vec4f`],[`int`,`i32`],[`ivec2`,`vec2i`],[`ivec3`,`vec3i`],[`ivec4`,`vec4i`],[`uint`,`u32`],[`uvec2`,`vec2u`],[`uvec3`,`vec3u`],[`uvec4`,`vec4u`]]),z={};z[b]=0,z[x]=1,z[bt]=2,z[xt]=3,z[St]=4,z[Ct]=5,z[wt]=6,z[Tt]=7,z[Et]=8,z[Dt]=9,z[Ot]=10,z[kt]=11,z[At]=12,z[yt]=13,z[jt]=0,z[Mt]=1,z[Nt]=2,z[Pt]=3,z[Ft]=4,z[It]=5,z[Lt]=6,z[Rt]=7,z[zt]=8,z[Bt]=9,z[Vt]=10,z[Ht]=11,z[Ut]=12,z[Wt]=13,z[Gt]=14,z[Kt]=15;var B={DEG_TO_RAD:Math.PI/180,RAD_TO_DEG:180/Math.PI,clamp(e,t,n){return e>=n?n:e<=t?t:e},intToBytes24(e){return[e>>16&255,e>>8&255,e&255]},intToBytes32(e){return[e>>24&255,e>>16&255,e>>8&255,e&255]},bytesToInt24(e,t,n){return e.length&&(n=e[2],t=e[1],e=e[0]),e<<16|t<<8|n},bytesToInt32(e,t,n,r){return e.length&&(r=e[3],n=e[2],t=e[1],e=e[0]),(e<<24|t<<16|n<<8|r)>>>0},lerp(e,t,n){return e+(t-e)*B.clamp(n,0,1)},lerpUnclamped(e,t,n){return e+(t-e)*n},lerpAngle(e,t,n){return t-e>180&&(t-=360),t-e<-180&&(t+=360),B.lerp(e,t,B.clamp(n,0,1))},powerOfTwo(e){return e!==0&&!(e&e-1)},nextPowerOfTwo(e){return e--,e|=e>>1,e|=e>>2,e|=e>>4,e|=e>>8,e|=e>>16,e++,e},nearestPowerOfTwo(e){return 2**Math.round(Math.log2(e))},random(e,t){let n=t-e;return Math.random()*n+e},smoothstep(e,t,n){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))},smootherstep(e,t,n){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))},roundUp(e,t){return t===0?e:Math.ceil(e/t)*t},between(e,t,n,r){let i=Math.min(t,n),a=Math.max(t,n);return r?e>=i&&e<=a:e>i&&e<a}},V=[];V[F]=1,V[I]=2,V[tn]=3,V[nn]=4,V[en]=1,V[rn]=2,V[an]=3,V[on]=4,V[$t]=1,V[sn]=2,V[cn]=3,V[ln]=4,V[un]=8,V[dn]=12,V[fn]=16,V[vn]=1,V[yn]=2,V[bn]=3,V[xn]=4;var H=class{constructor(e,t,r=0){if(n(this,`name`),n(this,`type`),n(this,`byteSize`),n(this,`offset`),n(this,`scopeId`),n(this,`count`),n(this,`numComponents`),this.shortName=e,this.name=r?`${e}[0]`:e,this.type=t,this.numComponents=V[t],this.updateType=t,r>0)switch(t){case F:this.updateType=pn;break;case en:this.updateType=Sn;break;case vn:this.updateType=Cn;break;case $t:this.updateType=wn;break;case I:this.updateType=mn;break;case rn:this.updateType=Tn;break;case yn:this.updateType=En;break;case sn:this.updateType=Dn;break;case tn:this.updateType=hn;break;case an:this.updateType=On;break;case bn:this.updateType=kn;break;case cn:this.updateType=An;break;case nn:this.updateType=gn;break;case on:this.updateType=jn;break;case xn:this.updateType=Mn;break;case ln:this.updateType=Nn;break;case fn:this.updateType=_n}this.count=r;let i=this.numComponents;r&&(i=B.roundUp(i,4)),this.byteSize=i*4,r&&(this.byteSize*=r)}get isArrayType(){return this.count>0}calculateOffset(e){let t=this.byteSize<=8?this.byteSize:16;this.count&&(t=16),e=B.roundUp(e,t),this.offset=e/4}},U=class{constructor(e,t){n(this,`byteSize`,0),n(this,`map`,new Map),this.scope=e.scope,this.uniforms=t;let r=0;for(let e=0;e<t.length;e++){let n=t[e];n.calculateOffset(r),r=n.offset*4+n.byteSize,n.scopeId=this.scope.resolve(n.name),this.map.set(n.name,n)}this.byteSize=B.roundUp(r,16)}get(e){return this.map.get(e)}},Un=0,W=class{constructor(e,t){n(this,`slot`,-1),n(this,`scopeId`,null),this.name=e,this.visibility=t}},Wn=class extends W{},Gn=class extends W{constructor(e,t,r=!1){super(e,t),n(this,`format`,``),this.readOnly=r}},G=class extends W{constructor(e,t,r=S,i=D,a=!0,o=null,s=!1){super(e,t),n(this,`samplerName`,null),n(this,`hasSampler`),n(this,`multisampled`),this.textureDimension=r,this.multisampled=s,this.hasSampler=!s&&a,this.samplerName=s?null:o??`${e}_sampler`,this.sampleType=s&&i===D?O:i}},Kn=class extends W{constructor(e,t=ce,n=S,r=!0,i=!1){super(e,R),this.format=t,this.textureDimension=n,this.write=r,this.read=i}},K=class{constructor(e,t){n(this,`uniformBufferFormats`,[]),n(this,`textureFormats`,[]),n(this,`storageTextureFormats`,[]),n(this,`storageBufferFormats`,[]),this.id=Un++;let r=0;t.forEach(e=>{e.slot=r++,e instanceof G&&e.hasSampler&&r++,e instanceof Wn?this.uniformBufferFormats.push(e):e instanceof G?this.textureFormats.push(e):e instanceof Kn?this.storageTextureFormats.push(e):e instanceof Gn&&this.storageBufferFormats.push(e)}),this.device=e;let i=e.scope;this.bufferFormatsMap=new Map,this.uniformBufferFormats.forEach((e,t)=>this.bufferFormatsMap.set(e.name,t)),this.textureFormatsMap=new Map,this.textureFormats.forEach((e,t)=>{this.textureFormatsMap.set(e.name,t),e.scopeId=i.resolve(e.name)}),this.storageTextureFormatsMap=new Map,this.storageTextureFormats.forEach((e,t)=>{this.storageTextureFormatsMap.set(e.name,t),e.scopeId=i.resolve(e.name)}),this.storageBufferFormatsMap=new Map,this.storageBufferFormats.forEach((e,t)=>{this.storageBufferFormatsMap.set(e.name,t),e.scopeId=i.resolve(e.name)}),this.impl=e.createBindGroupFormatImpl(this)}destroy(){this.impl.destroy()}getTexture(e){let t=this.textureFormatsMap.get(e);return t===void 0?null:this.textureFormats[t]}getStorageTexture(e){let t=this.storageTextureFormatsMap.get(e);return t===void 0?null:this.storageTextureFormats[t]}loseContext(){}},q=[];q[te]=``,q[ne]=``,q[re]=``,q[$e]=`r8unorm`,q[et]=`rg8unorm`,q[ie]=``,q[ae]=``,q[oe]=``,q[se]=`rgba8unorm`,q[ce]=`rgba8unorm`,q[le]=`bc1-rgba-unorm`,q[ue]=`bc2-rgba-unorm`,q[de]=`bc3-rgba-unorm`,q[fe]=``,q[pe]=`rgba16float`,q[Ze]=`r16float`,q[Qe]=`rg16float`,q[me]=``,q[he]=`rgba32float`,q[ge]=`r32float`,q[pt]=`rg32float`,q[_e]=`depth32float`,q[ft]=`depth16unorm`,q[ve]=`depth24plus-stencil8`,q[ye]=`rg11b10ufloat`,q[be]=``,q[xe]=`rgba8unorm-srgb`,q[Se]=``,q[Ce]=`etc2-rgb8unorm`,q[we]=`etc2-rgba8unorm`,q[Te]=``,q[Ee]=``,q[De]=``,q[Oe]=``,q[ke]=`astc-4x4-unorm`,q[Ae]=``,q[je]=``,q[Me]=`bgra8unorm`,q[st]=`bgra8unorm-srgb`,q[Ne]=`r8sint`,q[Pe]=`r8uint`,q[Fe]=`r16sint`,q[Ie]=`r16uint`,q[Le]=`r32sint`,q[Re]=`r32uint`,q[ze]=`rg8sint`,q[Be]=`rg8uint`,q[Ve]=`rg16sint`,q[He]=`rg16uint`,q[Ue]=`rg32sint`,q[We]=`rg32uint`,q[Ge]=`rgba8sint`,q[Ke]=`rgba8uint`,q[qe]=`rgba16sint`,q[Je]=`rgba16uint`,q[Ye]=`rgba32sint`,q[Xe]=`rgba32uint`,q[ct]=`bc6h-rgb-float`,q[lt]=`bc6h-rgb-ufloat`,q[ut]=`bc7-rgba-unorm`,q[mt]=`rgb9e5ufloat`,q[ht]=`rg8snorm`,q[gt]=`rgba8snorm`,q[_t]=`rgb10a2unorm`,q[vt]=`rgb10a2uint`,q[tt]=`bc1-rgba-unorm-srgb`,q[nt]=`bc2-rgba-unorm-srgb`,q[rt]=`bc3-rgba-unorm-srgb`,q[it]=`etc2-rgb8unorm-srgb`,q[at]=`etc2-rgba8unorm-srgb`,q[dt]=`bc7-rgba-unorm-srgb`,q[ot]=`astc-4x4-unorm-srgb`;var qn=/^[ \t]*(attribute|varying|uniform)[\t ]+/gm,J=/^[ \t]*(attribute|varying|uniform)[ \t]*([^;]+)(;+)/gm,Y=/^[ \t]*var\s*(?:(<storage,[^>]*>)\s*([\w\d_]+)\s*:\s*(.*?)\s*;|(<(?!storage,)[^>]*>)?\s*([\w\d_]+)\s*:\s*(texture_.*|storage_texture_.*|storage\w.*|external_texture|sampler(?:_comparison)?)\s*;)\s*$/gm,Jn=/(?:@interpolate\([^)]*\)\s*)?([\w]+)\s*:\s*([\w<>]+)/,X=`@@@`,Z=/(@vertex|@fragment)\s*fn\s+\w+\s*\(\s*(\w+)\s*:[\s\S]*?\{/,Yn=/\.fragDepth\s*=/,Xn=/\.sampleMask\s*=(?!=)/,Zn=[{wgslName:`position`,wgslType:`vec4f`,wgslBuiltin:`position`,pcName:`pcPosition`,isFallback:!0},{wgslName:`frontFacing`,wgslType:`bool`,wgslBuiltin:`front_facing`,pcName:`pcFrontFacing`},{wgslName:`sampleIndex`,wgslType:`u32`,wgslBuiltin:`sample_index`,pcName:`pcSampleIndex`},{wgslName:`sampleMask`,wgslType:`u32`,wgslBuiltin:`sample_mask`,pcName:`pcSampleMask`},{wgslName:`primitiveIndex`,wgslType:`u32`,wgslBuiltin:`primitive_index`,pcName:`pcPrimitiveIndex`,requiresFeature:`supportsPrimitiveIndex`}],Qn=[{wgslName:`vertexIndex`,wgslType:`u32`,wgslBuiltin:`vertex_index`,pcName:`pcVertexIndex`,isFallback:!0},{wgslName:`instanceIndex`,wgslType:`u32`,wgslBuiltin:`instance_index`,pcName:`pcInstanceIndex`}],$n=(e,t,n,r)=>e.filter(e=>e.requiresFeature&&!r[e.requiresFeature]?!1:RegExp(`\\b(?:${e.pcName}|${n}\\.${e.wgslName})\\b`).test(t)),er=(e,t,n,r)=>{if(e.length===0&&!r){let e=t.find(e=>e.isFallback&&(!e.requiresFeature||n[e.requiresFeature]));if(e)return[e]}return e},tr=e=>e.map(e=>`    @builtin(${e.wgslBuiltin}) ${e.wgslName} : ${e.wgslType},
`).join(``),nr=e=>e.map(e=>`    var<private> ${e.pcName}: ${e.wgslType};
`).join(``),rr=e=>e.map(e=>`    ${e.pcName} = input.${e.wgslName};
`).join(``),ir={texture_1d:{viewDimension:qt,baseSampleType:D},texture_2d:{viewDimension:S,baseSampleType:D},texture_2d_array:{viewDimension:C,baseSampleType:D},texture_3d:{viewDimension:E,baseSampleType:D},texture_cube:{viewDimension:w,baseSampleType:D},texture_cube_array:{viewDimension:T,baseSampleType:D},texture_multisampled_2d:{viewDimension:S,baseSampleType:D,multisampled:!0},texture_depth_2d:{viewDimension:S,baseSampleType:k},texture_depth_2d_array:{viewDimension:C,baseSampleType:k},texture_depth_cube:{viewDimension:w,baseSampleType:k},texture_depth_cube_array:{viewDimension:T,baseSampleType:k},texture_depth_multisampled_2d:{viewDimension:S,baseSampleType:k,multisampled:!0},texture_external:{viewDimension:S,baseSampleType:O}},ar=(e,t)=>{let n=ir[e],r=n.baseSampleType,i=!!n.multisampled;if(n.baseSampleType===D){switch(t){case`u32`:r=j;break;case`i32`:r=A;break;case`f32`:r=D;break;case`uff`:r=O}i&&r===D&&(r=O)}return{viewDimension:n.viewDimension,sampleType:r,multisampled:i}},or=(e,t,n=!1)=>{if(n){if(t===k)return`texture_depth_multisampled_2d`;let e;switch(t){case D:case O:e=`f32`;break;case j:e=`u32`;break;case A:e=`i32`}return`texture_multisampled_2d<${e}>`}if(t===k)switch(e){case S:return`texture_depth_2d`;case C:return`texture_depth_2d_array`;case w:return`texture_depth_cube`;case T:return`texture_depth_cube_array`}let r;switch(e){case qt:r=`texture_1d`;break;case S:r=`texture_2d`;break;case C:r=`texture_2d_array`;break;case E:r=`texture_3d`;break;case w:r=`texture_cube`;break;case T:r=`texture_cube_array`}let i;switch(t){case D:case O:i=`f32`;break;case j:i=`u32`;break;case A:i=`i32`}return`${r}<${i}>`},sr=new Map;q.forEach((e,t)=>{e&&sr.set(e,t)});var cr={f32:`WrappedF32`,i32:`WrappedI32`,u32:`WrappedU32`,vec2f:`WrappedVec2F`,vec2i:`WrappedVec2I`,vec2u:`WrappedVec2U`},lr=e=>(e=e.replace(/\s+/g,` `).trim(),e.split(/[\s:]+/)),ur=/array<([^,]+),\s*([^>]+)>/,dr=class{constructor(e,t){n(this,`ubName`,null),n(this,`arraySize`,0),this.line=e;let r=lr(e);if(r.length<2){t.failed=!0;return}if(this.name=r[0],this.type=r.slice(1).join(` `),this.type.includes(`array<`)){let e=ur.exec(this.type);this.type=e[1].trim(),this.arraySize=Number(e[2]),isNaN(this.arraySize)&&(t.failed=!0)}}},fr=/^\s*var\s+(\w+)\s*:\s*(texture_\w+)(?:<(\w+)>)?;\s*$/,pr=/^\s*var\s+([\w\d_]+)\s*:\s*(texture_storage_2d|texture_storage_2d_array)<([\w\d_]+),\s*(\w+)>\s*;\s*$/,mr=/^\s*var\s*<storage,\s*(read_write|read)?>\s*([\w\d_]+)\s*:\s*(.*)\s*;\s*$/,hr=/^\s*var\s+([\w\d_]+)\s*:\s*texture_external;\s*$/,gr=/^\s*var\s+([\w\d_]+)\s*:\s*(sampler|sampler_comparison)\s*;\s*$/,_r=class{constructor(e,t){this.originalLine=e,this.line=e,this.isTexture=!1,this.isSampler=!1,this.isStorageTexture=!1,this.isStorageBuffer=!1,this.isExternalTexture=!1,this.multisampled=!1,this.type=``,this.matchedElements=[];let n=this.line.match(fr);if(n){this.name=n[1],this.type=n[2],this.textureFormat=n[3],this.isTexture=!0,this.matchedElements.push(...n);let e=ar(this.type,this.textureFormat);this.textureDimension=e.viewDimension,this.sampleType=e.sampleType,this.multisampled=e.multisampled}let r=this.line.match(pr);r&&(this.isStorageTexture=!0,this.name=r[1],this.textureType=r[2],this.format=r[3],this.access=r[4],this.matchedElements.push(...r));let i=this.line.match(mr);i&&(this.isStorageBuffer=!0,this.accessMode=i[1]||`none`,this.name=i[2],this.type=i[3],this.matchedElements.push(...i));let a=this.line.match(hr);a&&(this.name=a[1],this.isExternalTexture=!0,this.matchedElements.push(...i));let o=this.line.match(gr);o&&(this.name=o[1],this.samplerType=o[2],this.isSampler=!0,this.matchedElements.push(...o)),this.matchedElements.length===0&&(t.failed=!0)}equals(e){return this.name===e.name&&this.type===e.type&&this.isTexture===e.isTexture&&this.isSampler===e.isSampler&&this.isStorageTexture===e.isStorageTexture&&this.isStorageBuffer===e.isStorageBuffer&&this.isExternalTexture===e.isExternalTexture&&this.textureFormat===e.textureFormat&&this.textureDimension===e.textureDimension&&this.sampleType===e.sampleType&&this.multisampled===e.multisampled&&this.textureType===e.textureType&&this.format===e.format&&this.access===e.access&&this.accessMode===e.accessMode&&this.samplerType===e.samplerType}},vr=class e{static run(t,n,r){let i=new Map,a=e.extract(n.vshader),o=e.extract(n.fshader),s=a.src.match(Z)?.[2]??``,c=o.src.match(Z)?.[2]??``,l=new Map,u=e.processAttributes(a.attributes,n.attributes,l,n.processingOptions,r,t,a.src,s),d=e.processVaryings(a.varyings,i,!0,t),f=e.processVaryings(o.varyings,i,!1,t,o.src,c),p=a.uniforms.concat(o.uniforms),m=Array.from(new Set(p)).map(e=>new dr(e,r)),h=e.processUniforms(t,m,n.processingOptions,r);a.src=e.renameUniformAccess(a.src,m),o.src=e.renameUniformAccess(o.src,m);let g=e.mergeResources(a.resources,o.resources,r),_=e.processResources(t,g,n.processingOptions,r),v=e.generateFragmentOutputStruct(o.src,t.maxColorAttachments,n.useDualSourceBlending);a.src=e.copyInputs(a.src,r),o.src=e.copyInputs(o.src,r);let y=`${u}
${d}
${h.code}
${_.code}
`,ee=a.src.replace(X,y),te=`${f}
${v}
${h.code}
${_.code}
`;return{vshader:ee,fshader:o.src.replace(X,te),attributes:l,meshUniformBufferFormat:h.meshUniformBufferFormat,meshBindGroupFormat:_.meshBindGroupFormat}}static runCompute(t,n,r,i,a){let o=e.extract(n),s=o.uniforms.map(e=>new dr(e,i)),c=[];s.forEach(e=>{e.ubName=`ub_compute`;let t=L.get(e.type);c.push(new H(e.name,t,e.arraySize))});let l=c.length>0?new U(t,c):null,u=e.mergeResources(o.resources,[],i),d=e.buildResourceFormats(u,R,i),f=l?new Wn(`ub_compute`,R):null,p=f?[...d,f]:d,m=n,h=null;if(p.length>0){h=new K(t,p);let n=e.getTextureShaderDeclaration(h,a);l&&(n+=e.getUniformShaderDeclaration(l,a,f.slot,`compute`));let r=e.renameUniformAccess(o.src,s);m=r.includes(X)?r.replace(X,n):`${n}
${r}`}return{cshader:m,computeBindGroupFormat:h,computeUniformBufferFormat:l}}static extract(t){let n=[],r=[],i=[],a=[],o=`${X}
`,s;for(;(s=qn.exec(t))!==null;){let a=s[1];J.lastIndex=s.index;let c=J.exec(t);a===`attribute`?n.push(c[2]):a===`varying`?r.push(c[2]):a===`uniform`&&i.push(c[2]),t=e.cutOut(t,s.index,J.lastIndex,o),qn.lastIndex=s.index+o.length,o=``}for(;(s=Y.exec(t))!==null;)a.push(s[0]),t=e.cutOut(t,s.index,Y.lastIndex,o),Y.lastIndex=s.index+o.length,o=``;if(o){let e=t.match(/^(?:\s*(?:enable|requires)\s+\w+\s*;)*/)?.[0]??``;t=`${e}
${o}${t.slice(e.length)}`}return{src:t,attributes:n,varyings:r,uniforms:i,resources:a}}static processUniforms(t,n,r,i){let a=[];n.forEach(e=>{if(r.hasUniform(e.name))e.ubName=`ub_view`;else{e.ubName=`ub_mesh_ub`;let t=L.get(e.type),n=new H(e.name,t,e.arraySize);a.push(n)}}),a.length===0&&a.push(new H(Vn,F));let o=new U(t,a),s=``;return r.uniformFormats.forEach((t,n)=>{t&&(s+=e.getUniformShaderDeclaration(t,n,0))}),o&&(s+=e.getUniformShaderDeclaration(o,zn,0)),{code:s,meshUniformBufferFormat:o}}static renameUniformAccess(e,t){return t.forEach(t=>{let n=`uniform.${t.name}`,r=`${t.ubName}.${t.name}`,i=RegExp(`\\b${n}\\b`,`g`);e=e.replace(i,r)}),e}static mergeResources(e,t,n){let r=e.map(e=>new _r(e,n));return t.map(e=>new _r(e,n)).forEach(e=>{let t=r.find(t=>t.name===e.name);t?t.equals(e)||(n.failed=!0):r.push(e)}),r}static buildResourceFormats(e,t,n){let r=[];for(let n=0;n<e.length;n++){let i=e[n];if(i.isTexture){let a=e[n+1],o=(a?.isSampler??!1)&&!i.multisampled,s=i.sampleType,c=i.textureDimension;r.push(new G(i.name,t,c,s,o,o?a.name:null,i.multisampled)),o&&n++}if(i.isStorageBuffer){let e=i.accessMode!==`read_write`,n=new Gn(i.name,t,e);n.format=i.type,r.push(n)}if(i.isStorageTexture){let e=i.textureType===`texture_storage_2d_array`?C:S,t=sr.get(i.format),n=i.access===`write`||i.access===`read_write`,a=i.access===`read`||i.access===`read_write`;r.push(new Kn(i.name,t,e,n,a))}}return r}static processResources(t,n,r,i,a=In|Ln,o=Rn){let s=new K(t,e.buildResourceFormats(n,a,i)),c=``;return r?.bindGroupFormats?.forEach((t,n)=>{t&&(c+=e.getTextureShaderDeclaration(t,n))}),c+=e.getTextureShaderDeclaration(s,o),{code:c,meshBindGroupFormat:s}}static getUniformShaderDeclaration(e,t,n,r=Bn[t]){let i=`struct_ub_${r}`,a=`struct ${i} {
`;return e.uniforms.forEach(e=>{let t=Fn[e.type][0];e.count>0?(cr.hasOwnProperty(t)&&(t=cr[t]),a+=`    ${e.shortName}: array<${t}, ${e.count}>,
`):a+=`    ${e.shortName}: ${t},
`}),a+=`};
`,a+=`@group(${t}) @binding(${n}) var<uniform> ub_${r} : ${i};

`,a}static getTextureShaderDeclaration(e,t){let n=``;return e.textureFormats.forEach(e=>{let r=or(e.textureDimension,e.sampleType,e.multisampled);if(n+=`@group(${t}) @binding(${e.slot}) var ${e.name}: ${r};
`,e.hasSampler){let r=e.sampleType===k?`sampler_comparison`:`sampler`;n+=`@group(${t}) @binding(${e.slot+1}) var ${e.samplerName}: ${r};
`}}),e.storageBufferFormats.forEach(e=>{let r=e.readOnly?`read`:`read_write`;n+=`@group(${t}) @binding(${e.slot}) var<storage, ${r}> ${e.name} : ${e.format};
`}),e.storageTextureFormats.forEach(e=>{let r=e.textureDimension===C?`texture_storage_2d_array`:`texture_storage_2d`,i=q[e.format],a=e.read?e.write?`read_write`:`read`:`write`;n+=`@group(${t}) @binding(${e.slot}) var ${e.name}: ${r}<${i}, ${a}>;
`}),n}static processVaryings(e,t,n,r,i=``,a=``){let o=``,s=``,c=``;if(e.forEach((e,r)=>{let i=e.match(Jn);if(i){let a=i[1],l=i[2];n?t.set(a,r):r=t.get(a),o+=`    @location(${r}) ${e},
`,n||(s+=`    var<private> ${a}: ${l};
`,c+=`    ${a} = input.${a};
`)}}),n)return o+=`    @builtin(position) position : vec4f,
`,`
                struct VertexOutput {
                    ${o}
                };
            `;let l=er($n(Zn,i,a,r),Zn,r,o.length>0);return o+=tr(l),`
            struct FragmentInput {
                ${o}
            };

            ${nr(l)}
            ${s}

            // function to copy inputs (varyings) to private global variables
            fn _pcCopyInputs(input: FragmentInput) {
                ${c}
                ${rr(l)}
            }
        `}static generateFragmentOutputStruct(e,t,n=!1){let r=`struct FragmentOutput {
`;if(n)r+=`    @location(0) @blend_src(0) color : pcOutType0,
`,r+=`    @location(0) @blend_src(1) colorSecondary : pcOutType0,
`;else{let n=e=>`color${e>0?e:``}`;for(let i=0;i<t;i++){let t=n(i);e.search(RegExp(`\\.${t}\\s*=`))!==-1&&(r+=`    @location(${i}) ${t} : pcOutType${i},
`)}}return e.search(Yn)!==-1&&(r+=`    @builtin(frag_depth) fragDepth : f32,
`),e.search(Xn)!==-1&&(r+=`    @builtin(sample_mask) sampleMask : u32,
`),`${r}};
`}static floatAttributeToInt(e,t){let n={f32:`f32`,"vec2<f32>":`vec2f`,"vec3<f32>":`vec3f`,"vec4<f32>":`vec4f`}[e]||e;return{f32:t?`i32`:`u32`,vec2f:t?`vec2i`:`vec2u`,vec3f:t?`vec3i`:`vec3u`,vec4f:t?`vec4i`:`vec4u`}[n]||null}static processAttributes(t,n={},r,i,a,o,s=``,c=``){let l=``,u=``,d=``,f={};t.forEach(t=>{let a=lr(t),o=a[0],s=a[1],c=s;if(n.hasOwnProperty(o)){let a=n[o],p=z[a];f[p]=a,r.set(p,o);let m=i.getVertexElement(a);if(m){let t=m.dataType;if(t!==P&&t!==Qt&&!m.normalize&&!m.asInt){let n=t===Xt||t===Zt||t===M;s=e.floatAttributeToInt(s,n)}}l+=`    @location(${p}) ${o}: ${s},
`,u+=`    var<private> ${t};
`,d+=`    ${o} = ${c}(input.${o});
`}});let p=er($n(Qn,s,c,o),Qn,o,l.length>0);return`
            struct VertexInput {
                ${l}
                ${tr(p)}
            };

            ${u}
            ${nr(p)}

            fn _pcCopyInputs(input: VertexInput) {
                ${d}
                ${rr(p)}
            }
        `}static copyInputs(e,t){let n=e.match(Z);if(!n||!n[2])return e;let r=n[2],i=n.index+n[0].length-1,a=e.slice(0,i+1),o=e.slice(i+1);return a+`
    _pcCopyInputs(${r});`+o}static cutOut(e,t,n,r){return e.substring(0,t)+r+e.substring(n)}},yr=/[ \t]*(\battribute\b|\bvarying\b|\buniform\b)/g,Q=/(\battribute\b|\bvarying\b|\bout\b|\buniform\b)[ \t]*([^;]+)(;+)/g,br=/([\w-]+)\[(.*?)\]/,xr=new Set([`highp`,`mediump`,`lowp`]),Sr=new Set([`sampler2DShadow`,`samplerCubeShadow`,`sampler2DArrayShadow`]),Cr={sampler2D:S,sampler3D:E,samplerCube:w,samplerCubeShadow:w,sampler2DShadow:S,sampler2DArray:C,sampler2DArrayShadow:C,isampler2D:S,usampler2D:S,isampler3D:E,usampler3D:E,isamplerCube:w,usamplerCube:w,isampler2DArray:C,usampler2DArray:C},wr={[S]:`texture2D`,[w]:`textureCube`,[E]:`texture3D`,[C]:`texture2DArray`},$=class{constructor(e,t){this.line=e;let n=e.trim().split(/\s+/);if(xr.has(n[0])&&(this.precision=n.shift()),this.type=n.shift(),e.includes(`,`),e.includes(`[`)){let e=n.join(` `),r=br.exec(e);this.name=r[1],this.arraySize=Number(r[2]),isNaN(this.arraySize)&&(t.failed=!0)}else this.name=n.shift(),this.arraySize=0;this.isSampler=this.type.indexOf(`sampler`)!==-1,this.isSignedInt=this.type.indexOf(`isampler`)!==-1,this.isUnsignedInt=this.type.indexOf(`usampler`)!==-1}},Tr=class e{static run(t,n,r){let i=new Map,a=e.extract(n.vshader),o=e.extract(n.fshader),s=new Map,c=e.processAttributes(a.attributes,n.attributes,s,n.processingOptions),l=e.processVaryings(a.varyings,i,!0),u=e.processVaryings(o.varyings,i,!1),d=e.processOuts(o.outs),f=a.uniforms.concat(o.uniforms),p=Array.from(new Set(f)).map(e=>new $(e,r)),m=e.processUniforms(t,p,n.processingOptions,r),h=`${c}
${l}
${m.code}`,g=a.src.replace(e.MARKER,h),_=`${u}
${d}
${m.code}`;return{vshader:g,fshader:o.src.replace(e.MARKER,_),attributes:s,meshUniformBufferFormat:m.meshUniformBufferFormat,meshBindGroupFormat:m.meshBindGroupFormat}}static extract(t,n=!1){let r=[],i=[],a=[],o=[],s=`${e.MARKER}
`,c;for(;(c=yr.exec(t))!==null;){let l=c[1];if(!(n&&l!==`uniform`))switch(l){case`attribute`:case`varying`:case`uniform`:case`out`:{Q.lastIndex=c.index;let n=Q.exec(t);l===`attribute`?r.push(n[2]):l===`varying`?i.push(n[2]):l===`out`?a.push(n[2]):l===`uniform`&&o.push(n[2]),t=e.cutOut(t,c.index,Q.lastIndex,s),yr.lastIndex=c.index+s.length,s=``;break}}}return{src:t,attributes:r,varyings:i,outs:a,uniforms:o}}static parseUniformLines(e,t){return e.map(e=>new $(e,t))}static processUniforms(t,n,r,i){let a=[],o=[];n.forEach(e=>{e.isSampler?a.push(e):o.push(e)});let s=[];o.forEach(e=>{if(!r.hasUniform(e.name)){let t=Pn.indexOf(e.type),n=new H(e.name,t,e.arraySize);s.push(n)}}),s.length===0&&s.push(new H(Vn,F));let c=s.length?new U(t,s):null,l=[];a.forEach(e=>{if(!r.hasTexture(e.name)){let t=D;e.isSignedInt?t=A:e.isUnsignedInt?t=j:(e.precision===`highp`&&(t=O),Sr.has(e.type)&&(t=k));let n=Cr[e.type];l.push(new G(e.name,In|Ln,n,t))}});let u=new K(t,l),d=``;return r.uniformFormats.forEach((t,n)=>{t&&(d+=e.getUniformShaderDeclaration(t,n,0))}),c&&(d+=e.getUniformShaderDeclaration(c,zn,0)),r.bindGroupFormats.forEach((t,n)=>{t&&(d+=e.getTexturesShaderDeclaration(t,n))}),d+=e.getTexturesShaderDeclaration(u,Rn),{code:d,meshUniformBufferFormat:c,meshBindGroupFormat:u}}static processVaryings(t,n,r){let i=``,a=r?`out`:`in`;return t.forEach((t,o)=>{let s=e.splitToWords(t),c=s.slice(0,-1).join(` `),l=s[s.length-1];r?n.set(l,o):o=n.get(l),i+=`layout(location = ${o}) ${a} ${c} ${l};
`}),i}static processOuts(e){let t=``;return e.forEach((e,n)=>{t+=`layout(location = ${n}) out ${e};
`}),t}static getTypeCount(e){let t=e.substring(e.length-1),n=parseInt(t,10);return isNaN(n)?1:n}static processAttributes(t,n,r,i){let a=``,o={};return t.forEach(t=>{let s=e.splitToWords(t),c=s[0],l=s[1];if(n.hasOwnProperty(l)){let t=n[l],s=z[t];o[s]=t,r.set(s,l);let u,d=i.getVertexElement(t);if(d){let t=d.dataType;if(t!==P&&t!==Qt&&!d.normalize&&!d.asInt){let n=e.getTypeCount(c),r=`_private_${l}`;u=`vec${n} ${l} = vec${n}(${r});
`,l=r;let i=t===Xt||t===Zt||t===M;c=n===1?i?`int`:`uint`:i?`ivec${n}`:`uvec${n}`}}a+=`layout(location = ${s}) in ${c} ${l};
`,u&&(a+=u)}}),a}static splitToWords(e){return e=e.replace(/\s+/g,` `).trim(),e.split(` `)}static cutOut(e,t,n,r){return e.substring(0,t)+r+e.substring(n)}static getUniformShaderDeclaration(e,t,n){let r=`layout(set = ${t}, binding = ${n}, std140) uniform ub_${Bn[t]} {
`;return e.uniforms.forEach(e=>{let t=Pn[e.type];r+=`    ${t} ${e.shortName}${e.count?`[${e.count}]`:``};
`}),`${r}};
`}static getTexturesShaderDeclaration(e,t){let n=``;return e.textureFormats.forEach(e=>{let r=wr[e.textureDimension],i=r===`texture2DArray`,a=e.sampleType===j?`u`:e.sampleType===A?`i`:``;r=`${a}${r}`;let o=``,s=``;i&&(o=`_texture`,s=`#define ${e.name} ${a}sampler2DArray(${e.name}${o}, ${e.name}_sampler)
`),n+=`layout(set = ${t}, binding = ${e.slot}) uniform ${r} ${e.name}${o};
`,e.hasSampler&&(n+=`layout(set = ${t}, binding = ${e.slot+1}) uniform sampler ${e.name}_sampler;
`),n+=s}),n}};n(Tr,`MARKER`,`@@@`);var Er=Tr,Dr=`

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
`,Or=`

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
`,kr=`

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
`,Ar=`

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
`,jr=`
`,Mr=`
#define VERTEXSHADER
`,Nr=`

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
`,Pr=`

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
`,Fr=`
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
`,Ir={vertex_position:b,vertex_normal:x,vertex_tangent:yt,vertex_texCoord0:Ct,vertex_texCoord1:wt,vertex_texCoord2:Tt,vertex_texCoord3:Et,vertex_texCoord4:Dt,vertex_texCoord5:Ot,vertex_texCoord6:kt,vertex_texCoord7:At,vertex_color:St,vertex_boneIndices:xt,vertex_boneWeights:bt},Lr=class e{static createDefinition(t,n){let r=e=>{let t=e.fragmentOutputTypes??`vec4`;return Array.isArray(t)||(t=[t]),t},i=(e,n,i,a)=>{let o=t.isWebGPU?e:n,s=``;if(!i){a.useDualSourceBlending&&(s+=`#define DUAL_SOURCE_BLENDING
`);let e=r(a);for(let n=0;n<t.maxColorAttachments;n++){s+=`#define COLOR_ATTACHMENT_${n}
`;let t=e[n]??`vec4`;s+=`#define outType_${n} ${t}
`}}return s+o},a=(n,i)=>{let a=e.getWGSLEnables(t,n?`vertex`:`fragment`,!n&&i.useDualSourceBlending);if(!n){let e=r(i);for(let n=0;n<t.maxColorAttachments;n++){let t=e[n]??`vec4`,r=Hn.get(t);a+=`alias pcOutType${n} = ${r};
`}}return a},o=n.name??`Untitled`,s,c,l=e.getDefinesCode(t,n.vertexDefines),u=e.getDefinesCode(t,n.fragmentDefines);return n.shaderLanguage===Yt?(s=`
                ${a(!0,n)}
                ${l}
                ${Fr}
                ${Mr}
                ${Pr}
                ${n.vertexCode}
            `,c=`
                ${a(!1,n)}
                ${u}
                ${Fr}
                ${jr}
                ${Pr}
                ${n.fragmentCode}
            `):(s=`${e.versionCode(t)+i(Ar,Or,!0,n)+l+e.precisionCode(t)}
                ${Nr}
                ${e.getShaderNameCode(o)}
                ${n.vertexCode}`,c=`${(n.fragmentPreamble||``)+e.versionCode(t)+i(kr,Dr,!1,n)+u+e.precisionCode(t)}
                ${Nr}
                ${e.getShaderNameCode(o)}
                ${n.fragmentCode}`),{name:o,shaderLanguage:n.shaderLanguage??Jt,attributes:n.attributes,vshader:s,vincludes:n.vertexIncludes,fincludes:n.fragmentIncludes,fshader:c,feedbackVaryings:n.feedbackVaryings,feedbackVaryingsMode:n.feedbackVaryingsMode,useTransformFeedback:n.useTransformFeedback,meshUniformBufferFormat:n.meshUniformBufferFormat,meshBindGroupFormat:n.meshBindGroupFormat,useDualSourceBlending:!!n.useDualSourceBlending}}static getWGSLEnables(e,t,n=!1){let r=``;return e.supportsShaderF16&&(r+=`enable f16;
`),t===`fragment`&&e.supportsPrimitiveIndex&&(r+=`enable primitive_index;
`),t===`fragment`&&n&&(r+=`enable dual_source_blending;
`),e.supportsSubgroups&&(r+=`enable subgroups;
`),e.supportsSubgroupId&&(r+=`requires subgroup_id;
`),t===`compute`&&e.supportsLinearIndexing&&(r+=`requires linear_indexing;
`),e.supportsUnrestrictedPointerParameters&&(r+=`requires unrestricted_pointer_parameters;
`),e.supportsPointerCompositeAccess&&(r+=`requires pointer_composite_access;
`),e.supportsPacked4x8IntegerDotProduct&&(r+=`requires packed_4x8_integer_dot_product;
`),e.supportsTextureAndSamplerLet&&(r+=`requires texture_and_sampler_let;
`),r}static getDefinesCode(e,t){let n=``;return e.capsDefines.forEach((e,t)=>{n+=`#define ${t} ${e}
`}),n+=`
`,t?.forEach((e,t)=>{n+=`#define ${t} ${e}
`}),n+=`
`,n}static getShaderNameCode(e){return`#define SHADER_NAME ${e}
`}static versionCode(e){return e.isWebGPU?`#version 450
`:`#version 300 es
`}static precisionCode(e,t){t&&t!==`highp`&&t!==`mediump`&&t!==`lowp`&&(t=null),t&&(t===`highp`&&e.maxPrecision!==`highp`&&(t=`mediump`),t===`mediump`&&e.maxPrecision===`lowp`&&(t=`lowp`));let n=t||e.precision;return`
            precision ${n} float;
            precision ${n} int;
            precision ${n} usampler2D;
            precision ${n} isampler2D;
            precision ${n} sampler2DShadow;
            precision ${n} samplerCubeShadow;
            precision ${n} sampler2DArray;
        `}static collectAttributes(e){let t={},n=0,r=e.indexOf(`attribute`);for(;r>=0&&!(r>0&&e[r-1]===`/`);){let i=!1;if(r>0){let t=e.lastIndexOf(`
`,r);t=t===-1?0:t+1,e.substring(t,r).includes(`#`)&&(i=!0)}if(!i){let i=e.indexOf(`;`,r),a=e.lastIndexOf(` `,i),o=e.substring(a+1,i);if(!t[o]){let e=Ir[o];e===void 0?(t[o]=`ATTR${n}`,n++):t[o]=e}}r=e.indexOf(`attribute`,r+1)}return t}};export{ee as Preprocessor,Lr as ShaderDefinitionUtils,Er as ShaderProcessorGLSL,$ as UniformLine,vr as WebgpuShaderProcessorWGSL};