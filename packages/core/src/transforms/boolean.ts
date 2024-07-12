import { Transform } from "./index"

const boolean: Transform<boolean> = {
  stringify: (value) => (value ? "true" : "false"),
  parse: (value) => /^[ty1-9]/i.test(value),
}

export default boolean
