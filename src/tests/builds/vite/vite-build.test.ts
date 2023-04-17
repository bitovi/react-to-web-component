import { test, expect, describe } from "vitest"
import AppWC from "./dist/index.js"
import { CustomElementConstructor } from "../../../types.js"

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve))
}

describe("vite build", () => {
  test("vite build works", async () => {
    customElements.define("app-wc-test", AppWC as unknown as CustomElementConstructor)

    const body = document.body
    body.innerHTML = `<app-wc-test></app-wc-test>`

    await flushPromises()

    expect(body.firstElementChild?.innerHTML).toBe("<div>hello, world</div>")
  })
})
