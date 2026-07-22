import matchers from "@testing-library/jest-dom/matchers"
import { describe, test, it, expect, vi, afterEach } from "vitest"

import r2wc from "./core"

expect.extend(matchers)

const mount = vi.fn(() => ({ why: "context" }))
const unmount = vi.fn()
const update = vi.fn()

function wait() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe("core", () => {
  afterEach(() => {
    document.body.innerHTML = ""
  })

  it("mounts and unmounts in light mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(ReactComponent, {}, { mount, unmount, update })
    customElements.define("test-light", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  it("mounts and unmounts in open shadow mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(
      ReactComponent,
      { shadow: "open" },
      { mount, unmount, update },
    )
    customElements.define("test-shadow-open", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(element).toHaveProperty("shadowRoot")
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  it("mounts and unmounts in closed shadow mode", async () => {
    const ReactComponent: React.FC = () => <h1>Hello</h1>

    const WebComponent = r2wc(
      ReactComponent,
      { shadow: "closed" },
      { mount, unmount, update },
    )
    customElements.define("test-shadow-closed", WebComponent)

    const element = new WebComponent()

    document.body.appendChild(element)
    expect(element).toHaveProperty("shadowRoot")
    expect(mount).toBeCalledTimes(1)

    document.body.removeChild(element)
    expect(unmount).toBeCalledTimes(1)
    expect(unmount).toBeCalledWith({ why: "context" })
  })

  test("updated attribute updates the component prop and the HTMLElement property", async () => {
    interface TestProps {
      text: string
    }

    const Test: React.FC<TestProps> = ({ text }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: ["text"] },
      { mount, unmount, update },
    )

    customElements.define("test-button-element-attribute", TestElement)

    const body = document.body
    body.innerHTML =
      "<test-button-element-attribute text='hello'></test-button-element-attribute>"

    const element = body.querySelector(
      "test-button-element-attribute",
    ) as HTMLElement & { text: string }

    element.setAttribute("text", "world")

    await wait()

    expect(element.text).toBe("world")
  })

  test("updated HTMLElement property updates the component prop and the HTMLElement attribute", async () => {
    interface TestProps {
      text: string
      numProp: number
      boolProp: boolean
      arrProp: string[]
      objProp: { [key: string]: string }
      funcProp: () => void
    }

    const Test: React.FC<TestProps> = ({
      text,
      numProp,
      boolProp,
      arrProp,
      objProp,
      funcProp,
    }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      {
        props: {
          text: "string",
          numProp: "number",
          boolProp: "boolean",
          arrProp: "json",
          objProp: "json",
          funcProp: "function",
        },
      },
      { mount, unmount, update },
    )

    //@ts-ignore
    global.globalFn = function () {
      expect(true).toBe(true)
      return true
    }

    //@ts-ignore
    global.newFunc = function newFunc() {
      expect(this).toBe(document.querySelector("test-button-element-property"))
    }

    customElements.define("test-button-element-property", TestElement)

    const body = document.body
    body.innerHTML = `<test-button-element-property text='hello' obj-prop='{"greeting": "hello, world"}' arr-prop='["hello", "world"]' num-prop='240' bool-prop='true' func-prop='globalFn'>
                      </test-button-element-property>`

    const element = body.querySelector(
      "test-button-element-property",
    ) as HTMLElement & TestProps

    await wait()

    expect(element.text).toBe("hello")
    expect(element.numProp).toBe(240)
    expect(element.boolProp).toBe(true)
    expect(element.arrProp).toEqual(["hello", "world"])
    expect(element.objProp).toEqual({ greeting: "hello, world" })
    expect(element.funcProp).toBeInstanceOf(Function)
    expect(element.funcProp()).toBe(true)

    element.text = "world"
    element.numProp = 100
    element.boolProp = false
    //@ts-ignore
    element.funcProp = global.newFunc

    await wait()

    expect(element.getAttribute("text")).toBe("world")
    expect(element.getAttribute("num-prop")).toBe("100")
    expect(element.getAttribute("bool-prop")).toBe("false")
    expect(element.getAttribute("func-prop")).toBe("newFunc")
  })

  test("sets HTML property not defined in props but found on HTML object", async () => {
    interface TestProps {
      text: string
    }

    const Test: React.FC<TestProps> = ({ text = "Hello, button" }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: ["text"] },
      { mount, unmount, update },
    )

    customElements.define("test-button-element-non-prop", TestElement)

    const body = document.body
    body.innerHTML = `<test-button-element-non-prop></test-button-element-non-prop>`

    const element = body.querySelector(
      "test-button-element-non-prop",
    ) as HTMLElement & { text: string }
    element.style.backgroundColor = "red"
    element.style.visibility = "hidden"
    element.id = "test-button-id"

    await wait()

    expect(element).toHaveStyle("background-color: rgb(255, 0, 0);")
    expect(element).not.toBeVisible()
    expect(body.querySelector("#test-button-id")).toBe(element)
  })

  test("removed attribute resets the prop instead of keeping the stale value", async () => {
    interface TestProps {
      text?: string
    }

    const Test: React.FC<TestProps> = ({ text }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: { text: "string" } },
      { mount, unmount, update },
    )

    customElements.define("test-attribute-removal", TestElement)

    const body = document.body
    body.innerHTML =
      "<test-attribute-removal text='hello'></test-attribute-removal>"

    const element = body.querySelector(
      "test-attribute-removal",
    ) as HTMLElement & TestProps

    expect(element.text).toBe("hello")

    const updatesBefore = update.mock.calls.length

    element.removeAttribute("text")

    await wait()

    expect(element.text).toBe(undefined)
    expect(update.mock.calls.length).toBe(updatesBefore + 1)
    expect(update.mock.lastCall?.[1]).toMatchObject({ text: undefined })
  })

  test("empty attribute value is parsed instead of being ignored", async () => {
    interface TestProps {
      text?: string
    }

    const Test: React.FC<TestProps> = ({ text }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: { text: "string" } },
      { mount, unmount, update },
    )

    customElements.define("test-attribute-empty", TestElement)

    const body = document.body
    body.innerHTML =
      "<test-attribute-empty text='hello'></test-attribute-empty>"

    const element = body.querySelector("test-attribute-empty") as HTMLElement &
      TestProps

    const updatesBefore = update.mock.calls.length

    element.setAttribute("text", "")

    await wait()

    expect(element.text).toBe("")
    expect(update.mock.calls.length).toBe(updatesBefore + 1)
  })

  test("invalid json attribute value resets the prop instead of keeping the stale value", async () => {
    interface TestProps {
      objProp?: { greeting: string }
    }

    const Test: React.FC<TestProps> = ({ objProp }) => {
      return <button>{objProp?.greeting}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: { objProp: "json" } },
      { mount, unmount, update },
    )

    customElements.define("test-invalid-json", TestElement)

    const body = document.body
    body.innerHTML = `<test-invalid-json obj-prop='{"greeting": "hello"}'></test-invalid-json>`

    const element = body.querySelector("test-invalid-json") as HTMLElement &
      TestProps

    expect(element.objProp).toEqual({ greeting: "hello" })

    const updatesBefore = update.mock.calls.length

    element.setAttribute("obj-prop", "{not valid json")

    await wait()

    expect(element.objProp).toBe(undefined)
    expect(update.mock.calls.length).toBe(updatesBefore + 1)
  })

  test("transformer parse returning undefined resets the prop", async () => {
    interface TestProps {
      funcProp?: () => unknown
    }

    const Test: React.FC<TestProps> = () => {
      return <button>fn</button>
    }

    const TestElement = r2wc(
      Test,
      { props: { funcProp: "function" } },
      { mount, unmount, update },
    )

    //@ts-ignore
    global.existingGlobalFn = function () {
      return true
    }

    customElements.define("test-transform-undefined", TestElement)

    const body = document.body
    body.innerHTML = `<test-transform-undefined func-prop='existingGlobalFn'></test-transform-undefined>`

    const element = body.querySelector(
      "test-transform-undefined",
    ) as HTMLElement & TestProps

    expect(element.funcProp).toBeInstanceOf(Function)

    const updatesBefore = update.mock.calls.length

    // The function transformer's parse returns undefined when the global
    // lookup fails: the prop must reset rather than keep the stale function.
    element.setAttribute("func-prop", "doesNotExistAnywhere")

    await wait()

    expect(element.funcProp).toBe(undefined)
    expect(update.mock.calls.length).toBe(updatesBefore + 1)
  })

  test("setting and updating an attribute still updates the prop normally", async () => {
    interface TestProps {
      text?: string
    }

    const Test: React.FC<TestProps> = ({ text }) => {
      return <button>{text}</button>
    }

    const TestElement = r2wc(
      Test,
      { props: { text: "string" } },
      { mount, unmount, update },
    )

    customElements.define("test-attribute-normal-update", TestElement)

    const body = document.body
    body.innerHTML =
      "<test-attribute-normal-update text='hello'></test-attribute-normal-update>"

    const element = body.querySelector(
      "test-attribute-normal-update",
    ) as HTMLElement & TestProps

    expect(element.text).toBe("hello")

    element.setAttribute("text", "world")

    await wait()

    expect(element.text).toBe("world")

    element.removeAttribute("text")
    element.setAttribute("text", "back again")

    await wait()

    expect(element.text).toBe("back again")
  })
})
