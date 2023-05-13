# React to Web Component

`react-to-webcomponent` converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share React components as native elements that **don't** require mounted being through React. The custom element acts as a wrapper for the underlying React component. Use these custom elements with any project that uses HTML even in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

`react-to-webcomponent`:

- Works in all modern browsers. (Edge needs a [customElements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)).
- Is `1.11KB` minified and gzipped.

## Need help or have questions?

This project is supported by [Bitovi, a React consultancy](https://www.bitovi.com/frontend-javascript-consulting/react-consulting). You can get help or ask questions on our:

- [Discord Community](https://discord.gg/J7ejFsZnJ4)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

> This is the documentation for the upcoming version 2 of react-to-webcomponent. It will have a very similar but backwards incompatible API. For production deployments, please see the [document for version 1](https://github.com/bitovi/react-to-webcomponent/tree/main).

## Basic Use

For basic usage, we will use this simple React component:

```js
const Greeting = () => {
  return <h1>Hello, World!</h1>
}
```

With our React component complete, all we have to do is call `reactToWebComponent` and [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) to create and define our custom element:

```js
import reactToWebComponent from "react-to-webcomponent"

const WebGreeting = reactToWebComponent(Greeting)

customElements.define("web-greeting", WebGreeting)
```

Now we can use `<web-greeting>` like any other HTML element!

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting></web-greeting>
</body>
```

Note that by using React 18, `reactToWebComponent` will use the new root API. If your application needs the legacy API, please use React 17

In the above case, the web-greeting custom element is not making use of the `name` property from our `Greeting` component.

## Working with Attributes

By default, custom elements created by `reactToWebComponent` only pass properties to the underlying React component. To make attributes work, you must specify your component's props.

```js
const Greeting = ({ name }) => {
  return <h1>Hello, {name}!</h1>
}

const WebGreeting = reactToWebComponent(Greeting, {
  props: {
    name: "string",
  },
})
```

Now `reactToWebComponent` will know to look for `name` attributes
as follows:

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting name="Justin"></web-greeting>
</body>
```

For projects needing more advanced usage of the web components, see our [programatic usage and declarative demos](docs/programatic-usage.md).

We also have a [complete example using a third party library](docs/complete-example.md).

## Setup

To install from npm:

```
npm i react-to-webcomponent
```

## External Examples

Greeting example in a [CodePen](https://codepen.io/bavinedwards/pen/jOveaGm)

Greeting example in [CodeSandbox](https://codesandbox.io/s/sample-greeting-app-ts-qwidh9)

Hello, world example (React17) in [CodeSandbox](https://codesandbox.io/s/hello-world-react17-u4l3x1)

Example with all prop types in [CodeSandbox](https://codesandbox.io/p/sandbox/vite-example-with-numerous-types-gjf87o)

R2WC With Vite Header Example in [CodeSandbox](https://codesandbox.io/p/sandbox/header-example-e4x25q)

## External Blog Posts

R2WC with Vite [View Post](https://www.bitovi.com/blog/react-everywhere-with-vite-and-react-to-webcomponent)

R2WC with Create React App (CRA) [View Post](https://www.bitovi.com/blog/how-to-create-a-web-component-with-create-react-app)

## Bundled JS file available

[https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js](https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js)

## How it works

Check out our [full API documentation](docs/api.md).

`reactToWebComponent` creates a constructor function whose prototype is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This acts as a trap for any property set on instances of the custom element. When a property is set, the proxy:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance
  to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.

# Tests

To run tests, first run:

```
npm run buildtests
```

This copies the root test file into each of the `/tests/react*` versioned folders, modifies the ReactDOM import for older versions, and installs the corresponding version of react in that directory.

Then run:

```
npm run test
```

# We want to hear from you.

Come chat with us about open source in our Bitovi community [Discord](https://discord.gg/J7ejFsZnJ4).

See what we're up to by following us on [Twitter](https://twitter.com/bitovi).
