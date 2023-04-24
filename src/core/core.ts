/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react"
import { ComponentClass, FC, R2WCOptions, Renderer } from "../types"

const renderSymbol = Symbol.for("r2wc.reactRender")
const shouldRenderSymbol = Symbol.for("r2wc.shouldRender")

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

function mapChildren(node: Element) {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent?.toString()
  }

  const arr = Array.from(node.childNodes as unknown as Element[]).map(
    (c: Element) => {
      if (c.nodeType === Node.TEXT_NODE) {
        return c.textContent?.toString()
      }
      // BR = br, ReactElement = ReactElement
      const nodeName = isAllCaps(c.nodeName)
        ? c.nodeName.toLowerCase()
        : c.nodeName
      const children = flattenIfOne(mapChildren(c))

      // we need to format c.attributes before passing it to createElement
      const attributes: Record<string, string | null> = {}
      for (const attr of c.getAttributeNames()) {
        attributes[attr] = c.getAttribute(attr)
      }

      return React.createElement(nodeName, attributes, children)
    },
  )

  return flattenIfOne(arr)
}

// const define = {
//   // Creates a getter/setter that re-renders everytime a property is set.
//   expando: function (
//     receiver: Record<typeof renderSymbol, any>,
//     key: string,
//     value: unknown,
//   ) {
//     Object.defineProperty(receiver, key, {
//       enumerable: true,
//       get: function () {
//         return value
//       },
//       set: function (newValue) {
//         value = newValue
//         this[renderSymbol]()
//       },
//     })
//     receiver[renderSymbol]()
//   },
// }

/**
 * Converts a React component into a webcomponent by wrapping it in a Proxy object.
 * @param {ReactComponent}
 * @param {Object} config - Optional parameters
 * @param {String?} config.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} config.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default function (
  ReactComponent: FC<any> | ComponentClass<any>,
  config: R2WCOptions = {},
  renderer: Renderer<ReturnType<typeof React.createElement>>,
): CustomElementConstructor {
  const propTypes: Record<string, any> = {} // { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
  const propAttrMap: Record<string, any> = {} // @TODO: add option to specify for asymetric mapping (eg "className" from "class")
  const attrPropMap: Record<string, any> = {} // cached inverse of propAttrMap

  if (!config.props) {
    config.props = ReactComponent.propTypes
      ? Object.keys(ReactComponent.propTypes)
      : []
  }

  const propKeys = Array.isArray(config.props)
    ? config.props.slice()
    : Object.keys(config.props)

  propKeys.forEach((key) => {
    propTypes[key] = Array.isArray(config.props) ? String : config.props?.[key]
    propAttrMap[key] = toDashedStyle(key)
    attrPropMap[propAttrMap[key]] = key
  })
  const renderAddedProperties: Record<string, boolean> = {
    isConnected: "isConnected" in HTMLElement.prototype,
  }
  class WebCompClass extends HTMLElement {
    rendering: boolean
    getOwnPropertyDescriptor: (
      key: string,
    ) =>
      | TypedPropertyDescriptor<
          string extends keyof this ? this[keyof this & string] : any
        >
      | undefined
    constructor() {
      super()
      if (typeof config.shadow === "string") {
        this.attachShadow({ mode: config.shadow } as ShadowRoot)
      } else if (config.shadow) {
        console.warn(
          'Specifying the "shadow" option as a boolean is deprecated and will be removed in a future version.',
        )
        this.attachShadow({ mode: "open" })
      }

      this.rendering = false

      // Add custom getter and setter for each prop
      for (const key of propKeys) {
        if (key in propTypes) {
          let attributeToAdd: any = this.getAttribute(propAttrMap[key])
          // account for default prop values
          if (attributeToAdd === null) {
            attributeToAdd = ReactComponent.defaultProps?.[key]
          }
          switch (propTypes[key]) {
            case "ref":
              attributeToAdd = React.createRef()
              break
            case Function:
              if (typeof window !== "undefined" && attributeToAdd in window) {
                attributeToAdd = window[attributeToAdd as any]
              } else if (
                typeof global !== "undefined" &&
                attributeToAdd in global
              ) {
                attributeToAdd = global[attributeToAdd as any]
              }
              if (typeof attributeToAdd === "function") {
                attributeToAdd = attributeToAdd.bind(this)
              }
              break
            case Number:
              attributeToAdd = parseFloat(attributeToAdd)
              break
            case Boolean:
              attributeToAdd = /^[ty1-9]/i.test(attributeToAdd)
              break
            case Object:
              attributeToAdd = JSON.parse(attributeToAdd)
              break
            case Array:
              attributeToAdd = JSON.parse(attributeToAdd)
              break
            case String:
            default:
              break
          }
          Reflect.set(this, key, attributeToAdd)
        }
      }

      // Add custom getter and setter
      this.hasAttribute = function (key: string) {
        return key in propTypes || key in this
      }

      this.getOwnPropertyDescriptor = function (key: string) {
        const own = Reflect.getOwnPropertyDescriptor(this, key)
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
      }
    }

    [shouldRenderSymbol] = true;

    [renderSymbol]() {
      if (this[shouldRenderSymbol] === true) {
        const data: Record<string, any> = {}
        Object.keys(this).forEach(function (this: any, key) {
          if (renderAddedProperties[key] !== false && key in propTypes) {
            data[key] = this[key]
          }
        }, this)
        this.rendering = true
        // Container is either shadow DOM or light DOM depending on `shadow` option.
        const container = config.shadow ? (this.shadowRoot as any) : this

        const children = flattenIfOne(mapChildren(this))

        const element = React.createElement(ReactComponent, data, children)

        // Use react to render element in container
        renderer.mount(container, element)
        this.rendering = false
      }
    }

    connectedCallback() {
      // Once connected, it will keep updating the innerHTML.
      // We could add a render method to allow this as well.
      renderAddedProperties["setAttribute"] = false
      renderAddedProperties["hasAttribute"] = false
      renderAddedProperties["getOwnPropertyDescriptor"] = false
      this[shouldRenderSymbol] = true
      this[renderSymbol]()
    }

    disconnectedCallback() {
      this[shouldRenderSymbol] = false
      renderer.unmount(this)
    }

    // attributeChangedCallback() {
    //   return (name: string, oldValue: any, newValue: any) => {
    //     const propertyName = attrPropMap[name] || name;
    //     switch (propTypes[propertyName]) {
    //       case "ref":
    //       case Function:
    //         if (!newValue && propTypes[propertyName] === "ref") {
    //           newValue = React.createRef();
    //           break;
    //         }
    //         if (typeof window !== "undefined") {
    //           newValue = window[newValue] || newValue;
    //         } else if (typeof global !== "undefined") {
    //           newValue = global[newValue] || newValue;
    //         }
    //         if (typeof newValue === "function") {
    //           newValue = newValue.bind(this); // this = instance of the WebComponent / HTMLElement
    //         }
    //         break;
    //       case Number:
    //         newValue = parseFloat(newValue);
    //         break;
    //       case Boolean:
    //         newValue = /^[ty1-9]/i.test(newValue);
    //         break;
    //       case Object:
    //         newValue = JSON.parse(newValue);
    //         break;
    //       case Array:
    //         newValue = JSON.parse(newValue);
    //         break;
    //       case String:
    //       default:
    //         break;
    //     }
    //   };
    // }

    static get observedAttributes() {
      return Object.keys(propTypes)
    }
  }

  return WebCompClass
}
