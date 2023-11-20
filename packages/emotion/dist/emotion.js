import { jsx as e } from "react/jsx-runtime";
import c from "@emotion/cache";
import { CacheProvider as h } from "@emotion/react";
import { useMemo as n } from "react";
function C(o, t = "rtwc") {
  return ({
    container: r,
    ...i
  }) => {
    const m = n(() => c({ key: t, container: r }), [r]);
    return /* @__PURE__ */ e(h, { value: m, children: /* @__PURE__ */ e(
      o,
      {
        ...i,
        container: r
      }
    ) });
  };
}
export {
  C as withCacheProvider
};
