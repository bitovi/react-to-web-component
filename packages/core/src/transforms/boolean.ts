import type { Transform } from "./index"

const string: Transform<boolean> = {
  stringify: (value) => (value ? "true" : "false"),
  parse: (value) => /^[ty1-9]/i.test(value),
}

export default string
