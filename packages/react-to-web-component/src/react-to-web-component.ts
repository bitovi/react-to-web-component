import React from "react"
import { Root, createRoot } from "react-dom/client"

import r2wcCore, { R2WCOptions } from "@r2wc/core"

interface Context<Props extends object> {
  root: Root
  ReactComponent: React.ComponentType<Props>
}

function mount<Props extends object>(
  container: HTMLElement,
  ReactComponent: React.ComponentType<Props>,
  props: Props,
  strictMode: boolean
): Context<Props> {
  const root = createRoot(container)

  let element: React.ReactElement = React.createElement(ReactComponent, props)
  if (strictMode) {
    element = React.createElement(React.StrictMode, null, element)
  }
  root.render(element)

  return {
    root,
    ReactComponent,
  }
}

function update<Props extends object>(
  { root, ReactComponent }: Context<Props>,
  props: Props,
  strictMode: boolean
): void {
  let element: React.ReactElement = React.createElement(ReactComponent, props)
  if (strictMode) {
    element = React.createElement(React.StrictMode, null, element)
  }
  root.render(element)
}

function unmount<Props extends object>({ root }: Context<Props>): void {
  root.unmount()
}

export default function r2wc<Props extends object>(
  ReactComponent: React.ComponentType<Props>,
  options: R2WCOptions<Props> = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, options, { mount, update, unmount })
}
