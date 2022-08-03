const l = Symbol.for("r2wc.reactRender"), h = Symbol.for("r2wc.shouldRender"), f = Symbol.for("r2wc.root");
function y(r = "") {
  return r.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}
function m(r = "") {
  return r.replace(/-([a-z0-9])/g, function(u) {
    return u[1].toUpperCase();
  });
}
var w = {
  expando: function(r, u, n) {
    Object.defineProperty(r, u, {
      enumerable: !0,
      get: function() {
        return n;
      },
      set: function(s) {
        n = s, this[l]();
      }
    }), r[l]();
  }
};
function S(r, u, n, s = {}) {
  var d = {
    isConnected: "isConnected" in HTMLElement.prototype
  }, p = !1, c = function() {
    var e = Reflect.construct(HTMLElement, arguments, this.constructor);
    return typeof s.shadow == "string" ? e.attachShadow({ mode: s.shadow }) : s.shadow && (console.warn(
      'Specifying the "shadow" option as a boolean is deprecated and will be removed in a future version.'
    ), e.attachShadow({ mode: "open" })), e;
  }, a = Object.create(HTMLElement.prototype);
  a.constructor = c;
  var b = new Proxy(a, {
    has: function(e, t) {
      return t in r.propTypes || t in a;
    },
    set: function(e, t, o, i) {
      return p && (d[t] = !0), typeof t == "symbol" || d[t] || t in e ? Reflect.set(e, t, o, i) : (w.expando(i, t, o), !0);
    },
    getOwnPropertyDescriptor: function(e, t) {
      var o = Reflect.getOwnPropertyDescriptor(e, t);
      if (o)
        return o;
      if (t in r.propTypes)
        return {
          configurable: !0,
          enumerable: !0,
          writable: !0,
          value: void 0
        };
    }
  });
  return c.prototype = b, a.connectedCallback = function() {
    this[h] = !0, this[l]();
  }, a.disconnectedCallback = function() {
    typeof n.createRoot == "function" ? this[f].unmount() : n.unmountComponentAtNode(this);
  }, a[l] = function() {
    if (this[h] === !0) {
      var e = {};
      Object.keys(this).forEach(function(i) {
        d[i] !== !1 && (e[i] = this[i]);
      }, this), p = !0;
      const t = s.shadow ? this.shadowRoot : this, o = u.createElement(r, e);
      typeof n.createRoot == "function" ? (this[f] || (this[f] = n.createRoot(t)), this[f].render(o)) : n.render(o, t), p = !1;
    }
  }, r.propTypes && (c.observedAttributes = s.dashStyleAttributes ? Object.keys(r.propTypes).map(function(e) {
    return y(e);
  }) : Object.keys(r.propTypes), a.attributeChangedCallback = function(e, t, o) {
    var i = s.dashStyleAttributes ? m(e) : e;
    this[i] = o;
  }), c;
}
export {
  S as default
};
