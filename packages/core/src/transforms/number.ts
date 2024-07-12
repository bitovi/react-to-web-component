import { Transform } from "./index"

const number: Transform<number> = {
  stringify: (value) => `${value}`,
  parse: (value) => parseFloat(value),
}

export default number
