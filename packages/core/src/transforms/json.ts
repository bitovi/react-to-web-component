import { Transform } from "./index"

const json: Transform<string> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => {
    try {
      return JSON.parse(value)
    } catch {
      // An unparseable attribute value should not keep the previous
      // parsed value alive: returning undefined resets the prop. (#230)
      return undefined
    }
  },
}

export default json
