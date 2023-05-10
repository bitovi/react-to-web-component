import type { R2WCOptions } from "@r2wc/core"

import ReactDOM from "react-dom"

import r2wcCore from "@r2wc/core"

function mount(container: HTMLElement, element: JSX.Element) {
  ReactDOM.render(element, container)
}

function unmount(container: HTMLElement) {
  ReactDOM.unmountComponentAtNode(container)
}

export default function r2wc(
  ReactComponent: React.FC<any> | React.ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, config, { mount, unmount })
}
