import fs from "node:fs"
import path from "node:path"

import { globSync } from "glob"

import project, { dirname } from "./project.js"

interface BarePackage {
  name: string
  private?: boolean
  version: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface Package extends BarePackage {
  dirname: string
  directory: string
}

const list = globSync(project.workspaces, { cwd: dirname })
  .map((workspace) => {
    const split = workspace.split("/")
    const directory = split[split.length - 1]

    return {
      dirname: workspace,
      directory,
      pkgPath: path.join(dirname, workspace, "package.json"),
    }
  })
  .filter(({ pkgPath }) => fs.existsSync(pkgPath))
  .map(({ dirname, directory, pkgPath }) => ({
    dirname,
    directory,
    ...(JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as BarePackage),
  }))

const workspaces: Record<string, Package> = {}
export default workspaces

for (const pkg of list) {
  workspaces[pkg.name] = pkg
}
