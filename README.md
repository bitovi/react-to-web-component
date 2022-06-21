## Need help or have questions?

This project is supported by [Bitovi, a React Consultancy](https://www.bitovi.com/frontend-javascript-consulting/react-consulting)

- Join our [Slack](https://www.bitovi.com/community/slack)

- Follow us on [Twitter](https://twitter.com/bitovi)

Or, you can hire us for training, consulting or development.


# react-to-webcomponent

`react-to-webcomponent` converts [React](https://reactjs.org/) components to [custom elements](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements)! It lets you share react components as native elements that __don't__ require mounted being through React. The custom element acts as a wrapper for the underlying react component. Use these custom elements in any framework (vue, svelte, angular, ember, canjs) the same way you would use standard HTML elements.

`react-to-webcomponent`:

- Works in all modern browsers. (Edge needs a [customElements polyfill](https://github.com/webcomponents/polyfills/tree/master/packages/custom-elements)).
- Is `1.11KB` minified and gzipped.

## Basic Use

Given a react component like:

```js
const Greeting = ({name}) => {
  return (
    <h1>Hello, {name}</h1>
  );
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

```js
document.body.innerHTML = "<web-greeting name='Amazed'></web-greeting>";

document.body.firstChild.innerHTML //-> "<h1>Hello, Amazed</h1>"
```

### Working with External Libraries

`reactToWebComponent` also works with react components that utilize external libraries! For instance with Material-Ui:

```tsx
import { Button } from "@mui/material";
import { ThemeProvider, createTheme } from '@mui/material/styles';

interface GreetingProps {
    name: string;
    description: string;
    colorMode: "light" | "dark" | undefined;
    buttonVariant: "contained" | "text" | "outlined" | undefined;
}

export const Greeting = ({ name, description, colorMode = "light", buttonVariant = "text" }: GreetingProps) => {
    const themeMode = createTheme({
        palette: {
            mode: colorMode,
        },
    })

    return (
        <ThemeProvider theme={themeMode}>
            <main>
                <h1>Hello, {name}</h1>
                <p>{description}</p>
                <Button variant={buttonVariant}>This is the button</Button>
            </main>
        </ThemeProvider>
    );
}
```

```js
document.body.innerHTML = "<web-greeting name='Sven' description='How do you do?'></web-greeting>";
```

Using `reactToWebComponent` with a few provided attributes, while also not filling out the `colorMode` or `buttonVariant`. This will cause the component to render with [Theme Provider's Light Theme](https://mui.com/material-ui/customization/dark-mode/), and with the text variant for Material UI's [Button Component](https://mui.com/material-ui/react-button/)

If we access those attributes (`colorMode` and `buttonVariant`):

```js
document.body.innerHTML = "<web-greeting name='Sven' description='How do you do?' colorMode='dark' buttonVariant='contained'></web-greeting>";
```

The Theme Provider will use the Dark Theme instead, and the Button Component wiill use the contained variant.

Thus, using `reactToWebComponent` you can interat with React Components using Third Party Libraries with ease.

### React 18

`reactToWebComponent` now supports React 18!
To use the new render API, the only change needed is how ReactDOM is imported, the rest remains the same.

```js
import React from 'react';
import * as ReactDOM from 'react-dom/client';

const Greeting = ({ name }) => {
  return (
    <h1>Hello, {name}</h1>
  );
}

const WebGreeting = reactToWebComponent(Greeting, React, ReactDOM);

customElements.define("web-greeting", WebGreeting);
```

Please note that by using React 18, `reactToWebComponent` will use the new root API. If your application needs the legacy API, please use React 17. 


## Setup

#### From NPM

To install from npm:

```
npm i react-to-webcomponent
```

#### CodePen

[Greeting example in a CodePen](https://codepen.io/justinbmeyer/pen/gOYrQax?editors=1010)

#### Bundled JS file available

[https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js](https://unpkg.com/react-to-webcomponent/dist/react-to-webcomponent.js)

## API

`reactToWebComponent(ReactComponent, React, ReactDOM, options)` takes the following:

- `ReactComponent` - A react component that you want to
  convert to a Web Component.
- `React` - A version of React (or [preact-compat](https://preactjs.com/guide/v10/switching-to-preact)) the
  component works with.
- `ReactDOM` - A version of ReactDOM (or preact-compat) that the component works with.
- `options` - An optional set of parameters.
- `options.shadow` - Use shadow DOM rather than light DOM.
- `options.dashStyleAttributes` - convert dashed-attirbutes on the web component into camelCase props for the react component

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

Using dashStyleAttributes to convert dashed-attributes into camelCase react props

```js
class Greeting extends React.Component {
  render () { return <h1>Hello, { this.props.camelCaseName }</h1>; }
}
Greeting.propTypes = {
  camelCaseName: PropTypes.string.isRequired
};

customElements.define(
  "my-dashed-style-greeting",
  reactToWebComponent(Greeting, React, ReactDOM, { dashStyleAttributes: true })
);

document.body.innerHTML = "<my-dashed-style-greeting camel-case-name='Christopher'></my-dashed-style-greetingg>";

console.log(document.body.firstElementChild.innerHTML) // "<h1>Hello, Christopher</h1>"
```

### How it works

`reactToWebComponent` creates a constructor function whose prototype is a [Proxy](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). This acts as a trap for any property set on instances of the custom element. When a property is set, the proxy:

- re-renders the React component inside the custom element.
- creates an enumerable getter / setter on the instance
  to save the set value and avoid hitting the proxy in the future.

Also:

- Enumerable properties and values on the custom element are used as the `props` passed to the React component.
- The React component is not rendered until the custom element is inserted into the page.
