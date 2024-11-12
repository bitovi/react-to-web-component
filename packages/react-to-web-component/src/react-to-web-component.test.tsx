/* eslint-disable @typescript-eslint/no-explicit-any */
import matchers from "@testing-library/jest-dom/matchers"
import PropTypes from "prop-types"
import React from "react"
import { describe, it, expect, assert } from "vitest"

import r2wc from "./react-to-web-component"

expect.extend(matchers)

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

const Greeting: React.FC<{ name: string }> = ({ name }) => (
  <h1>Hello, {name}</h1>
)

describe("react-to-web-component 1", () => {
  it("basics with react", () => {
    const MyWelcome = r2wc(Greeting)
    customElements.define("my-welcome", MyWelcome)

    const myWelcome = new MyWelcome()

    document.getElementsByTagName("body")[0].appendChild(myWelcome)

    expect(myWelcome.nodeName).toEqual("MY-WELCOME")
  })

  it("works with props array", async () => {
    function TestComponent({ name }: { name: string }) {
      return <div>hello, {name}</div>
    }

    const TestElement = r2wc(TestComponent, { props: ["name"] })

    customElements.define("test-hello", TestElement)

    const body = document.body
    body.innerHTML = "<test-hello name='Bavin'></test-hello>"

    await flushPromises()

    const div = body.querySelector("div")
    expect(div?.textContent).toBe("hello, Bavin")
  })

  it("works with proptypes", async () => {
    function WithProptypes({ name }: { name: string }) {
      return <div>hello, {name}</div>
    }

    WithProptypes.propTypes = {
      name: PropTypes.string.isRequired,
    }

    const WithPropTypesElement = r2wc(WithProptypes)

    customElements.define("with-proptypes", WithPropTypesElement)

    const body = document.body
    body.innerHTML = "<with-proptypes name='Bavin'></with-proptypes>"

    await flushPromises()

    const div = body.querySelector("div")
    expect(div?.textContent).toBe("hello, Bavin")
  })

  it("works with class components", async () => {
    class TestClassComponent extends React.Component<{ name: string }> {
      render() {
        return <div>hello, {this.props.name}</div>
      }
    }

    class TestClassElement extends r2wc(TestClassComponent, {
      props: ["name"],
    }) {}

    customElements.define("test-class", TestClassElement)

    const body = document.body
    body.innerHTML = "<test-class name='Bavin'></test-class>"

    await flushPromises()

    const div = body.querySelector("div")
    const testClassEl = body.querySelector("test-class")

    expect(testClassEl).toBeInstanceOf(TestClassElement)
    expect(div?.textContent).toBe("hello, Bavin")
  })

  it("works with shadow DOM `options.shadow === 'open'`", async () => {
    expect.assertions(5)

    const MyWelcome = r2wc(Greeting, {
      shadow: "open",
    })

    customElements.define("my-shadow-welcome", MyWelcome)

    const body = document.body
    const myWelcome = new MyWelcome() as HTMLElement & { name: string }
    body.appendChild(myWelcome)

    await flushPromises()

    expect(myWelcome.shadowRoot).not.toEqual(undefined)
    expect(myWelcome.shadowRoot?.children.length).toEqual(1)

    const child = myWelcome.shadowRoot?.childNodes[0] as HTMLElement

    expect(child.tagName).toEqual("H1")
    expect(child.innerHTML).toEqual("Hello, ")

    myWelcome.name = "Justin"

    await flushPromises()

    expect(child.innerHTML, "Hello, Justin")
  })

  it('It works without shadow option set to "true"', async () => {
    expect.assertions(1)

    const MyWelcome = r2wc(Greeting)

    customElements.define("my-noshadow-welcome", MyWelcome)

    const body = document.body

    const myWelcome = new MyWelcome()
    body.appendChild(myWelcome)

    await new Promise((resolve) => {
      setTimeout(() => {
        expect(myWelcome.shadowRoot).toEqual(null)
        resolve(true)
      }, 0)
    })
  })

  it("It converts dashed-attributes to camelCase", async () => {
    expect.assertions(1)

    const CamelCaseGreeting = ({
      camelCaseName,
    }: {
      camelCaseName: string
    }) => <h1>Hello, {camelCaseName}</h1>

    const MyGreeting = r2wc(CamelCaseGreeting, { props: ["camelCaseName"] })

    customElements.define("my-dashed-style-greeting", MyGreeting)

    const body = document.body

    console.error = function (...messages) {
      assert.ok(
        messages.some((message) => message.includes("required")),
        "got a warning with required",
      )
    }

    body.innerHTML =
      "<my-dashed-style-greeting camel-case-name='Christopher'></my-dashed-style-greeting>"

    await flushPromises()

    expect(body.firstElementChild?.innerHTML).toEqual(
      "<h1>Hello, Christopher</h1>",
    )
  })

  it("options.props can specify and will convert the String attribute value into Number, Boolean, Array, and/or Object", async () => {
    expect.assertions(12)

    type CastinProps = {
      stringProp: string
      numProp: number
      floatProp: number
      trueProp: boolean
      falseProp: boolean
      arrayProp: any[]
      objProp: object
    }

    const global = window as any

    function OptionsPropsTypeCasting({
      stringProp,
      numProp,
      floatProp,
      trueProp,
      falseProp,
      arrayProp,
      objProp,
    }: CastinProps) {
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

    const WebOptionsPropsTypeCasting = r2wc(OptionsPropsTypeCasting, {
      props: {
        stringProp: "string",
        numProp: "number",
        floatProp: "number",
        trueProp: "boolean",
        falseProp: "boolean",
        arrayProp: "json",
        objProp: "json",
      },
    })

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

    await flushPromises()
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

  it("Props typed as Function convert the string value of attribute into global fn calls bound to the webcomponent instance", async () => {
    expect.assertions(2)

    const global = window as any

    function ThemeSelect({
      handleClick,
    }: {
      handleClick: (arg: string) => void
    }) {
      return (
        <div>
          <button onClick={() => handleClick("V")}>V</button>
          <button onClick={() => handleClick("Johnny")}>Johnny</button>
          <button onClick={() => handleClick("Jane")}>Jane</button>
        </div>
      )
    }

    const WebThemeSelect = r2wc(ThemeSelect, {
      props: {
        handleClick: "function",
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
        r(true)
      }, 1000)

      global.globalFn = function (selected: string) {
        delete global.globalFn
        clearTimeout(failUnlessCleared)
        expect(selected).toEqual("Jane")
        expect(this).toEqual(document.querySelector("theme-select"))
        r(true)
      }

      body.innerHTML = "<theme-select handle-click='globalFn'></theme-select>"

      setTimeout(() => {
        const button = document.querySelector(
          "theme-select button:last-child",
        ) as HTMLButtonElement
        button.click()
      }, 0)
    })
  })

  it("Props typed as Function are dispatching events when events are enables via options", async () => {
    expect.assertions(2)

    function ThemeSelect({ onSelect }: { onSelect: (arg: string) => void }) {
      return (
        <div>
          <button onClick={() => onSelect("V")}>V</button>
          <button onClick={() => onSelect("Johnny")}>Johnny</button>
          <button onClick={() => onSelect("Jane")}>Jane</button>
        </div>
      )
    }

    const WebThemeSelect = r2wc(ThemeSelect, {
      events: { onSelect: { bubbles: true } },
    })
    customElements.define("theme-select-events", WebThemeSelect)
    document.body.innerHTML = "<theme-select-events></theme-select-events>"

    await new Promise((resolve, reject) => {
      const failUnlessCleared = setTimeout(() => {
        reject("event listener was not called to clear the failure timeout")
      }, 1000)

      const element = document.querySelector("theme-select-events")
      element?.addEventListener("select", (event) => {
        clearTimeout(failUnlessCleared)
        expect((event as CustomEvent).detail).toEqual("Jane")
        expect(event.target).toEqual(element)
        resolve(true)
      })
      const button = element?.querySelector(
        "button:last-child",
      ) as HTMLButtonElement
      button.click()
    })
  })
})
