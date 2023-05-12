import type { R2WCOptions } from "@r2wc/core"

import React from "react"
import ReactDOM from "react-dom"

import r2wcCore from "@r2wc/core"

interface Context<Props extends React.Attributes> {
  container: HTMLElement
  ReactComponent: React.ComponentType<Props>
}

function mount<Props extends React.Attributes>(
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

function update<Props extends React.Attributes>(
  { container, ReactComponent }: Context<Props>,
  props: Props,
): void {
  const element = React.createElement(ReactComponent, props)

  ReactDOM.render(element, container)
}

function unmount<Props extends React.Attributes>(
  { container }: Context<Props>,
  props: Props,
): void {
  ReactDOM.unmountComponentAtNode(container)
}

export default function r2wc(
  ReactComponent: React.FC<any> | React.ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, config, { mount, unmount, update })
}
