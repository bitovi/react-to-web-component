## Programatic and Declaritive usage:

You can use `<web-greeting>` programatically:

```js
const webGreeting = document.createElement("web-greeting")
webGreeting.name = "Justin"

document.body.append(webGreeting)

webGreeting.innerHTML //-> "<h1>Hello, Justin</h1>"
```

Or you can use it declaratively:

```js
document.body.innerHTML = "<web-greeting></web-greeting>"

document.body.firstChild.name = "I do declare"

document.body.firstChild.innerHTML //-> "<h1>Hello, I do declare</h1>"
```
