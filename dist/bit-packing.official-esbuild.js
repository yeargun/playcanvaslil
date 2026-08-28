/*! PlayCanvas core/math BitPacking | PlayCanvas Ltd. | MIT */
var c={set(n,r,t,e=1){return n&~(e<<t)|r<<t},get(n,r,t=1){return n>>r&t},all(n,r,t=1){let e=t<<r;return(n&e)===e},any(n,r,t=1){return(n&t<<r)!==0}};export{c as BitPacking};
