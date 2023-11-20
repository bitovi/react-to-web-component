"use strict";var C=Object.defineProperty;var M=(t,e,s)=>e in t?C(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var b=(t,e,s)=>(M(t,typeof e!="symbol"?e+"":e,s),s);Object.defineProperties(exports,{__esModule:{value:!0},[Symbol.toStringTag]:{value:"Module"}});const T={stringify:t=>t,parse:t=>t},P={stringify:t=>`${t}`,parse:t=>parseFloat(t)},V={stringify:t=>t?"true":"false",parse:t=>/^[ty1-9]/i.test(t)},_={stringify:t=>t.name,parse:(t,e,s)=>{const o=(()=>{if(typeof window<"u"&&t in window)return window[t];if(typeof global<"u"&&t in global)return global[t]})();return typeof o=="function"?o.bind(s):void 0}},x={stringify:t=>JSON.stringify(t),parse:t=>JSON.parse(t)},A={string:T,number:P,boolean:V,function:_,json:x};function N(t){return t.replace(/([a-z0-9])([A-Z])/g,(e,s,o)=>`${s}-${o.toLowerCase()}`)}const d=Symbol.for("r2wc.render"),g=Symbol.for("r2wc.connected"),l=Symbol.for("r2wc.context"),p=Symbol.for("r2wc.props");function $(t,e,s){var O,j,k;e.props||(e.props=t.propTypes?Object.keys(t.propTypes):[]);const o=Array.isArray(e.props)?e.props.slice():Object.keys(e.props),h={},m={},w={};for(const r of o){h[r]=Array.isArray(e.props)?"string":e.props[r];const u=N(r);m[r]=u,w[u]=r}class S extends HTMLElement{constructor(){super();b(this,O,!0);b(this,j);b(this,k,{});b(this,"container");e.shadow?this.container=this.attachShadow({mode:e.shadow}):this.container=this,this[p].container=this.container;for(const i of o){const f=m[i],n=this.getAttribute(f),c=h[i],a=c?A[c]:null;a!=null&&a.parse&&n&&(this[p][i]=a.parse(n,f,this))}}static get observedAttributes(){return Object.keys(w)}connectedCallback(){this[g]=!0,this[d]()}disconnectedCallback(){this[g]=!1,this[l]&&s.unmount(this[l]),delete this[l]}attributeChangedCallback(i,f,n){const c=w[i],a=h[c],y=a?A[a]:null;c in h&&(y!=null&&y.parse)&&n&&(this[p][c]=y.parse(n,i,this),this[d]())}[(O=g,j=l,k=p,d)](){this[g]&&(this[l]?s.update(this[l],this[p]):this[l]=s.mount(this.container,t,this[p]))}}for(const r of o){const u=m[r],i=h[r];Object.defineProperty(S.prototype,r,{enumerable:!0,configurable:!0,get(){return this[p][r]},set(f){this[p][r]=f;const n=i?A[i]:null;if(n!=null&&n.stringify){const c=n.stringify(f,u,this);this.getAttribute(u)!==c&&this.setAttribute(u,c)}else this[d]()}})}return S}function v(t,e){const s="host"in t?t.host:t;for(const o in e)s[o]=e[o]}exports.default=$;exports.useImperativeMethods=v;
