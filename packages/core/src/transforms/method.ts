import { toCamelCase } from "../utils"

import { Transform } from "./index"

const boundSymbol = Symbol.for("r2wc.bound")

const method_: Transform<(...args: unknown[]) => unknown> = {
  parse: (value, attribute, element) => {
    const functionName = toCamelCase(attribute)

    const r2wcElement = element as typeof element & {
      container: typeof r2wcElement
    } & {
      [k in typeof functionName]: (...args: unknown[]) => unknown
    }

    if (
      typeof r2wcElement !== "undefined" &&
      functionName in r2wcElement &&
      typeof r2wcElement[functionName] !== "undefined"
    ) {
      let fn = r2wcElement[functionName]
      if (!(boundSymbol in r2wcElement[functionName])) {
        fn = fn.bind(r2wcElement)
        Object.defineProperty(fn, boundSymbol, { value: true })
      }
      return fn
    } else {
      return undefined
    }
  },
}

export default method_
