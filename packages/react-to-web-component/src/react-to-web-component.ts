import type { R2WCBaseProps, R2WCOptions } from "@r2wc/core"
import type { Root } from "react-dom/client"

import React from "react"
import { createRoot } from "react-dom/client"

import r2wcCore from "@r2wc/core"

export { useImperativeMethods } from "@r2wc/core"

interface Context<Props extends R2WCBaseProps> {
  root: Root
  ReactComponent: React.ComponentType<Props>
}

function mount<Props extends R2WCBaseProps>(
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

function update<Props extends R2WCBaseProps>(
  { root, ReactComponent }: Context<Props>,
  props: Props,
): void {
  const element = React.createElement(ReactComponent, props)
  root.render(element)
}

function unmount<Props extends R2WCBaseProps>({ root }: Context<Props>): void {
  root.unmount()
}

export default function r2wc<Props extends object>(
  ReactComponent: React.ComponentType<Props>,
  options: R2WCOptions<Props> = {},
): CustomElementConstructor {
  //@ts-ignore core uses R2WCBaseProps, but we don't want to impose that on all components
  return r2wcCore(ReactComponent, options, { mount, update, unmount })
}
