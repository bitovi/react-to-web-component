import semver from "semver"

import project from "./lib/project.js"
import workspaces, { Package } from "./lib/workspaces.js"

for (const workspace of Object.values(workspaces)) {
  log(workspace, "Processing.")

  if ("private" in workspace) {
    if (workspace.private === false) {
      error(workspace, `Remove "private: false".`)
    } else {
      warn(workspace, `Private.`)
    }
  }

  if (!workspace.private && workspace.directory !== "legacy") {
    const nameSplit = workspace.name.match(/(?:@([^/]+)\/)?([^/]+)/)

    if (!nameSplit) {
      error(
        workspace,
        `Package name must be in the format @<namespace>/<package>.`,
      )
    } else {
      if (nameSplit[1] !== project.namespace) {
        error(
          workspace,
          `Package must be in the "${project.namespace}" namespace.`,
        )
      }

      if (nameSplit[2] !== workspace.directory) {
        error(workspace, `Package name and directory must match.`)
      }
    }
  }

  if (!semver.valid(workspace.version)) {
    error(workspace, `Invalid version: ${workspace.version}`)
  }

  if (workspace.dependencies) {
    for (const [name, range] of Object.entries(workspace.dependencies)) {
      if (workspaces[name]) {
        if (!semver.satisfies(workspaces[name].version, range)) {
          error(workspace, `Unsatisfiable package: ${name}@${range}`)
        }
      }
    }
  }
}

/* eslint-disable no-console */
function log({ directory }: Package, message: string) {
  console.log(`${directory} - ${message}`)
}

function warn({ directory }: Package, message: string) {
  console.warn(`${directory} - ${message}`)
}

function error({ directory }: Package, message: string) {
  console.error(`${directory} - ${message}`)
  process.exitCode = 1
}
