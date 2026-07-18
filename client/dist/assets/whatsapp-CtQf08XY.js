import{c as o}from"./index-BNvDcs7o.js";/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const c=[["path",{d:"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0",key:"1r0f0z"}],["circle",{cx:"12",cy:"10",r:"3",key:"ilqhr7"}]],y=o("map-pin",c);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const i=[["path",{d:"M7.9 20A9 9 0 1 0 4 16.1L2 22Z",key:"vv11sd"}]],s=o("message-circle",i);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const d=[["path",{d:"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384",key:"9njp5v"}]],u=o("phone",d);/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=[["path",{d:"M19.07 4.93A10 10 0 0 0 6.99 3.34",key:"z3du51"}],["path",{d:"M4 6h.01",key:"oypzma"}],["path",{d:"M2.29 9.62A10 10 0 1 0 21.31 8.35",key:"qzzz0"}],["path",{d:"M16.24 7.76A6 6 0 1 0 8.23 16.67",key:"1yjesh"}],["path",{d:"M12 18h.01",key:"mhygvu"}],["path",{d:"M17.99 11.66A6 6 0 0 1 15.77 16.67",key:"1u2y91"}],["circle",{cx:"12",cy:"12",r:"2",key:"1c9p78"}],["path",{d:"m13.41 10.59 5.66-5.66",key:"mhq4k0"}]],f=o("radar",h);function g(e){return e>=80?"from-emerald-300 to-teal-400":e>=50?"from-amber-300 to-orange-400":"from-slate-300 to-slate-400"}function k(e){return e?"Website Found":"No Website"}function M(e){if(!e)return"";const t=String(e).replace(/\D/g,"");return t?`+${t}`:String(e)}function p(e){return String(e||"").replace(/\D/g,"")}function l(e){var a;return`Hello ${((a=e==null?void 0:e.name)==null?void 0:a.trim())||"there"}, hope you're doing well. I noticed your business online and wanted to share a few quick website ideas that could help you attract more customers. Would you like me to send them over?`}function A(e){var r;const t=p(e==null?void 0:e.contactPhone);if(!t)return"";const a=((r=e==null?void 0:e.pitchMessage)==null?void 0:r.trim())||l(e),n=new URLSearchParams({text:a});return`https://wa.me/${t}?${n.toString()}`}export{y as M,u as P,f as R,s as a,A as b,M as d,g as s,k as w};
