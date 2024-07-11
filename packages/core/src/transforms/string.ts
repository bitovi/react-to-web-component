import { Transform } from "./index"

const string: Transform<string> = {
  stringify: (value) => value,
  parse: (value) => value,
}

export default string
