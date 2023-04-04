/* eslint-disable @typescript-eslint/no-explicit-any */
import React17, { ComponentType } from "react17"
import ReactDOM17 from "react-dom17"

import r2wc from "../core"

function mount(
  container: HTMLElement,
  element: ReturnType<typeof React17.createElement>,
) {
  ReactDOM17.render(element, container)
}

function unmount(container: HTMLElement) {
  ReactDOM17.unmountComponentAtNode(container)
}

export default function reactToWebComponentRender(
  ReactComponent: ComponentType<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wc(ReactComponent, config, { mount, unmount })
}
