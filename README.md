# React to Web Component

`@r2wc/react-to-web-component` converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share React components as native elements that **don't** require being mounted through React. The custom element acts as a wrapper for the underlying React component. Use these custom elements with any project that uses HTML even in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

> Note: The latest version of this package only works with the React 18. If you are using React 16 or 17, please use version 1.

`@r2wc/react-to-web-component`:

- Works in all modern browsers. (Edge needs a [customElements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)).
- Is `1.26KB` minified and gzipped.

## Setup

To install from npm:

```
npm install @r2wc/react-to-web-component
```

## Need help or have questions?

This project is supported by [Bitovi, a React consultancy](https://www.bitovi.com/frontend-javascript-consulting/react-consulting). You can get help or ask questions on our:

- [Discord Community](https://discord.gg/J7ejFsZnJ4)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

## Basic Use

For basic usage, we will use this simple React component:

```js
const Greeting = () => {
  return <h1>Hello, World!</h1>
}
```

With our React component complete, all we have to do is call `r2wc` and [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) to create and define our custom element:

```js
import r2wc from "@r2wc/react-to-web-component"

const WebGreeting = r2wc(Greeting)

customElements.define("web-greeting", WebGreeting)
```

Now we can use `<web-greeting>` like any other HTML element!

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting></web-greeting>
</body>
```

In the above case, the web-greeting custom element is not making use of the `name` property from our `Greeting` component.

## Working with Attributes

By default, custom elements created by `r2wc` only pass properties to the underlying React component. To make attributes work, you must specify your component's props.

```js
const Greeting = ({ name }) => {
  return <h1>Hello, {name}!</h1>
}

const WebGreeting = r2wc(Greeting, {
  props: {
    name: "string",
  },
})
```

Now `r2wc` will know to look for `name` attributes
as follows:

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting name="Justin"></web-greeting>
</body>
```

For projects needing more advanced usage of the web components, see our [programatic usage and declarative demos](docs/programatic-usage.md).

We also have a [complete example using a third party library](docs/complete-example.md).

## Examples

- [Hello World](https://codesandbox.io/s/hello-world-md5oih) - The quintessential software demo!
- [All the Props](https://codesandbox.io/s/all-the-props-n8z5hv) - A demo of all the prop transform types that R2WC supports.
- [Header Example](https://codesandbox.io/s/example-header-blog-7k313l) - An example reusable Header component.
- [MUI Button](https://codesandbox.io/s/example-mui-button-qwidh9) - An example application using an MUI button with theme customization.
- [Checklist Demo](https://codesandbox.io/s/example-checklist-blog-y3nqwx) - An example Checklist application.

## Blog Posts

R2WC with Vite [View Post](https://www.bitovi.com/blog/react-everywhere-with-vite-and-react-to-webcomponent)

R2WC with Create React App (CRA) [View Post](https://www.bitovi.com/blog/how-to-create-a-web-component-with-create-react-app)

## How it works

Check out our [full API documentation](https://github.com/bitovi/react-to-web-component/blob/main/docs/api.md).

Under the hood, `r2wc` creates a `CustomElementConstructor` with custom getters/setters and life cycle methods that keep track of the props that you have defined. When a property is set, its custom setter:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.

# We want to hear from you.

Come chat with us about open source in our Bitovi community [Discord](https://discord.gg/J7ejFsZnJ4).

See what we're up to by following us on [Twitter](https://twitter.com/bitovi).
