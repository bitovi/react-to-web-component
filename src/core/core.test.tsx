import { test, expect, vi } from "vitest"
import r2wc from "."

// mock renderer
const mount = vi.fn()
const unmount = vi.fn()

test("mount and unmount is called", async () => {
  function TestComponent() {
    
    return <div>hello</div>
  }
  const body = document.body

  const TestElement = r2wc(TestComponent, {}, { mount, unmount })
  customElements.define("test-element", TestElement)

  const testEl = new TestElement();

  body.appendChild(testEl)

  expect(mount).toBeCalledTimes(1)

  body.removeChild(testEl)

  expect(unmount).toBeCalledTimes(1)


})
