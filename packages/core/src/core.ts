import type { R2WCType } from "./transforms"

import transforms from "./transforms"

type PropName<Props> = Extract<keyof Props, "string">
type PropNames<Props> = Array<PropName<Props>>

export interface R2WCOptions<Props> {
  shadow?: "open" | "closed"
  props?: PropNames<Props> | Record<PropName<Props>, R2WCType>
}

export interface R2WCRenderer<Props, Context> {
  mount: (
    container: HTMLElement,
    ReactComponent: React.ComponentType<Props>,
    props: Props,
  ) => Context
  update: (context: Context, props: Props) => void
  unmount: (context: Context) => void
}

const renderSymbol = Symbol.for("r2wc.render")
const connectedSymbol = Symbol.for("r2wc.connected")
const contextSymbol = Symbol.for("r2wc.context")
const propsSymbol = Symbol.for("r2wc.props")

/**
 * Converts a React component into a Web Component.
 * @param {ReactComponent}
 * @param {Object} options - Optional parameters
 * @param {String?} options.shadow - Shadow DOM mode as either open or closed.
 * @param {Object|Array?} options.props - Array of camelCasedProps to watch as Strings or { [camelCasedProp]: String | Number | Boolean | Function | Object | Array }
 */
export default function r2wc<Props, Context>(
  ReactComponent: React.ComponentType<Props>,
  options: R2WCOptions<Props>,
  renderer: R2WCRenderer<Props, Context>,
): CustomElementConstructor {
  if (!options.props) {
    options.props = ReactComponent.propTypes
      ? (Object.keys(ReactComponent.propTypes) as PropNames<Props>)
      : []
  }

  const propNames = Array.isArray(options.props)
    ? options.props.slice()
    : (Object.keys(options.props) as PropNames<Props>)

  const propTypes = {} as Record<PropName<Props>, R2WCType>
  const mapPropAttribute = {} as Record<PropName<Props>, string>
  const mapAttributeProp = {} as Record<string, PropName<Props>>
  for (const prop of propNames) {
    propTypes[prop] = Array.isArray(options.props)
      ? "string"
      : options.props[prop]

    const attribute = toDashedStyle(prop)

    mapPropAttribute[prop] = attribute
    mapAttributeProp[attribute] = prop
  }

  class ReactWebComponent extends HTMLElement {
    static get observedAttributes() {
      return Object.keys(mapAttributeProp)
    }

    [connectedSymbol] = true;
    [contextSymbol]?: Context;
    [propsSymbol]: Props = {} as Props
    container: HTMLElement

    constructor() {
      super()

      if (options.shadow) {
        this.container = this.attachShadow({
          mode: options.shadow,
        }) as unknown as HTMLElement
      } else {
        this.container = this
      }

      for (const prop of propNames) {
        const attribute = mapPropAttribute[prop]
        const value = this.getAttribute(attribute)
        const type = propTypes[prop]

        if (value) {
          //@ts-ignore
          this[propsSymbol][prop] = transforms[type].parse(value, this)
        }
      }
    }

    connectedCallback() {
      this[connectedSymbol] = true
      this[renderSymbol]()
    }

    disconnectedCallback() {
      this[connectedSymbol] = false

      if (this[contextSymbol]) {
        renderer.unmount(this[contextSymbol])
      }
    }

    attributeChangedCallback(
      attribute: string,
      oldValue: string,
      value: string,
    ) {
      const prop = mapAttributeProp[attribute]
      const type = propTypes[prop]

      if (prop in propTypes) {
        //@ts-ignore
        this[propsSymbol][prop] = transforms[type].parse(value, this)

        this[renderSymbol]()
      }
    }

    [renderSymbol]() {
      if (!this[connectedSymbol]) return

      if (!this[contextSymbol]) {
        this[contextSymbol] = renderer.mount(
          this.container,
          ReactComponent,
          this[propsSymbol],
        )
      } else {
        renderer.update(this[contextSymbol], this[propsSymbol])
      }
    }
  }

  for (const prop of propNames) {
    const attribute = mapPropAttribute[prop]
    const type = propTypes[prop]

    Object.defineProperty(ReactWebComponent.prototype, prop, {
      enumerable: true,
      configurable: true,
      get() {
        return this[propsSymbol][prop]
      },
      set(value) {
        this[propsSymbol][prop] = value

        const stringify = transforms[type].stringify
        if (stringify) {
          //@ts-ignore
          const attributeValue = stringify(value)
          const oldAttributeValue = this.getAttribute(attribute)

          if (oldAttributeValue !== attributeValue) {
            this.setAttribute(attribute, attributeValue)
          }
        }
      },
    })
  }

  return ReactWebComponent
}

function toDashedStyle(camelCase = "") {
  return camelCase.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()
}
