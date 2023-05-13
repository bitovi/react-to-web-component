import type { Context, R2WCOptions } from "@r2wc/core"

import ReactDOM from "react-dom"
import type { ComponentType } from "react"
import React from "react"

import r2wcCore from "@r2wc/core"

function mount<Props extends React.Attributes>(
  container: HTMLElement,
  ReactComponent: ComponentType<Props>,
  props: Props,
): Context<ComponentType<Props>> {
  const element = React.createElement(ReactComponent, props)

  ReactDOM.render(element, container)

  return {
    reactContainer: container,
    component: ReactComponent,
  }
}

function update<Props extends React.Attributes>(
  { reactContainer, component }: Context<ComponentType<Props>>,
  props: Props,
): void {
  const element = React.createElement(component, props)

  ReactDOM.render(element, reactContainer)
}

function unmount<Props extends React.Attributes>({
  reactContainer,
}: Context<ComponentType<Props>>): void {
  ReactDOM.unmountComponentAtNode(reactContainer)
}

export default function r2wc(
  ReactComponent: React.FC<any> | React.ComponentClass<any>,
  config: R2WCOptions = {},
): CustomElementConstructor {
  return r2wcCore(ReactComponent, config, { mount, unmount, update })
}
