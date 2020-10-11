# react-to-webcomponent

`react-to-webcomponent` converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share react components as native elements that __don't__ require mounted being through React. The custom element acts as a wrapper for the underlying react component. Use these custom elements in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

`react-to-webcomponent`:

- Works in all modern browsers. (Edge needs a [customElements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)).
- Is `1.11KB` minified and gzipped.

## Basic Use

Given a react component like:

```js
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}
```

Call `reactToWebComponent` and [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) as follows:

```js
import reactToWebComponent from "react-to-webcomponent";

const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM);

customElements.define("web-greeting", WebGreeting);
```


Now you can use `<web-greeting>` like any other HTML element!

You can create it programatically:

```js
const webGreeting = document.createElement("web-greeting");
webGreeting.name = "StandardsFan";

document.body.append(webGreeting);

webGreeting.innerHTML //-> "<h1>Hello, StandardsFan</h1>"
```

Or you can use it declaratively:

```js
document.body.innerHTML = "<web-greeting></web-greeting>";

document.body.firstChild.name = "CoolBeans";

document.body.firstChild.innerHTML //-> "<h1>Hello, CoolBeans</h1>"
```

### Working with Attributes

By default, custom elements created by `reactToWebComponent` only
pass properties to the underlying React component. To make attributes
work, you must specify your component's properties with
[PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) as follows:

```js
class Greeting extends React.Component {
  render() {
    return <h1>Hello, {this.props.name}</h1>;
  }
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired
};
```

Now `reactToWebComponent` will know to look for `name` attributes
as follows:

```js
document.body.innerHTML = "<web-greeting name='Amazed'></web-greeting>";

document.body.firstChild.innerHTML //-> "<h1>Hello, Amazed</h1>"
```


## Setup

#### From NPM

To install from npm:

```
npm i react-to-webcomponent
```

#### CodePen

[Greeting example in a CodePen](https://codepen.io/justinbmeyer/pen/gOYrQax?editors=1010)

## API

`reactToWebComponent(ReactComponent, React, ReactDOM, options)` takes the following:

- `ReactComponent` - A react component that you want to
  convert to a Web Component.
- `React` - A version of React (or [preact-compat](https://preactjs.com/guide/v10/switching-to-preact)) the
  component works with.
- `ReactDOM` - A version of ReactDOM (or preact-compat) that the component works with.
- `options` - An optional set of parameters.
- `options.shadow` - Use shadow DOM rather than light DOM.

A new class inheriting from `HTMLElement` is
returned. This class can be directly passed to `customElements.define` as follows:

```js
customElements.define("web-greeting",
	reactToWebComponent(Greeting, React, ReactDOM) );
```

Or the class can be defined and used later:

```js
const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM);

customElements.define("web-greeting", WebGreeting);

var myGreeting = new WebGreeting();
document.body.appendChild(myGreeting);
```

Or the class can be extended:

```js
class WebGreeting extends reactToWebComponent(Greeting, React, ReactDOM)
{
	disconnectedCallback(){
		super.disconnectedCallback();
		// special stuff
	}
}
customElements.define("web-greeting", WebGreeting);
```

Components can also be implemented using [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM).

```js
const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM, { shadow: true });

customElements.define("web-greeting", WebGreeting);

var myGreeting = new WebGreeting();
document.body.appendChild(myGreeting);

var shadowContent = myGreeting.shadowRoot.children[0];
```

### How it works

`reactToWebComponent` creates a constructor function whose prototype is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This acts as a trap for any property set on instances of the custom element. When a property is set, the proxy:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance
  to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.
