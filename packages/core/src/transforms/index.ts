import string from "./string"
import number from "./number"
import boolean from "./boolean"
import function_ from "./function"
import json from "./json"

export interface Transform<Type> {
  stringify?: (value: Type, attribute: string, element: HTMLElement) => string
  parse: (value: string, attribute: string, element: HTMLElement) => Type
}

const transforms = {
  string,
  number,
  boolean,
  function: function_,
  json,
}

export type R2WCType = keyof typeof transforms

export default transforms
