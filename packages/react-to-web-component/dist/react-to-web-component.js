import n from "react";
import { createRoot as u } from "react-dom/client";
import c from "@r2wc/core";
import { useImperativeMethods as E } from "@r2wc/core";
function f(e, t, o) {
  const r = u(e), m = n.createElement(t, o);
  return r.render(m), {
    root: r,
    ReactComponent: t
  };
}
function i({ root: e, ReactComponent: t }, o) {
  const r = n.createElement(t, o);
  e.render(r);
}
function a({ root: e }) {
  e.unmount();
}
function l(e, t = {}) {
  return c(e, t, { mount: f, update: i, unmount: a });
}
export {
  l as default,
  E as useImperativeMethods
};
