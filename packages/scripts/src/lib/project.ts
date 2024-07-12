import fs from "node:fs"
import path from "node:path"

export const dirname = path.join(import.meta.dirname, "..", "..", "..", "..")

const packagePath = path.join(dirname, "package.json")
const packageContents = fs.readFileSync(packagePath, "utf-8")
const packageData = JSON.parse(packageContents)

export default packageData
