"use strict";const p=require("@r2wc/core");function l(d,i,e,m={}){function f(r,n,u){const o=i.createElement(n,u);if("createRoot"in e){const t=e.createRoot(r);return t.render(o),{container:r,root:t,ReactComponent:n}}if("render"in e)return e.render(o,r),{container:r,ReactComponent:n};throw new Error("Invalid ReactDOM instance provided.")}function s({container:r,root:n,ReactComponent:u},o){const t=i.createElement(u,o);if(n){n.render(t);return}if("render"in e){e.render(t,r);return}}function c({container:r,root:n}){if(n){n.unmount();return}if("unmountComponentAtNode"in e){e.unmountComponentAtNode(r);return}}return p(d,m,{mount:f,unmount:c,update:s})}module.exports=l;