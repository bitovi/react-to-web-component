import { test, expect, describe } from "vitest"
import AppWC from "./dist/index.js"
import AppWCSwc from "./dist-swc/index.js"
import { CustomElementConstructor } from "../../../types.js"

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

describe("vite build tests", () => {
  test("vite build works without swc", async () => {
    customElements.define(
      "app-wc-test",
      AppWC as unknown as CustomElementConstructor,
    )

    const body = document.body
    body.innerHTML = `<app-wc-test></app-wc-test>`

    await flushPromises()

    expect(body.firstElementChild?.innerHTML).toBe("<div>hello, world</div>")
  })

  test("vite build works with swc", async () => {
    customElements.define(
      "app-wc-swc-test",
      AppWCSwc as unknown as CustomElementConstructor,
    )

    const body = document.body
    body.innerHTML = `<app-wc-swc-test></app-wc-swc-test>`

    await flushPromises()

    expect(body.firstElementChild?.innerHTML).toBe("<div>hello, world</div>")
  })
})
