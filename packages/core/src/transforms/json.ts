import { Transform } from "./index"

const json: Transform<string> = {
  stringify: (value) => JSON.stringify(value),
  parse: (value) => JSON.parse(value),
}

export default json
