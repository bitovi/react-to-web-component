import type { R2WCOptions } from "@r2wc/core"

import React from "react"
import ReactDOM from "react-dom"

import r2wcCore from "@r2wc/core"

interface Context<Props extends object> {
  container: HTMLElement
  ReactComponent: React.ComponentType<Props>
}

function mount<Props extends object>(
  container: HTMLElement,
  ReactComponent: React.ComponentType<Props>,
  props: Props,
): Context<Props> {
  const element = React.createElement(ReactComponent, props)

  ReactDOM.render(element, container)

  return {
    container,
    ReactComponent,
  }
}

function update<Props extends object>(
  { container, ReactComponent }: Context<Props>,
  props: Props,
): void {
  const element = React.createElement(ReactComponent, props)

  ReactDOM.render(element, container)
}

function unmount<Props extends object>({ container }: Context<Props>): void {
  ReactDOM.unmountComponentAtNode(container)
}

export default function r2wc<Props extends object>(
  ReactComponent: React.ComponentType<Props>,
  options: R2WCOptions<Props> = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, options, { mount, update, unmount })
}
