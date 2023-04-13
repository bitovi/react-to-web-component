/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import ReactDOM from "react-dom"

import r2wc from "../core"
import { ComponentClass, FC, R2WCOptions } from "../types"

function mount(
  container: HTMLElement,
  element: ReturnType<typeof React.createElement>,
) {
  ReactDOM.render(element, container)
}

function unmount(container: HTMLElement) {
  ReactDOM.unmountComponentAtNode(container)
}

export default function reactToWebComponentRender(
  ReactComponent: FC<any> | ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wc(ReactComponent, config, { mount, unmount })
}
