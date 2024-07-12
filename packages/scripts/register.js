import { register } from "node:module"
import { pathToFileURL } from "node:url"

register("ts-node/esm/transpile-only", pathToFileURL("./"))
