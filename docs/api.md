## API

`reactToWebComponent(ReactComponent, React, ReactDOM, options)` takes the following:

- `ReactComponent` - A React component that you want to
  convert to a Web Component.
- `React` - A version of React (or [preact-compat](https://preactjs.com/guide/v10/switching-to-preact)) the
  component works with.
- `ReactDOM` - A version of ReactDOM (or preact-compat) that the component works with.
- `options` - An optional set of parameters.

  - `options.shadow` - Use shadow DOM rather than light DOM.
  - `options.dashStyleAttributes` - convert dashed-attirbutes on the web component into camelCase props for the React component

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

Using dashStyleAttributes to convert dashed-attributes into camelCase React props

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
  reactToWebComponent(Greeting, React, ReactDOM, { dashStyleAttributes: true }),
)

document.body.innerHTML =
  '<my-dashed-style-greeting camel-case-name="Christopher"></my-dashed-style-greetingg>'

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Christopher</h1>"
```

Further, attributes on the web component beginning with `on-` or `handle-` will be converted into function references when passed into the underlying React component if the string value is a valid reference to a function on `window` (or on `global`).

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

ThemeSelect.propTypes = {
  handleClick: PropTypes.func.isRequired,
}

const WebThemeSelect = reactToWebComponent(ThemeSelect, React, ReactDOM, {
  dashStyleAttributes: true,
})

customElements.define("theme-select", WebThemeSelect)

window.globalFn = (selected) => {
  console.log(selected)
}

document.body.innerHTML =
  "<theme-select handle-click='globalFn'></theme-select>"

setTimeout(
  () => document.querySelector("theme-select button:last-child").click(),
  0,
)
// ^ calls globalFn, logs "Jane"
```
