/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")

const TEST_PATH = "src/tests/react-to-webcomponent.test.jsx"
const REACT18_TEST_PATH =
  "src/tests/environments/react18/react-to-webcomponent.test.jsx"

// copy test file from tests folder to react18 folder
fs.copyFileSync(TEST_PATH, REACT18_TEST_PATH)

// edit react-to-webcomponent test file's reactToWebComponent and components imports
const data = fs.readFileSync(REACT18_TEST_PATH, "utf8")
const result = data.replace(/..\/legacy\//g, "")
const result2 = result.replace(/.\/components/g, "../../components.tsx")
fs.writeFileSync(REACT18_TEST_PATH, result2, "utf8")
