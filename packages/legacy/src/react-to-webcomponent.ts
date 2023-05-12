import type {
  ComponentClass,
  Container,
  FC,
  R2WCOptions,
  ReactElement,
  ReactNode,
  RefObject,
} from "@r2wc/core"
import r2wc from "@r2wc/core"

/* eslint-disable @typescript-eslint/no-explicit-any */
const rootSymbol = Symbol.for("r2wc.root")

interface ReactDOMType {
  createRoot?: (container: Element | DocumentFragment, options?: any) => unknown
  unmountComponentAtNode?: (container: Element | DocumentFragment) => boolean
  render?: (
    element: ReactElement<any, any> | null | any,
    container: Container | null,
  ) => unknown
}

interface ReactType {
  createRef: () => RefObject<unknown>
  createElement: (
    type: string | FC<any> | ComponentClass<any>,
    data: any,
    children?: any,
  ) => ReactElement<any, any> | null | any
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
export default function (
  ReactComponent: FC<any> | ComponentClass<any>,
  React: ReactType,
  ReactDOM: ReactDOMType,
  options: R2WCOptions = {},
): CustomElementConstructor {
  const isReact18 =
    ReactDOM.createRoot && typeof ReactDOM.createRoot === "function"
  function unmount(this: any, _container: HTMLElement) {
    if (isReact18) {
      this[rootSymbol].unmount()
    } else if (ReactDOM.unmountComponentAtNode) {
      ReactDOM.unmountComponentAtNode(this)
    }
  }

  function mount(this: any, container: HTMLElement, element: ReactNode) {
    if (isReact18) {
      if (!this[rootSymbol]) {
        this[rootSymbol] = ReactDOM.createRoot?.(container)
      }

      this[rootSymbol].render(element)
    } else if (ReactDOM.render) {
      ReactDOM.render(element, container)
    }
  }

  return r2wc(ReactComponent, options, { mount, unmount })
}