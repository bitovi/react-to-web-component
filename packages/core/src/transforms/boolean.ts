import type { Transform } from "./index"

let LOG_DEPRECATION_WARNING = true
const string: Transform<boolean> = {
  stringify: (value) => (value ? "true" : "false"),
  parse: (value, attribute) => {
    const trueRegex = new RegExp(`^\b(true|${attribute})\b$`, "gi")
    const falseRegex = new RegExp(`^\bfalse\b$`, "gi")
    const deprecatedRegex = new RegExp(`^[ty1-9]`, "gi")

    if (trueRegex.test(value)) {
      return true
    } else if (falseRegex.test(value)) {
      return false
    } else {
      if (LOG_DEPRECATION_WARNING) {
        console.warn(
          `[${attribute}="${value}"] The current pattern for boolean attributes has been marked as deprecated, but it is still supported in this release. In a future release, this pattern will no longer be supported. To avoid compatibility issues, please migrate to the new behavior and use the attribute without a value or pass 'true', '<attribute>', or an empty string for the value to represent true. Otherwise, the attribute will be considered false.`,
        )
        LOG_DEPRECATION_WARNING = false
      }
      return deprecatedRegex.test(value)
    }
  },
}

export default string
