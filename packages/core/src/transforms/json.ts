import type { Transform } from "./index"

const string: Transform<string> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => JSON.parse(value),
}

export default string
