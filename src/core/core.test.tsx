import { describe, test, expect, vi, afterEach } from "vitest"
import React from "react"
import r2wc from "."

// mock renderer
const mount = vi.fn()
const unmount = vi.fn()

describe("r2wc core", () => {
  afterEach(() => {
    // reset DOM
    document.body.innerHTML = ""
    // reset mock
    mount.mockReset()
    unmount.mockReset()
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
    class TestClassElement extends r2wc(TestClassComponent, {}, {
      mount,
      unmount,
    }) {}

    customElements.define("test-class-element", TestClassElement)

    const testEl = new TestClassElement()

    body.appendChild(testEl)

    expect(mount).toBeCalledTimes(1)

    body.removeChild(testEl)

    expect(unmount).toBeCalledTimes(1)
  })
})
