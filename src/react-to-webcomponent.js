const renderSymbol = Symbol.for("r2wc.reactRender")
const shouldRenderSymbol = Symbol.for("r2wc.shouldRender")
const rootSymbol = Symbol.for("r2wc.root")

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()
}

function toCamelCaseStyle(dashedStyle = "") {
  return dashedStyle.replace(/-([a-z0-9])/g, function (g) {
    return g[1].toUpperCase()
  })
}

var define = {
  // Creates a getter/setter that re-renders everytime a property is set.
  expando: function (receiver, key, value) {
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

/**
 * Converts a React component into a webcomponent by wrapping it in a Proxy object.
 * @param {ReactComponent}
 * @param {React}
 * @param {ReactDOM}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {String?} options.dashStyleAttributes - Use dashed style of attributes to reflect camelCase properties
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (ReactComponent, React, ReactDOM, options = {}) {
  var renderAddedProperties = {
    isConnected: "isConnected" in HTMLElement.prototype,
  }
  var rendering = false
  // Create the web component "class"
  var WebComponent = function () {
    var self = Reflect.construct(HTMLElement, arguments, this.constructor)
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
  var targetPrototype = Object.create(HTMLElement.prototype)
  targetPrototype.constructor = WebComponent

  // But have that prototype be wrapped in a proxy.
  var proxyPrototype = new Proxy(targetPrototype, {
    has: function (target, key) {
      return key in ReactComponent.propTypes || key in targetPrototype
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
        // If the property is defined in the component props, just set it.
        if (ReactComponent.propTypes && key in ReactComponent.propTypes) {
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
      var own = Reflect.getOwnPropertyDescriptor(target, key)
      if (own) {
        return own
      }
      if (key in ReactComponent.propTypes) {
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
      var data = {}
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
  if (ReactComponent.propTypes) {
    WebComponent.observedAttributes = options.dashStyleAttributes
      ? Object.keys(ReactComponent.propTypes).map(function (key) {
          return toDashedStyle(key)
        })
      : Object.keys(ReactComponent.propTypes)
    targetPrototype.attributeChangedCallback = function (
      name,
      oldValue,
      newValue,
    ) {
      // @TODO: handle type conversion
      var propertyName = options.dashStyleAttributes
        ? toCamelCaseStyle(name)
        : name
      this[propertyName] = newValue
    }
  }

  return WebComponent
}
