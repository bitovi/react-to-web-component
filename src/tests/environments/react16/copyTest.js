/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")

const TEST_PATH = "src/tests/react-to-webcomponent.test.jsx"
const REACT16_TEST_PATH =
  "src/tests/environments/react16/react-to-webcomponent.test.jsx"

// copy test file from tests folder to react16 folder
fs.copyFileSync(TEST_PATH, REACT16_TEST_PATH)

// edit react-to-webcomponent test file's reactToWebComponent and components imports
const data = fs.readFileSync(REACT16_TEST_PATH, "utf8")
const result = data.replace(/..\/legacy\/react-to-webcomponent/g, "react-to-webcomponent/render")
const result2 = result.replace(/.\/components/g, "../../components.tsx")
fs.writeFileSync(REACT16_TEST_PATH, result2, "utf8")
