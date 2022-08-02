import { test, assert, expect, beforeEach } from "vitest"

import React from "react"
import * as ReactDOM from "react-dom/client"

import PropTypes from "prop-types"

import stache from "can-stache"
import stacheBindings from "can-stache-bindings"
stache.addBindings(stacheBindings)

import reactToWebComponent from "src/react-to-webcomponent"

beforeEach(() => {
  document.body.innerHTML = ""
})

test("basics with react", () => {
  const Welcome = ({ name }) => {
    return <h1>Hello, {name}</h1>
  }

  const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM)
  customElements.define("my-welcome", MyWelcome)

  const myWelcome = new MyWelcome()

  document.getElementsByTagName("body")[0].appendChild(myWelcome)

  expect(myWelcome.nodeName).toEqual("MY-WELCOME")
})

test("works with attributes set with propTypes", async () => {
  expect.assertions(1)
  function Greeting({ name }) {
    return <h1>Hello, {name}</h1>
  }

  Greeting.propTypes = {
    name: PropTypes.string.isRequired,
  }

  const MyGreeting = reactToWebComponent(Greeting, React, ReactDOM)
  customElements.define("my-greeting", MyGreeting)

  console.error = function (...messages) {
    assert.ok(
      messages.some((message) => message.includes("required")),
      "got a warning with required",
    )
  }

  const body = document.body
  body.innerHTML = "<my-greeting name='Christopher'></my-greeting>"

  await new Promise((r) => {
    setTimeout(() => {
      expect(body.firstElementChild.innerHTML).toEqual(
        "<h1>Hello, Christopher</h1>",
      )
      r()
    }, 0)
  })
})

test("works within can-stache and can-stache-bindings (propTypes are writable)", async () => {
  expect.assertions(3)

  function Welcome({ user }) {
    return <h1>Hello, {user.name}</h1>
  }

  Welcome.propTypes = {
    user: PropTypes.object,
  }

  const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM)

  customElements.define("can-welcome", MyWelcome)

  const view = stache("<can-welcome user:from='this.person'/>")
  const frag = view({
    person: { name: "Bohdi" },
  })

  const body = document.body
  const myWelcome = frag.firstElementChild
  body.appendChild(frag)

  await new Promise((r) => {
    setTimeout(() => {
      expect(myWelcome.nodeName).toEqual("CAN-WELCOME")
      expect(myWelcome.childNodes.length).toEqual(1)
      expect(myWelcome.childNodes[0].innerHTML).toEqual("Hello, Bohdi")
      r()
    }, 100)
  })
})

test("works with shadow DOM `options.shadow === true`", async () => {
  expect.assertions(5)

  function Welcome({ name }) {
    return <h1>Hello, {name}</h1>
  }

  Welcome.propTypes = {
    user: PropTypes.string,
  }

  const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM, {
    shadow: true,
  })

  customElements.define("my-shadow-welcome", MyWelcome)

  const body = document.body
  const myWelcome = new MyWelcome()
  body.appendChild(myWelcome)

  await new Promise((r) => {
    setTimeout(() => {
      expect(myWelcome.shadowRoot).not.toEqual(undefined)
      expect(myWelcome.shadowRoot.children.length).toEqual(1)

      let child = myWelcome.shadowRoot.childNodes[0]

      expect(child.tagName).toEqual("H1")
      expect(child.innerHTML).toEqual("Hello, ")

      myWelcome.name = "Justin"
      child = myWelcome.shadowRoot.childNodes[0]
      setTimeout(() => {
        expect(child.innerHTML, "Hello, Justin")
        r()
      }, 0)
    }, 0)
  })
})

test('It works without shadow option set to "true"', async () => {
  expect.assertions(1)

  function Welcome({ name }) {
    return <h1>Hello, {name}</h1>
  }

  Welcome.propTypes = {
    user: PropTypes.string,
  }

  const MyWelcome = reactToWebComponent(Welcome, React, ReactDOM)

  customElements.define("my-noshadow-welcome", MyWelcome)

  const body = document.body

  const myWelcome = new MyWelcome()
  body.appendChild(myWelcome)

  await new Promise((r) => {
    setTimeout(() => {
      expect(myWelcome.shadowRoot).toEqual(null)
      r()
    }, 0)
  })
})

test('It works with dashed attributes styled set to "true"', async () => {
  expect.assertions(1)

  function Greeting({ camelCaseName }) {
    return <h1>Hello, {camelCaseName}</h1>
  }

  Greeting.propTypes = {
    camelCaseName: PropTypes.string.isRequired,
  }

  const MyGreeting = reactToWebComponent(Greeting, React, ReactDOM, {
    dashStyleAttributes: true,
  })

  customElements.define("my-dashed-style-greeting", MyGreeting)

  const body = document.body

  const myGreeting = new MyGreeting()

  console.error = function (...messages) {
    assert.ok(
      messages.some((message) => message.includes("required")),
      "got a warning with required",
    )
  }

  body.appendChild(myGreeting)

  body.innerHTML =
    "<my-dashed-style-greeting camel-case-name='Christopher'></my-dashed-style-greeting>"

  await new Promise((r) => {
    setTimeout(() => {
      expect(body.firstElementChild.innerHTML).toEqual(
        "<h1>Hello, Christopher</h1>",
      )
      r()
    }, 0)
  })
})

test("mounts and unmounts underlying react component", async () => {
  expect.assertions(2)

  class RCom extends React.Component {
    componentDidMount() {
      expect(true)
    }

    componentWillUnmount() {
      expect(true)
    }

    render() {
      return <h1>Hello, Goodbye</h1>
    }
  }

  class WebCom extends reactToWebComponent(RCom, React, ReactDOM) {}
  customElements.define("mount-unmount", WebCom)
  const webCom = new WebCom()

  const body = document.body

  await new Promise((r) => {
    setTimeout(() => {
      body.appendChild(webCom)
      setTimeout(() => {
        body.removeChild(webCom)
        r()
      })
    }, 0)
  })
})
