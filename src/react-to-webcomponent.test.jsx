import { test, assert, expect, beforeEach } from "vitest"

import React from "react"
import * as ReactDOM from "react-dom/client"

import PropTypes from "prop-types"

import stache from "can-stache"
import stacheBindings from "can-stache-bindings"
stache.addBindings(stacheBindings)

import reactToWebComponent from "src/react-to-webcomponent"

const reactEnv = __dirname.replace(/.*?([^\\\/]+\d+).*/g, "$1")
// reactEnv = "react16" | "react17" | "react18" | "preact10"

const requeueIfTruthy = (fn, maxChecks = 100) => {
  let runCount = 0
  return new Promise((r) => {
    const waitInterval = setInterval(() => {
      try {
        const requeue = fn()
        runCount++
        if (!requeue) {
          clearInterval(waitInterval)
          r(runCount)
        } else if (runCount >= maxChecks) {
          clearInterval(waitInterval)
          console.log(
            "Max truthy checks reached, test never became ready:",
            fn.toString(),
            { reactEnv, runCount, maxChecks },
          )
          r(runCount)
        }
      } catch (err) {
        clearInterval(waitInterval)
        console.log("!! Threw at requeue function: ", fn.toString(), {
          reactEnv,
          runCount,
          maxChecks,
          err,
        })
        setTimeout(() => {
          throw err // wait until next frame to rethrow or else the console log information above gets swallowed
        }, 0)
      }
    }, 0)
  })
}

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

  await requeueIfTruthy(() => {
    if (!body.firstElementChild.innerHTML) {
      return true
    }
    expect(body.firstElementChild.innerHTML).toEqual(
      "<h1>Hello, Christopher</h1>",
    )
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

  await requeueIfTruthy(() => {
    if (!myWelcome.innerHTML.length) {
      return true
    }
    expect(myWelcome.nodeName).toEqual("CAN-WELCOME")
    expect(myWelcome.childNodes.length).toEqual(1)
    expect(myWelcome.children[0].innerHTML).toEqual("Hello, Bohdi")
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

  await requeueIfTruthy(() => {
    if (!myWelcome.shadowRoot || !myWelcome.shadowRoot.children.length) {
      return true
    }
    expect(myWelcome.shadowRoot).not.toEqual(undefined)
    expect(myWelcome.shadowRoot.children.length).toEqual(1)

    const child = myWelcome.shadowRoot.childNodes[0]

    expect(child.tagName).toEqual("H1")
    expect(child.innerHTML).toEqual("Hello, ")

    myWelcome.name = "Justin"
  })

  await requeueIfTruthy(() => {
    const child = myWelcome.shadowRoot.childNodes[0]
    if (!child.innerHTML) {
      return true
    }
    expect(child.innerHTML, "Hello, Justin")
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

test("It converts dashed-attributes to camelCase", async () => {
  expect.assertions(1)

  function Greeting({ camelCaseName }) {
    return <h1>Hello, {camelCaseName}</h1>
  }

  Greeting.propTypes = {
    camelCaseName: PropTypes.string.isRequired,
  }

  const MyGreeting = reactToWebComponent(Greeting, React, ReactDOM, {})

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

  await requeueIfTruthy(() => {
    if (!body.firstElementChild.innerHTML) {
      return true
    }
    expect(body.firstElementChild.innerHTML).toEqual(
      "<h1>Hello, Christopher</h1>",
    )
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

test("options.props can be used as an array of props instead of relying on keys from propTypes", async () => {
  expect.assertions(1)

  function PropTypesNotRequired({ greeting, camelCaseName }) {
    return (
      <h1>
        {greeting}, {camelCaseName}
      </h1>
    )
  }

  const WebPropTypesNotRequired = reactToWebComponent(
    PropTypesNotRequired,
    React,
    ReactDOM,
    {
      props: ["greeting", "camelCaseName"],
    },
  )

  customElements.define("web-proptypes-not-required", WebPropTypesNotRequired)

  const body = document.body

  body.innerHTML =
    "<web-proptypes-not-required greeting='Ayy' camel-case-name='lmao'></web-proptypes-not-required>"

  await requeueIfTruthy(() => {
    if (!body.firstElementChild.innerHTML) {
      return true
    }
    expect(body.firstElementChild.innerHTML).toEqual("<h1>Ayy, lmao</h1>")
  })
})

test("options.props can specify and will convert the String attribute value into Number, Boolean, Array, and/or Object", async () => {
  expect.assertions(12)

  function OptionsPropsTypeCasting({
    stringProp,
    numProp,
    floatProp,
    trueProp,
    falseProp,
    arrayProp,
    objProp,
  }) {
    global.castedValues = {
      stringProp,
      numProp,
      floatProp,
      trueProp,
      falseProp,
      arrayProp,
      objProp,
    }
    return <h1>{stringProp}</h1>
  }

  OptionsPropsTypeCasting.propTypes = {
    stringProp: PropTypes.string.isRequired,
    numProp: PropTypes.number.isRequired,
    floatProp: PropTypes.number.isRequired,
    trueProp: PropTypes.bool.isRequired,
    falseProp: PropTypes.bool.isRequired,
    arrayProp: PropTypes.array.isRequired,
    objProp: PropTypes.object.isRequired,
  }

  const WebOptionsPropsTypeCasting = reactToWebComponent(
    OptionsPropsTypeCasting,
    React,
    ReactDOM,
    {
      props: {
        stringProp: String,
        numProp: Number,
        floatProp: Number,
        trueProp: Boolean,
        falseProp: Boolean,
        arrayProp: Array,
        objProp: Object,
      },
    },
  )

  customElements.define("attr-type-casting", WebOptionsPropsTypeCasting)

  const body = document.body

  console.error = function (...messages) {
    // propTypes will throw if any of the types passed into the underlying react component are wrong or missing
    expect("propTypes should not have thrown").toEqual(messages.join(""))
  }

  body.innerHTML = `
    <attr-type-casting
      string-prop="iloveyou"
      num-prop="360"
      float-prop="0.5"
      true-prop="true"
      false-prop="false"
      array-prop='[true, 100.25, "👽", { "aliens": "welcome" }]'
      obj-prop='{ "very": "object", "such": "wow!" }'
    ></attr-type-casting>
  `

  await requeueIfTruthy(() => {
    if (!body.firstElementChild.innerHTML) {
      return true
    }
    const {
      stringProp,
      numProp,
      floatProp,
      trueProp,
      falseProp,
      arrayProp,
      objProp,
    } = global.castedValues
    expect(stringProp).toEqual("iloveyou")
    expect(numProp).toEqual(360)
    expect(floatProp).toEqual(0.5)
    expect(trueProp).toEqual(true)
    expect(falseProp).toEqual(false)
    expect(arrayProp.length).toEqual(4)
    expect(arrayProp[0]).toEqual(true)
    expect(arrayProp[1]).toEqual(100.25)
    expect(arrayProp[2]).toEqual("👽")
    expect(arrayProp[3].aliens).toEqual("welcome")
    expect(objProp.very).toEqual("object")
    expect(objProp.such).toEqual("wow!")
  })
})

test("Props typed as Function convert the string value of attribute into global fn calls bound to the webcomponent instance", async () => {
  expect.assertions(2)

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
    props: {
      handleClick: Function,
    },
  })

  customElements.define("theme-select", WebThemeSelect)

  const body = document.body

  await new Promise((r) => {
    const failUnlessCleared = setTimeout(() => {
      delete global.globalFn
      expect("globalFn was not called to clear the failure timeout").toEqual(
        "not to fail because globalFn should have been called to clear the failure timeout",
      )
      r()
    }, 1000)

    global.globalFn = function (selected) {
      delete global.globalFn
      clearTimeout(failUnlessCleared)
      expect(selected).toEqual("Jane")
      expect(this).toEqual(document.querySelector("theme-select"))
      r()
    }

    body.innerHTML = "<theme-select handle-click='globalFn'></theme-select>"

    setTimeout(() => {
      document.querySelector("theme-select button:last-child").click()
    }, 0)
  })
})

test("Props typed as 'ref' work", async () => {
  expect.assertions(8)

  class RCom extends React.Component {
    constructor(props) {
      super(props)
      this.state = { tag: "h1" }
    }
    render() {
      const Tag = this.state.tag
      return (
        <Tag
          ref={this.props.h1Ref}
          onClick={() => this.setState({ tag: "h2" })}
        >
          Ref
        </Tag>
      )
    }
  }

  class WebCom extends reactToWebComponent(RCom, React, ReactDOM, {
    props: {
      ref: "ref",
      h1Ref: "ref",
    },
  }) {}

  customElements.define("ref-test", WebCom)

  const body = document.body

  await new Promise((r) => {
    body.innerHTML = "<ref-test ref h1-ref></ref-test>"

    setTimeout(() => {
      const el = document.querySelector("ref-test")
      expect(el.ref.current instanceof RCom).toEqual(true)
      const h1 = document.querySelector("ref-test h1")
      expect(el.h1Ref.current).toEqual(h1)
      h1.click()
      setTimeout(() => {
        const h2 = document.querySelector("ref-test h2")
        expect(el.h1Ref.current).not.toEqual(h1)
        expect(el.h1Ref.current).toEqual(h2)
        r()
      }, 0)
    }, 0)
  })

  await new Promise((r) => {
    const failUnlessCleared = setTimeout(() => {
      delete global.globalRefFn
      expect("globalRefFn was not called to clear the failure timeout").toEqual(
        "not to fail because globalRefFn should have been called to clear the failure timeout",
      )
      r()
    }, 1000)

    global.globalRefFn = function (el) {
      if (!el) {
        // null before it switches to h2
        return
      }
      expect(this).toEqual(document.querySelector("ref-test"))
      expect(el).toEqual(this.querySelector("h1, h2"))
      if (el.tagName.toLowerCase() === "h1") {
        el.click()
      } else {
        delete global.globalRefFn
        clearTimeout(failUnlessCleared)
        r()
      }
    }

    body.innerHTML = "<ref-test h1-ref='globalRefFn'></ref-test>"
  })
})
