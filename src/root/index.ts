/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, ComponentType } from "react18"
import ReactDOM from "react-dom18/client"

import r2wc from "../core"

const rootSymbol = Symbol.for("r2wc.root")

function mount(this: any, container: HTMLElement, element: ReactNode) {
  if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
    if (!this[rootSymbol]) {
      this[rootSymbol] = ReactDOM.createRoot(container)
    }
    this[rootSymbol].render(element)
  }
}

function unmount(this: any, container: HTMLElement) {
  if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
    this[rootSymbol].unmount()
  }
}

export default function reactToWebComponentRoot(
  ReactComponent: ComponentType<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wc(ReactComponent, config, { mount, unmount })
}
