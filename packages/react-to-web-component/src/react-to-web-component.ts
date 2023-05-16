import type { R2WCOptions } from "@r2wc/core"
import type { Root } from "react-dom/client"

import React from "react"
import { createRoot } from "react-dom/client"

import r2wcCore from "@r2wc/core"

interface Context<Props extends object> {
  root: Root
  ReactComponent: React.ComponentType<Props>
}

function mount<Props extends object>(
  container: HTMLElement,
  ReactComponent: React.ComponentType<Props>,
  props: Props,
): Context<Props> {
  const root = createRoot(container)

  const element = React.createElement(ReactComponent, props)
  root.render(element)

  return {
    root,
    ReactComponent,
  }
}

function update<Props extends object>(
  { root, ReactComponent }: Context<Props>,
  props: Props,
): void {
  const element = React.createElement(ReactComponent, props)
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
