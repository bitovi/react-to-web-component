var C = Object.defineProperty;
var x = (t, e, s) => e in t ? C(t, e, { enumerable: !0, configurable: !0, writable: !0, value: s }) : t[e] = s;
var b = (t, e, s) => x(t, typeof e != "symbol" ? e + "" : e, s);
const T = {
  stringify: (t) => t ? "true" : "false",
  parse: (t) => /^[ty1-9]/i.test(t)
}, V = {
  stringify: (t) => t.name,
  parse: (t, e, s) => {
    const o = (() => {
      if (typeof window < "u" && t in window)
        return window[t];
      if (typeof global < "u" && t in global)
        return global[t];
    })();
    return typeof o == "function" ? o.bind(s) : void 0;
  }
}, N = {
  stringify: (t) => JSON.stringify(t),
  parse: (t) => JSON.parse(t)
}, P = {
  stringify: (t) => `${t}`,
  parse: (t) => parseFloat(t)
}, $ = {
  stringify: (t) => t,
  parse: (t) => t
}, A = {
  string: $,
  number: P,
  boolean: T,
  function: V,
  json: N
};
function J(t) {
  return t.replace(
    /([a-z0-9])([A-Z])/g,
    (e, s, o) => `${s}-${o.toLowerCase()}`
  );
}
const d = Symbol.for("r2wc.render"), g = Symbol.for("r2wc.connected"), f = Symbol.for("r2wc.context"), p = Symbol.for("r2wc.props");
function M(t, e, s) {
  var k, O, j;
  e.props || (e.props = t.propTypes ? Object.keys(t.propTypes) : []);
  const o = Array.isArray(e.props) ? e.props.slice() : Object.keys(e.props), h = {}, m = {}, w = {};
  for (const r of o) {
    h[r] = Array.isArray(e.props) ? "string" : e.props[r];
    const u = J(r);
    m[r] = u, w[u] = r;
  }
  class S extends HTMLElement {
    constructor() {
      super();
      b(this, j, !0);
      b(this, O);
      b(this, k, {});
      b(this, "container");
      e.shadow ? this.container = this.attachShadow({
        mode: e.shadow
      }) : this.container = this, this[p].container = this.container;
      for (const i of o) {
        const l = m[i], n = this.getAttribute(l), c = h[i], a = c ? A[c] : null;
        a != null && a.parse && n && (this[p][i] = a.parse(n, l, this));
      }
    }
    static get observedAttributes() {
      return Object.keys(w);
    }
    connectedCallback() {
      this[g] = !0, this[d]();
    }
    disconnectedCallback() {
      this[g] = !1, this[f] && s.unmount(this[f]), delete this[f];
    }
    attributeChangedCallback(i, l, n) {
      const c = w[i], a = h[c], y = a ? A[a] : null;
      c in h && (y != null && y.parse) && n && (this[p][c] = y.parse(n, i, this), this[d]());
    }
    [(j = g, O = f, k = p, d)]() {
      this[g] && (this[f] ? s.update(this[f], this[p]) : this[f] = s.mount(
        this.container,
        t,
        this[p]
      ));
    }
  }
  for (const r of o) {
    const u = m[r], i = h[r];
    Object.defineProperty(S.prototype, r, {
      enumerable: !0,
      configurable: !0,
      get() {
        return this[p][r];
      },
      set(l) {
        this[p][r] = l;
        const n = i ? A[i] : null;
        if (n != null && n.stringify) {
          const c = n.stringify(l, u, this);
          this.getAttribute(u) !== c && this.setAttribute(u, c);
        } else
          this[d]();
      }
    });
  }
  return S;
}
function _(t, e) {
  const s = "host" in t ? t.host : t;
  for (const o in e)
    s[o] = e[o];
}
export {
  M as default,
  _ as useImperativeMethods
};
