import type { R2WCOptions } from "@r2wc/core"

import { createRoot } from "react-dom/client"

import r2wcCore from "@r2wc/core"

function mount(container: HTMLElement, element: JSX.Element) {
  const root = createRoot(container)

  root.render(element)
}

function unmount(container: HTMLElement) {
  // root.unmount()
}

export default function r2wc(
  ReactComponent: React.FC<any> | React.ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, config, { mount, unmount })
}
