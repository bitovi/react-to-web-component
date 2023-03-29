/* eslint-disable @typescript-eslint/no-explicit-any */
const renderSymbol = Symbol.for("r2wc.reactRender")
const shouldRenderSymbol = Symbol.for("r2wc.shouldRender")
const rootSymbol = Symbol.for("r2wc.root")

interface RefObject<T> {
    current: T | null;
}

interface ReactElement<P = any, T extends string | any = string | any> {
    type: T;
    props: P;
    key: string | number | null;
}

interface ReactPortal extends ReactElement {
    key: string | number | null;
    children: ReactNode;
}

type ReactFragment = Iterable<ReactNode>;
    type ReactNode = ReactElement | string | number | ReactFragment | ReactPortal | boolean | null | undefined;

interface FC<P> {
    (props: P & { children?: ReactNode }, context?: any): ReactElement<any, any> | null;
    propTypes?: any;
    contextTypes?: any;
    defaultProps?: Partial<P>;
    displayName?: string;
}

interface ReactDOM {
    createRoot?: (container: any, options?: any) => unknown
    unmountComponentAtNode?: (obj: Record<string, unknown>) => unknown
    render?: (
      element: ReactElement<any, any> | null,
      container: Record<string, unknown>,
    ) => unknown
  }

interface React {
    createRef: () => RefObject<unknown>
    createElement: (
      type: string | FC<any>,
      data: any,
      children?: any,
    ) => ReactElement<any, any> | null
    }

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}

function isAllCaps(word: string) {
  return word.split("").every((c: string) => c.toUpperCase() === c)
}

function flattenIfOne(arr: object) {
  if (!Array.isArray(arr)) {
    return arr
  }
  if (arr.length === 1) {
    return arr[0]
  }
  return arr
}

function mapChildren(React: React, node: Element) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.toString()
  }

  const arr = Array.from(node.childNodes).map((c: ChildNode) => {
    if (c.nodeType === Node.TEXT_NODE) {
      return c.textContent?.toString()
    }
    // BR = br, ReactElement = ReactElement
    const nodeName = isAllCaps(c.nodeName)
      ? c.nodeName.toLowerCase()
      : c.nodeName
    const children = flattenIfOne(mapChildren(React, c as Element))

    // we need to format c.attributes before passing it to createElement
    const attributes: Record<string, string | null> = {}
    const cAsElement = c as Element;
    for (const attr of cAsElement.getAttributeNames()) {
      attributes[attr] = cAsElement.getAttribute(attr)
    }

    return React.createElement(nodeName, attributes, children)
  })

  return flattenIfOne(arr)
}

const define = {
  // Creates a getter/setter that re-renders everytime a property is set.
  expando: function (receiver: Record<typeof renderSymbol, any>, key: string, value: unknown) {
    Object.defineProperty(receiver, key, {
      enumerable: true,
      get: function () {
        return value
      },
      set: function (newValue) {
        value = newValue
        this[renderSymbol]()
      },
    })
    receiver[renderSymbol]()
  },
}

