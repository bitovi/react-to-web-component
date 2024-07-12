# React to Web Component

`@r2wc/core` is the heart of our system that converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share React components as native elements that **don't** require being mounted through React. The custom element acts as a wrapper for the underlying React component. Use these custom elements with any project that uses HTML even in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

This project is an internal library that should not need to be used directly outside of renderers designed for this system, such as [@r2wc/react-to-web-component](../react-to-web-component).

## Need help or have questions?

This project is supported by [Bitovi, a React consultancy](https://www.bitovi.com/frontend-javascript-consulting/react-consulting). You can get help or ask questions on our:

- [Discord Community](https://discord.gg/J7ejFsZnJ4)
- [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting, or development. [Set up a free consultation.](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

## How it works

Under the hood, `r2wc` creates a `CustomElementConstructor` with custom getters/setters and life cycle methods that keep track of the props that you have defined. When a property is set, its custom setter:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.

# We want to hear from you.

Come chat with us about open source in our Bitovi community [Discord](https://discord.gg/J7ejFsZnJ4).

See what we're up to by following us on [Twitter](https://twitter.com/bitovi).
