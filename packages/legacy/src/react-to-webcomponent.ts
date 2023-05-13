import type { R2WCOptions } from "@r2wc/core"

import r2wcCore from "@r2wc/core"

interface ReactType {
  createElement: (
    type: any,
    data: any,
    children?: any,
  ) => React.ReactElement | null
}

interface ReactDOMRootRootType {
  render: (element: React.ReactElement | null) => void
  unmount: () => void
}

interface ReactDOMRootType {
  createRoot: (
    container: Element | DocumentFragment,
    options?: any,
  ) => ReactDOMRootRootType
}

interface ReactDOMRenderType {
  unmountComponentAtNode: (container: Element | DocumentFragment) => boolean
  render: (
    element: React.ReactElement | null,
    container: ReactDOM.Container | null,
  ) => unknown
}

interface Context<Props> {
  container: HTMLElement
  root?: ReactDOMRootRootType
  ReactComponent: React.ComponentType<Props>
}

/**
 * Converts a React component into a webcomponent by wrapping it in a Proxy object.
 * @param {ReactComponent}
 * @param {React}
 * @param {ReactDOM}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function r2wc<Props>(
  ReactComponent: React.ComponentType<Props>,
  React: ReactType,
  ReactDOM: ReactDOMRootType | ReactDOMRenderType,
  options: R2WCOptions<Props> = {},
): CustomElementConstructor {
  function mount(
    container: HTMLElement,
    ReactComponent: React.ComponentType<Props>,
    props: Props,
  ): Context<Props> {
    const element = React.createElement(ReactComponent, props)

    if ("createRoot" in ReactDOM) {
      const root = ReactDOM.createRoot(container)
      root.render(element)

      return {
        container,
        root,
        ReactComponent,
      }
    }

    if ("render" in ReactDOM) {
      ReactDOM.render(element, container)

      return {
        container,
        ReactComponent,
      }
    }

    throw new Error("Invalid ReactDOM instance provided.")
  }

  function update(
    { container, root, ReactComponent }: Context<Props>,
    props: Props,
  ): void {
    const element = React.createElement(ReactComponent, props)

    if (root) {
      root.render(element)
      return
    }

    if ("render" in ReactDOM) {
      ReactDOM.render(element, container)
      return
    }
  }

  function unmount({ container, root }: Context<Props>): void {
    if (root) {
      root.unmount()
      return
    }

    if ("unmountComponentAtNode" in ReactDOM) {
      ReactDOM.unmountComponentAtNode(container)
      return
    }
  }

  return r2wcCore(ReactComponent, options, { mount, unmount, update })
}
