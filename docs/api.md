## API

`reactToWebComponent(ReactComponent, React, ReactDOM, options)` takes the following:

- `ReactComponent` - A React component that you want to
  convert to a Web Component.
- `React` - A version of React (or [preact-compat](https://preactjs.com/guide/v10/switching-to-preact)) the
  component works with.
- `ReactDOM` - A version of ReactDOM (or preact-compat) that the component works with.
- `options` - An optional set of parameters.

  - `options.shadow` - Use shadow DOM rather than light DOM.
  - `options.props` - Array of camelCasedProps to watch as String values or { [camelCasedProps]: String | Number | Boolean | Function | Object | Array }

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
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.camelCaseName}</h1>
  }
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
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.camelCaseName}</h1>
  }
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

If `options.props` is an object, the keys are the camelCased React props and the values are any one of the following built in javascript types:

`String | Number | Boolean | Function | Object | Array`

```js
class AttrPropTypeCasting extends React.Component {
  render() {
    console.log(this.props) // Note
    return <h1>Oh my, {this.props.stringProp}</h1>
  }
}

customElements.define(
  "attr-prop-type-casting",
  reactToWebComponent(AttrPropTypeCasting, React, ReactDOM, {
    props: {
      stringProp: String,
      numProp: Number,
      floatProp: Number,
      trueProp: Boolean,
      falseProp: Boolean,
      arrayProp: Array,
      objProp: Object,
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
  console.log(this.props) in the React render function produces this:
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
    handleClick: Function,
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
