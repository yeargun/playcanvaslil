/*! PlayCanvas core/math BitPacking | PlayCanvas Ltd. | MIT */
const r={set(r,t,e,n=1){return r&~(n<<e)|t<<e},get(r,t,e=1){return r>>t&e},all(r,t,e=1){const n=e<<t;return(r&n)===n},any(r,t,e=1){return 0!==(r&e<<t)}};export{r as BitPacking};
