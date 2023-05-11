import fs from "fs"
import path from "path"

interface BarePackage {
  name: string
  private?: boolean
  version: string
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export interface Package extends BarePackage {
  directory: string
}

const packagesPath = path.join(__dirname, "..", "..", "packages")

const list = fs
  .readdirSync(packagesPath)
  .map((directory) => ({
    directory,
    pkgPath: path.join(packagesPath, directory, "package.json"),
  }))
  .filter(({ pkgPath }) => fs.existsSync(pkgPath))
  .map(({ directory, pkgPath }) => ({
    directory,
    ...(JSON.parse(fs.readFileSync(pkgPath, "utf-8")) as BarePackage),
  }))

const packages: Record<string, Package> = {}
export default packages

for (const pkg of list) {
  packages[pkg.name] = pkg
}
