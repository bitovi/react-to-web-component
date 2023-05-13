import type { Transform } from "./index"

const string: Transform<number> = {
  stringify: (value) => `${value}`,
  parse: (value) => parseFloat(value),
}

export default string
