export function toDashedCase(camelCase: string): string {
  return camelCase.replace(
    /([a-z0-9])([A-Z])/g,
    (_, a, b) => `${a}-${b.toLowerCase()}`,
  )
}

export function toCamelCase(dashedCase: string): string {
  return dashedCase.replace(/[-:]([a-z])/g, (_, b) => `${b.toUpperCase()}`)
}
