import c from "@r2wc/core";
function w(m, i, e, d = {}) {
  function f(r, n, u) {
    const o = i.createElement(n, u);
    if ("createRoot" in e) {
      const t = e.createRoot(r);
      return t.render(o), {
        container: r,
        root: t,
        ReactComponent: n
      };
    }
    if ("render" in e)
      return e.render(o, r), {
        container: r,
        ReactComponent: n
      };
    throw new Error("Invalid ReactDOM instance provided.");
  }
  function p({ container: r, root: n, ReactComponent: u }, o) {
    const t = i.createElement(u, o);
    if (n) {
      n.render(t);
      return;
    }
    if ("render" in e) {
      e.render(t, r);
      return;
    }
  }
  function l({ container: r, root: n }) {
    if (n) {
      n.unmount();
      return;
    }
    if ("unmountComponentAtNode" in e) {
      e.unmountComponentAtNode(r);
      return;
    }
  }
  return c(m, d, { mount: f, unmount: l, update: p });
}
export {
  w as default
};
