import semver from "semver"

import { namespace } from "../package.json"

import packages, { Package } from "./lib/packages"

for (const pkg of Object.values(packages)) {
  if ("private" in pkg) {
    if (pkg.private === false) {
      error(pkg, `Remove "private: false".`)
    } else {
      warn(pkg, `Private.`)
    }
  }

  if (!pkg.private && pkg.directory !== "legacy") {
    const split = pkg.name.match(/(?:@([^/]+)\/)?([^/]+)/)

    if (!split) {
      error(pkg, `Package name must be in the format @<namespace>/<package>.`)
    } else {
      if (split[1] !== namespace) {
        error(pkg, `Package must be in the "${namespace}" namespace.`)
      }

      if (split[2] !== pkg.directory) {
        error(pkg, `Package name and directory must match.`)
      }
    }
  }

  if (!semver.valid(pkg.version)) {
    error(pkg, `Invalid version: ${pkg.version}`)
  }

  if (pkg.dependencies) {
    for (const [name, range] of Object.entries(pkg.dependencies)) {
      if (packages[name]) {
        if (!semver.satisfies(packages[name].version, range)) {
          error(pkg, `Unsatisfiable package: ${name}@${range}`)
        }
      }
    }
  }
}

function warn({ directory }: Package, message: string) {
  console.warn(`${directory} - ${message}`)
}

function error({ directory }: Package, message: string) {
  console.error(`${directory} - ${message}`)
  process.exitCode = 1
}
