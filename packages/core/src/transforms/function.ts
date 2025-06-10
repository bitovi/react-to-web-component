import { Transform } from "./index"

const function_: Transform<(...args: unknown[]) => unknown> = {
  stringify: (value) => value.name,
  parse: (value, attribute, element) => {
    const fn = (() => {
      if (typeof window !== "undefined" && value in window) {
        // @ts-expect-error
        return window[value]
      }

      if (typeof global !== "undefined" && value in global) {
        // @ts-expect-error
        return global[value]
      }
    })()

    return typeof fn === "function" ? fn.bind(element) : undefined
  },
}

export default function_
