/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, assert } from "vitest"
import matchers from "@testing-library/jest-dom/matchers"

import r2wc from "./react-to-web-component"
import React from "react"

expect.extend(matchers)

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

const Greeting = ({ name }: { name: string }) => <h1>Hello, {name}</h1>

describe("react", () => {
  it("basics with react", () => {
    const MyWelcome = r2wc(Greeting)
    customElements.define("my-welcome", MyWelcome)

    const myWelcome = new MyWelcome()

    document.getElementsByTagName("body")[0].appendChild(myWelcome)

    expect(myWelcome.nodeName).toEqual("MY-WELCOME")
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
        stringProp: String,
        numProp: Number,
        floatProp: Number,
        trueProp: Boolean,
        falseProp: Boolean,
        arrayProp: Array,
        objProp: Object,
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

  it("Props typed as 'ref' work with functional components", async () => {
    expect.assertions(5)

    type TestRef = {
      tag: string
      setTag: React.Dispatch<React.SetStateAction<string>>
    }

    const RCom = React.forwardRef<
      TestRef,
      { h1Ref: React.RefObject<HTMLButtonElement> }
    >(function RCom(props, ref) {
      const [tag, setTag] = React.useState("h1")
      React.useImperativeHandle(ref, () => ({
        tag,
        setTag,
      }))
      return (
        <button ref={props.h1Ref} onClick={() => setTag("h2")}>
          Ref, {tag}
        </button>
      )
    })

    class WebCom extends r2wc(RCom, {
      props: {
        ref: "ref",
        h1Ref: "ref",
      },
    }) {}

    customElements.define("ref-test-func", WebCom)

    const body = document.body

    await new Promise((r) => {
      body.innerHTML = "<ref-test-func ref h1-ref></ref-test-func>"

      setTimeout(() => {
        const el = document.querySelector("ref-test-func") as HTMLElement & {
          ref: React.RefObject<TestRef>
          h1Ref: React.RefObject<HTMLButtonElement>
        }
        expect(el.ref.current?.tag).toEqual("h1")
        expect(typeof el.ref.current?.setTag).toEqual("function")
        const button = document.querySelector(
          "ref-test-func button",
        ) as HTMLButtonElement
        expect(el.h1Ref.current).toEqual(button)
        button?.click()
        setTimeout(() => {
          expect(el.ref.current?.tag).toEqual("h2")
          expect(button.innerHTML).toEqual("Ref, h2")
          r(true)
        }, 0)
      }, 0)
    })
  })

  it("Props typed as 'ref' work with class components", async () => {
    expect.assertions(3)

    type TestClassProps = {
      h1Ref: React.RefObject<HTMLButtonElement>
    }

    class RCom extends React.Component<TestClassProps, { tag: string }> {
      constructor(props: TestClassProps) {
        super(props)
        this.state = { tag: "h1" }
      }
      render() {
        const Tag = this.state.tag
        return (
          <button
            ref={this.props.h1Ref}
            onClick={() => this.setState({ tag: "h2" })}
          >
            Ref, {Tag}
          </button>
        )
      }
    }

    class WebCom extends r2wc(RCom, {
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
        const el = document.querySelector("ref-test") as HTMLElement & {
          ref: React.RefObject<HTMLElement>
          h1Ref: React.RefObject<HTMLButtonElement>
        }
        expect(el?.ref.current instanceof RCom).toEqual(true)
        const button = document.querySelector(
          "ref-test button",
        ) as HTMLButtonElement
        expect(el.h1Ref.current).toEqual(button)
        button.click()
        setTimeout(() => {
          expect(button.innerHTML).toEqual("Ref, h2")
          r(true)
        }, 0)
      }, 0)
    })
  })
})
