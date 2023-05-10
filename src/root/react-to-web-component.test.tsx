import { test, expect } from "vitest"
import React from "react"
import PropTypes from "prop-types"

import r2wc from "./react-to-web-component"

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0))
}

test("works with basic react component", async () => {
  function HelloWorld() {
    return <h1>hello world</h1>
  }

  const HelloWorldElement = r2wc(HelloWorld)

  expect(HelloWorldElement).toBeTruthy()

  customElements.define("hello-world", HelloWorldElement)

  const body = document.body
  body.innerHTML = "<hello-world></hello-world>"

  await flushPromises()

  const h1 = body.querySelector("h1")
  expect(h1?.textContent).toBe("hello world")
})

test("works with props array", async () => {
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

test("works with proptypes", async () => {
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

test("works with class components", async () => {
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

test("props typed as ref works with functional components", async () => {
  type CustomRef = {
    refValue: string
    setRefValue: React.Dispatch<React.SetStateAction<string>>
  }
  const ComponentWithRef = React.forwardRef(function ComponentWithRef(
    props: { buttonRef: React.RefObject<HTMLButtonElement> },
    ref: React.RefObject<CustomRef>,
  ) {
    const [refValue, setRefValue] = React.useState("hello")

    React.useImperativeHandle(ref, () => ({
      refValue,
      setRefValue,
    }))
    return (
      <button onClick={() => setRefValue("world")} ref={props.buttonRef}>
        hello refs
      </button>
    )
  })

  const ComponentWithRefElement = r2wc(ComponentWithRef, {
    props: {
      name: String,
      ref: "ref",
      buttonRef: "ref",
    },
  })

  customElements.define("component-with-ref", ComponentWithRefElement)

  const body = document.body
  body.innerHTML = "<component-with-ref ref buttonRef></component-with-ref>"

  await flushPromises()

  const componentWithRefEl = body.querySelector(
    "component-with-ref",
  ) as HTMLElement & { ref: React.RefObject<CustomRef> }

  expect(componentWithRefEl.ref.current.refValue).toBe("hello")
  expect(componentWithRefEl.ref.current.setRefValue).toBeInstanceOf(Function)

  const button = body.querySelector("button")
  button?.click()

  await flushPromises()

  expect(componentWithRefEl.ref.current.refValue).toBe("world")
})
