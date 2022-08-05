const renderSymbol = Symbol.for("r2wc.reactRender")
const shouldRenderSymbol = Symbol.for("r2wc.shouldRender")
const rootSymbol = Symbol.for("r2wc.root")

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

const define = {
  // Creates a getter/setter that re-renders everytime a property is set.
  expando: function (receiver: object, key: string, value: unknown) {
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

interface React {
  createElement: (
    ReactComponent: object,
    data: object,
  ) => Record<string, unknown>
}

interface ReactDOM {
  createRoot?: (container: unknown) => unknown
  unmountComponentAtNode: (obj: Record<string, unknown>) => unknown
  render: (
    element: Record<string, unknown>,
    container: Record<string, unknown>,
  ) => unknown
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
  ReactComponent: { propTypes?: object },
  React: React,
  ReactDOM: ReactDOM,
  options: R2WCOptions = {},
) {
  const propTypes = {} // { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
  const propAttrMap = {} // @TODO: add option to specify for asymetric mapping (eg "className" from "class")
  const attrPropMap = {} // cached inverse of propAttrMap
  if (!options.props) {
    options.props = ReactComponent.propTypes
      ? Object.keys(ReactComponent.propTypes)
      : []
  }
  const propKeys = Array.isArray(options.props)
    ? options.props.slice()
    : Object.keys(options.props)
  const optionsPropsIsArray = Array.isArray(options.props)
  propKeys.forEach((key) => {
    propTypes[key] = optionsPropsIsArray ? String : options.props[key]
    propAttrMap[key] = toDashedStyle(key)
    attrPropMap[propAttrMap[key]] = key
  })
  const renderAddedProperties = {
    isConnected: "isConnected" in HTMLElement.prototype,
  }
  let rendering = false
  // Create the web component "class"
  const WebComponent = function (...args) {
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
        renderAddedProperties[key] = true
      }

      if (
        typeof key === "symbol" ||
        renderAddedProperties[key] ||
        key in target
      ) {
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
    if (typeof ReactDOM.createRoot === "function") {
      this[rootSymbol].unmount()
    } else {
      ReactDOM.unmountComponentAtNode(this)
    }
  }
  targetPrototype[renderSymbol] = function () {
    if (this[shouldRenderSymbol] === true) {
      const data = {}
      Object.keys(this).forEach(function (key) {
        if (renderAddedProperties[key] !== false) {
          data[key] = this[key]
        }
      }, this)
      rendering = true
      // Container is either shadow DOM or light DOM depending on `shadow` option.
      const container = options.shadow ? this.shadowRoot : this

      const element = React.createElement(ReactComponent, data)

      // Use react to render element in container
      if (typeof ReactDOM.createRoot === "function") {
        if (!this[rootSymbol]) {
          this[rootSymbol] = ReactDOM.createRoot(container)
        }

        this[rootSymbol].render(element)
      } else {
        ReactDOM.render(element, container)
      }

      rendering = false
    }
  }

  // Handle attributes changing
  WebComponent.observedAttributes = Object.keys(attrPropMap)

  targetPrototype.attributeChangedCallback = function (
    name: string,
    oldValue,
    newValue,
  ) {
    const propertyName = attrPropMap[name] || name
    switch (propTypes[propertyName]) {
      case Function:
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
