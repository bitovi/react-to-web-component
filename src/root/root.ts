/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react"
import * as ReactDOM from "react-dom/client"

import r2wc from "../core"
import { ComponentClass, FC, R2WCOptions } from "../types"

const rootSymbol = Symbol.for("r2wc.root")

function mount(this: any, container: HTMLElement, element: ReactNode) {
  if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
    if (!this[rootSymbol]) {
      this[rootSymbol] = ReactDOM.createRoot(container)
    }
    this[rootSymbol].render(element)
  }
}

function unmount(this: any, _container: HTMLElement) {
  if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
    this[rootSymbol].unmount()
  }
}

export default function reactToWebComponentRoot(
  ReactComponent: FC<any> | ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wc(ReactComponent, config, { mount, unmount })
}
