import React from "react"

import { toCamelCase } from "./utils"

const ELEMENT_NODE = 1
const TEXT_NODE = 3
const COMMENT_NODE = 8

export default function parseChildren(
  input: NodeListOf<ChildNode>,
): React.ReactNode[] {
  const output: React.ReactNode[] = []

  for (let index = 0; index < input.length; index++) {
    const child = input[index]
    output.push(parseChild(child, index))
  }

  return output
}

function parseChild(
  input: ChildNode,
  index: number,
): React.ReactNode | undefined {
  if (input.nodeType === TEXT_NODE || input.nodeType === COMMENT_NODE) {
    return input.nodeValue
  }

  if (input.nodeType === ELEMENT_NODE) {
    const node = input as HTMLElement
    const nodeName = node.localName
    const children = parseChildren(node.childNodes)

    const props: Record<string, unknown> = { key: index }
    for (let { name, value } of node.attributes) {
      if (name === "class") name = "class-name"
      if (name === "for") name = "html-for"
      if (name === "colspan") name = "colSpan"
      if (name === "rowspan") name = "rowSpan"
      if (nodeName === "input" && name === "value") name = "default-value"
      if (nodeName === "input" && name === "checked") name = "default-checked"

      if (!name.startsWith("data-")) name = toCamelCase(name)

      if (name === "style") {
        const input = value
          .split(";")
          .filter((value) => value.length > 0)
          .map((value) =>
            value
              .trim()
              .split(":")
              .map((value) => value.trim()),
          )

        const styles = {}
        for (const [key, value] of input) {
          const camelKey = toCamelCase(key)

          // @ts-ignore
          styles[camelKey] = value
        }

        // @ts-ignore
        value = styles
      }

      props[name] = value
    }

    return React.createElement(nodeName, props, ...children)
  }

  return undefined
}
