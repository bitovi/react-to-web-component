## API

`reactToWebComponent(ReactComponent, React, ReactDOM, options)` takes the following:

- `ReactComponent` - A React component that you want to
  convert to a Web Component.
- `React` - A version of React (or [preact-compat](https://preactjs.com/guide/v10/switching-to-preact)) the
  component works with.
- `ReactDOM` - A version of ReactDOM (or preact-compat) that the component works with.
- `options` - An optional set of parameters.

  - `options.shadow` - Use shadow DOM rather than light DOM.
  - `options.props` - Array of camelCasedProps to watch as String values or { [camelCasedProps]: String | Number | Boolean | Function | Object | Array | "ref" }

    - When specifying Array or Object as the type, the string passed into the attribute must pass `JSON.parse()` requirements.
    - When specifying Boolean as the type, "true", "1", "yes", "TRUE", and "t" are mapped to `true`. All strings NOT begining with t, T, 1, y, or Y will be `false`.
    - When specifying Function as the type, the string passed into the attribute must be the name of a function on `window` (or `global`). The `this` context of the function will be the instance of the WebComponent / HTMLElement when called.

  A new class inheriting from `HTMLElement` is
  returned. This class can be directly passed to `customElements.define` as follows:

```js
customElements.define(
  "web-greeting",
  reactToWebComponent(Greeting, React, ReactDOM),
)
```

Or the class can be defined and used later:

```js
const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM)

customElements.define("web-greeting", WebGreeting)

var myGreeting = new WebGreeting()
document.body.appendChild(myGreeting)
```

Or the class can be extended:

```js
class WebGreeting extends reactToWebComponent(Greeting, React, ReactDOM) {
  disconnectedCallback() {
    super.disconnectedCallback()
    // special stuff
  }
}
customElements.define("web-greeting", WebGreeting)
```

Components can also be implemented using [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM) with either `open` or `closed` mode.

```js
const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM, {
  shadow: "open",
})

customElements.define("web-greeting", WebGreeting)

var myGreeting = new WebGreeting()
document.body.appendChild(myGreeting)

var shadowContent = myGreeting.shadowRoot.children[0]
```

If propTypes are defined on the underlying React component, dashed-attributes on the webcomponent are converted into the corresponding camelCase React props and the string attribute value is passed in.

```js
function Greeting({ camelCaseName }) {
  return <h1>Hello, {camelCaseName}</h1>
}
Greeting.propTypes = {
  camelCaseName: PropTypes.string.isRequired,
}

customElements.define(
  "my-dashed-style-greeting",
  reactToWebComponent(Greeting, React, ReactDOM, {}),
)

document.body.innerHTML =
  '<my-dashed-style-greeting camel-case-name="Christopher"></my-dashed-style-greeting>'

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Christopher</h1>"
```

If `options.props` is specified, R2WC will use those props instead of the keys from propTypes. If it's an array, all corresponding kebob-cased attr values will be passed as strings to the underlying React component.

```js
function Greeting({ camelCaseName }) {
  return <h1>Hello, {camelCaseName}</h1>
}

customElements.define(
  "my-dashed-style-greeting",
  reactToWebComponent(Greeting, React, ReactDOM, {
    props: ["camelCaseName"],
  }),
)

document.body.innerHTML =
  '<my-dashed-style-greeting camel-case-name="Jane"></my-dashed-style-greeting>'

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Jane</h1>"
```

## Typed Props

If `options.props` is an object, the keys are the camelCased React props and the values are any one of the following built in javascript types, or the string "ref":

`"string" | "number" | "boolean" | "function" | "json" | "ref"`

"json" can be an array or object. The string passed into the attribute must pass `JSON.parse()` requirements.

### "string" | "number" | "boolean" | "function" | "json" props

```js
function AttrPropTypeCasting(props) {
  console.log(props) // Note
  return <h1>Hello, {props.camelCaseName}</h1>
}

customElements.define(
  "attr-prop-type-casting",
  reactToWebComponent(AttrPropTypeCasting, React, ReactDOM, {
    props: {
      stringProp: "string",
      numProp: "number",
      floatProp: "number",
      trueProp: "boolean",
      falseProp: "boolean",
      arrayProp: "json",
      objProp: "json",
    },
  }),
)

document.body.innerHTML = `
  <attr-prop-type-casting
    string-prop="iloveyou"
    num-prop="360"
    float-prop="0.5"
    true-prop="true"
    false-prop="false"
    array-prop='[true, 100.25, "👽", { "aliens": "welcome" }]'
    obj-prop='{ "very": "object", "such": "wow!" }'
  ></attr-prop-type-casting>
`

/*
  console.log(props) in the functions produces this:
  {
    stringProp: "iloveyou",
    numProp: 360,
    floatProp: 0.5,
    trueProp: true,
    falseProp: false,
    arrayProp: [true, 100.25, "👽", { aliens: "welcome" }],
    objProp: { very: "object", such: "wow!" },
  }
*/
```

### Function props

When `Function` is specified as the type, attribute values on the web component will be converted into function references when passed into the underlying React component. The string value of the attribute must be a valid reference to a function on `window` (or on `global`).

```js
function ThemeSelect({ handleClick }) {
  return (
    <div>
      <button onClick={() => handleClick("V")}>V</button>
      <button onClick={() => handleClick("Johnny")}>Johnny</button>
      <button onClick={() => handleClick("Jane")}>Jane</button>
    </div>
  )
}

const WebThemeSelect = reactToWebComponent(ThemeSelect, React, ReactDOM, {
  props: {
    handleClick: "function",
  },
})

customElements.define("theme-select", WebThemeSelect)

window.globalFn = function (selected) {
  // "this" is the instance of the WebComponent / HTMLElement
  const thisIsEl = this === document.querySelector("theme-select")
  console.log(thisIsEl, selected)
}

document.body.innerHTML =
  "<theme-select handle-click='globalFn'></theme-select>"

setTimeout(
  () => document.querySelector("theme-select button:last-child").click(),
  0,
)
// ^ calls globalFn, logs: true, "Jane"
```

### "ref" props

If the React component is can provide a ref to itself or has ref props, you can specify attributes as `"ref"` type.

For example, given this class component:

```js
class ComRef extends React.Component {
  constructor(props) {
    super(props)
    this.exposedToParentByRef = true
    this.h1Ref = props.h1Ref
  }
  render() {
    return <h1 ref={this.props.h1Ref}>Ref</h1>
  }
}
```

or given this functional component:

```js
/* note useImperativeHandle is not available in preact, but class component `ref` will work as expected in both preact and react */

const ComRef = React.forwardRef(function ComRef(props, ref) {
  // set up a reference obj to the component itself
  React.useImperativeHandle(ref, () => ({
    exposedToParentByRef: true,
    h1Ref: props.h1Ref,
  }))
  return <h1 ref={props.h1Ref}>Ref</h1>
})
```

Then `React.createRef()` will automatically happen behind the scenes then attach the reference to the webcomponent instance if it has the corresponding attribute.

```js
class WebComRef extends reactToWebComponent(ComRef, React, ReactDOM, {
  props: {
    ref: "ref",
    h1Ref: "ref",
  },
}) {}

customElements.define("ref-example", WebComRef)

// add "ref" and "h1-ref" attrs to opt-in to having them attached to the webcomponent instance:
document.body.innerHTML = "<ref-example ref h1-ref></ref-example>"

setTimeout(() => {
  const el = document.querySelector("ref-example")

  console.log(el.ref.current.exposedToParentByRef) // logs true using either the functional or class example above
  console.log(el.ref.current instanceof ComRef) // logs true only if you used the class ComRef component example

  const h1 = el.querySelector("h1")

  console.log(el.h1Ref.current === h1) // logs true
}, 0)
```

#### Specifing a callback function for ref props

If your `"ref"` type webcomponent attribute specifies a value, the value will be the name of a global function (like the `Function` prop type above) and be used as a callback reference, recieving the dom element the React component attaches it to as a parameter.

```js
window.globalRefFn = function (el) {
  if (!el) {
    // if the component rerenders the referenced element, the callback may run with el = null
    return
  }
  console.log(el === this.querySelector("h1")) // logs true
}

// opt-in to the h1-ref attr (h1Ref prop) and specify callback function to use:
body.innerHTML = "<ref-example h1-ref='globalRefFn'></ref-example>"
```

Note: React only supports callback references to elements, not to component instances
