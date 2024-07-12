/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")

const TEST_PATH = "../../react-to-webcomponent.test.jsx"
const REACT17_TEST_PATH = "./react-to-webcomponent.test.jsx"

// copy test file from tests folder to react17 folder
fs.copyFileSync(TEST_PATH, REACT17_TEST_PATH)

// edit react-to-webcomponent test file's reactToWebComponent and components imports
const data = fs.readFileSync(REACT17_TEST_PATH, "utf8")
const result = data.replace(
  /..\/legacy\/react-to-webcomponent/g,
  "react-to-webcomponent/render",
)
const result2 = result.replace(/.\/components/g, "../../components.tsx")
fs.writeFileSync(REACT17_TEST_PATH, result2, "utf8")
