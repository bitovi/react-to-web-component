import { test, expect, describe } from "vitest"
import AppWCVite from "./vite/dist/index.js"
import AppWCViteSwc from "./vite/dist-swc/index.js"
import AppWebpack from "./webpack/build/index.js"
import { CustomElementConstructor } from "../../types.js"

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve))
}

const elementConstructors: Record<string, CustomElementConstructor> = {
  "vite build": AppWCVite as unknown as CustomElementConstructor,
  "vite build with swc": AppWCViteSwc as unknown as CustomElementConstructor,
  "build with webpack": AppWebpack as unknown as CustomElementConstructor,
}

describe("vite build tests", () => {
  for (const [name, constructor] of Object.entries(elementConstructors)) {
    const tagName = name.replace(/\s/g, "-").toLowerCase()
    test(`vite build works for ${name}`, async () => {
      customElements.define(
        tagName,
        constructor,
      )

      const body = document.body
      body.innerHTML = `<${tagName}></${tagName}>`

      await flushPromises()

      expect(body.firstElementChild?.innerHTML).toBe("<div>hello, world</div>")
    })
  }
})
