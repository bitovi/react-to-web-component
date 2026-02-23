import boolean from "./boolean"
import function_ from "./function"
import json from "./json"
import method_ from "./method"
import number from "./number"
import string from "./string"

export type R2WCElement = HTMLElement & {
  container: R2WCElement
}

export interface Transform<Type> {
  stringify?: (value: Type, attribute: string, element: R2WCElement) => string
  parse: (
    value: string,
    attribute: string,
    element: R2WCElement,
  ) => Type | undefined
}

const transforms = {
  string,
  number,
  boolean,
  function: function_,
  method: method_,
  json,
}

export type R2WCType = keyof typeof transforms

export default transforms