interface R2WCOptions {
  shadow?: string | boolean
  props?: Array<string> | Record<string, unknown>
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
  ReactComponent: FC<any>,
  React: React,
  ReactDOM: ReactDOM,
  options: R2WCOptions = {},
): any {
  const propTypes: Record<string, any> = {} // { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
  const propAttrMap: Record<string, any> = {} // @TODO: add option to specify for asymetric mapping (eg "className" from "class")
  const attrPropMap: Record<string, any> = {} // cached inverse of propAttrMap

  if (!options.props) {
    options.props = ReactComponent.propTypes
      ? Object.keys(ReactComponent.propTypes)
      : []
  }

  const propKeys = Array.isArray(options.props)
    ? options.props.slice()
    : Object.keys(options.props)
    
  propKeys.forEach((key) => {
    propTypes[key] = Array.isArray(options.props) ? String : options.props?.[key]
    propAttrMap[key] = toDashedStyle(key)
    attrPropMap[propAttrMap[key]] = key
  })
  const renderAddedProperties: Record<string, boolean> = {
    isConnected: "isConnected" in HTMLElement.prototype,
  }
  let rendering = false
  // Create the web component "class"
  const WebComponent = function (this: any,...args: any[]) {
    const self = Reflect.construct(HTMLElement, args, this.constructor)
    if (typeof options.shadow === "string") {
      self.attachShadow({ mode: options.shadow })
    } else if (options.shadow) {
      console.warn(
        'Specifying the "shadow" option as a boolean is deprecated and will be removed in a future version.',
      )
      self.attachShadow({ mode: "open" })
    }
    return self
  }

  // Make the class extend HTMLElement
  const targetPrototype = Object.create(HTMLElement.prototype)
  targetPrototype.constructor = WebComponent

  // But have that prototype be wrapped in a proxy.
  const proxyPrototype = new Proxy(targetPrototype, {
    has: function (target, key) {
      return key in propTypes || key in targetPrototype
    },

    // when any undefined property is set, create a getter/setter that re-renders
    set: function (target, key, value, receiver) {
      if (rendering) {
        renderAddedProperties[key as string] = true
      }

      if (
        typeof key === "symbol" ||
        renderAddedProperties[key] ||
        key in target
      ) {
        // If the property is defined in the component props, just set it.
        if (
          ReactComponent.propTypes &&
          key in ReactComponent.propTypes &&
          typeof key === "string"
        ) {
          define.expando(receiver, key, value)
        }
        // Set it on the HTML element as well.
        return Reflect.set(target, key, value, receiver)
      } else {
        define.expando(receiver, key, value)
      }
      return true
    },
    // makes sure the property looks writable
    getOwnPropertyDescriptor: function (target, key) {
      const own = Reflect.getOwnPropertyDescriptor(target, key)
      if (own) {
        return own
      }
      if (key in propTypes) {
        return {
          configurable: true,
          enumerable: true,
          writable: true,
          value: undefined,
        }
      }
    },
  })
  WebComponent.prototype = proxyPrototype

  // Setup lifecycle methods
  targetPrototype.connectedCallback = function () {
    // Once connected, it will keep updating the innerHTML.
    // We could add a render method to allow this as well.
    this[shouldRenderSymbol] = true
    this[renderSymbol]()
  }
  targetPrototype.disconnectedCallback = function () {
    if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
      this[rootSymbol].unmount()
    } else if (ReactDOM.unmountComponentAtNode) {
      ReactDOM.unmountComponentAtNode(this)
    }
  }
  targetPrototype[renderSymbol] = function () {
    if (this[shouldRenderSymbol] === true) {
      const data: Record<string, any> = {}
      Object.keys(this).forEach(function (this: any, key) {
        if (renderAddedProperties[key] !== false) {
          data[key] = this[key]
        }
      }, this)
      rendering = true
      // Container is either shadow DOM or light DOM depending on `shadow` option.
      const container = options.shadow ? this.shadowRoot : this

      const children = flattenIfOne(mapChildren(React, this))

      const element = React.createElement(ReactComponent, data, children)

      // Use react to render element in container
      if (ReactDOM.createRoot && typeof ReactDOM.createRoot === "function") {
        if (!this[rootSymbol]) {
          this[rootSymbol] = ReactDOM.createRoot(container)
        }

        this[rootSymbol].render(element)
      } else if (ReactDOM.render) {
        ReactDOM.render(element, container)
      }

      rendering = false
    }
  }

  // Handle attributes changing
  WebComponent.observedAttributes = Object.keys(attrPropMap)

  targetPrototype.attributeChangedCallback = function (
    name: string,
    oldValue: any,
    newValue: any,
  ) {
    const propertyName = attrPropMap[name] || name
    switch (propTypes[propertyName]) {
      case "ref":
      case Function:
        if (!newValue && propTypes[propertyName] === "ref") {
          newValue = React.createRef()
          break
        }
        if (typeof window !== "undefined") {
          newValue = window[newValue] || newValue
        } else if (typeof global !== "undefined") {
          newValue = global[newValue] || newValue
        }
        if (typeof newValue === "function") {
          newValue = newValue.bind(this) // this = instance of the WebComponent / HTMLElement
        }
        break
      case Number:
        newValue = parseFloat(newValue)
        break
      case Boolean:
        newValue = /^[ty1-9]/i.test(newValue)
        break
      case Object:
      case Array:
        newValue = JSON.parse(newValue)
        break
      case String:
      default:
        break
    }

    this[propertyName] = newValue
  }

  return WebComponent
}
