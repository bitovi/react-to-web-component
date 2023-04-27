import matchers from "@testing-library/jest-dom/matchers"
import { describe, test, expect, vi, afterEach } from "vitest"
import React from "react"
import r2wc from "."

expect.extend(matchers)

// mock renderer
const mount = vi.fn()
const unmount = vi.fn()
const onUpdated = vi.fn()

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe("r2wc core", () => {
  afterEach(() => {
    // reset DOM
    document.body.innerHTML = ""
    // reset mock
    mount.mockReset()
    unmount.mockReset()
    onUpdated.mockReset()
  })
  test("mount and unmount is called in functional component", async () => {
    function TestComponent() {
      return <div>hello</div>
    }
    const body = document.body

    const TestElement = r2wc(TestComponent, {}, { mount, unmount })
    customElements.define("test-func-element", TestElement)

    const testEl = new TestElement()

    body.appendChild(testEl)

    expect(mount).toBeCalledTimes(1)

    body.removeChild(testEl)

    expect(unmount).toBeCalledTimes(1)
  })

  test("mount and unmount is called in class component", async () => {
    class TestClassComponent extends React.Component {
      render() {
        return <div>hello</div>
      }
    }
    const body = document.body
    class TestClassElement extends r2wc(
      TestClassComponent,
      {},
      {
        mount,
        unmount,
      },
    ) {}

    customElements.define("test-class-element", TestClassElement)

    const testEl = new TestClassElement()

    body.appendChild(testEl)

    expect(mount).toBeCalledTimes(1)

    body.removeChild(testEl)

    expect(unmount).toBeCalledTimes(1)
  })

  test("updated attribute updates the component prop and the HTMLElement property", async () => {
    function Button({ text }: { text: string }) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      Button,
      { props: ["text"] },
      { mount, unmount, onUpdated },
    )

    customElements.define("test-button-element-attribute", ButtonElement)

    const body = document.body
    body.innerHTML =
      "<test-button-element-attribute text='hello'></test-button-element-attribute>"

    const testEl = body.querySelector(
      "test-button-element-attribute",
    ) as HTMLElement & { text: string }

    testEl.setAttribute("text", "world")

    await flushPromises()

    expect(onUpdated).toBeCalledTimes(1)
    expect(testEl.text).toBe("world")
  })

  test("updated HTMLElement property updates the component prop and the HTMLElement attribute", async () => {
    interface Props {
      text: string
      numProp: number
      boolProp: boolean
      arrProp: string[]
      objProp: { [key: string]: string }
      funcProp: () => void
    }

    function ButtonWithDifferentPropTypes({
      text,
      numProp,
      boolProp,
      arrProp,
      objProp,
      funcProp,
    }: Props) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      ButtonWithDifferentPropTypes,
      {
        props: {
          text: String,
          numProp: Number,
          boolProp: Boolean,
          arrProp: Array,
          objProp: Object,
          funcProp: Function,
        },
      },
      { mount, unmount, onUpdated },
    )

    global.globalFn = function () {
      expect(true).toBe(true)
      return true
    }

    customElements.define("test-button-element-property", ButtonElement)

    const body = document.body
    body.innerHTML = `<test-button-element-property text='hello' obj-prop='{"greeting": "hello, world"}' arr-prop='["hello", "world"]' num-prop='240' bool-prop='true' func-prop='globalFn'>
                      </test-button-element-property>`

    const testEl = body.querySelector(
      "test-button-element-property",
    ) as HTMLElement & Props

    await flushPromises()

    expect(testEl.text).toBe("hello")
    expect(testEl.numProp).toBe(240)
    expect(testEl.boolProp).toBe(true)
    expect(testEl.arrProp).toEqual(["hello", "world"])
    expect(testEl.objProp).toEqual({ greeting: "hello, world" })
    expect(testEl.funcProp).toBeInstanceOf(Function)
    expect(testEl.funcProp()).toBe(true)

    testEl.text = "world"
    testEl.numProp = 100
    testEl.boolProp = false

    await flushPromises()

    expect(onUpdated).toBeCalledTimes(3)
    expect(testEl.getAttribute("text")).toBe("world")
    expect(testEl.getAttribute("num-prop")).toBe("100")
    expect(testEl.getAttribute("bool-prop")).toBe("false")
  })

  test("sets HTML property not defined in props but found on HTML object", async () => {
    function Button({ text = "Hello, button" }: { text: string }) {
      return <button>{text}</button>
    }

    const ButtonElement = r2wc(
      Button,
      { props: ["text"] },
      { mount, unmount, onUpdated },
    )

    customElements.define("test-button-element-non-prop", ButtonElement)

    const body = document.body
    body.innerHTML = `<test-button-element-non-prop></test-button-element-non-prop>`

    const testEl = body.querySelector(
      "test-button-element-non-prop",
    ) as HTMLElement & { text: string }
    testEl.style.backgroundColor = "red"
    testEl.style.visibility = "hidden"
    testEl.id = "test-button-id"

    await flushPromises()

    expect(testEl).toHaveStyle("background-color: red;")
    expect(testEl).not.toBeVisible()
    expect(body.querySelector("#test-button-id")).toBe(testEl)
  })
})
