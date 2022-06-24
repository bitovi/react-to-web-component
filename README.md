# Contact Bitovi
[Join our Slack](https://www.bitovi.com/community/slack)
[Follow us on Twitter](https://twitter.com/bitovi)
[Need help, you can hire us](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

# react-to-webcomponent

`react-to-webcomponent` converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share react components as native elements that __don't__ require mounted being through React. The custom element acts as a wrapper for the underlying react component. Use these custom elements with any project that uses HTML even in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

`react-to-webcomponent`:

- Works in all modern browsers. (Edge needs a [customElements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)).
- Is `1.11KB` minified and gzipped.

## Basic Usage

For basic usage, we will use this simple react component:

```js
import React from 'react';
import * as ReactDOM from 'react-dom/client'; 
// When using React 16 and 17 import ReactDom with the commented statement below instead:
// import ReactDom from 'react-dom'

const Greeting = ({name}) => {
  return (
    <h1>Hello, {name}</h1>
  );
}
```

With our React component complete, all we have to do is call `reactToWebComponent` and [customElements.define](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define) to create and define our custom element:

```js
import reactToWebComponent from "react-to-webcomponent";

const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM);

customElements.define("web-greeting", WebGreeting);
```

Now we can use `<web-greeting>` like any other HTML element!

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting></web-greeting>
</body>
```

Note that by using React 18, `reactToWebComponent` will use the new root API. If your application needs the legacy API, please use React 17 


In the above case, the web-greeting custom element is not making use of the ```name``` property from our ```Greeting``` component. 

## Working with Attributes

By default, custom elements created by `reactToWebComponent` only
pass properties to the underlying React component. To make attributes
work, you must specify your component's properties with
[PropTypes](https://reactjs.org/docs/typechecking-with-proptypes.html) as follows:

```js
import React from 'react';
import * as ReactDOM from 'react-dom/client';
// When using React 16 and 17 import ReactDom with the commented statement below instead:
// import ReactDom from 'react-dom'

const Greeting = ({ name }) => {
  return (
    <h1>Hello, {name}</h1>
  );
}

Greeting.propTypes = {
  name: PropTypes.string.isRequired
};
```

Now `reactToWebComponent` will know to look for `name` attributes
as follows:

```html
<body>
  <h1>Greeting Demo</h1>

  <web-greeting name="Justin"></web-greeting>
</body>
```

For programatic and declarative demos, [view this example doc](docs/programaticUsage.md).

For a more complete example using a third party library, [view this complete example](docs/completeExample.md).

## Setup

To install from npm:

```
npm i react-to-webcomponent
```

## External Examples

[Greeting example in a CodePen](https://codepen.io/justinbmeyer/pen/gOYrQax?editors=1010)

## Bundled JS file available

[https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js](https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js)

## How it works

The full API details can be viewed [here](docs/api.md).

`reactToWebComponent` creates a constructor function whose prototype is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This acts as a trap for any property set on instances of the custom element. When a property is set, the proxy:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance
  to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.
