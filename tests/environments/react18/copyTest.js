/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs")

const TEST_PATH = "../../react-to-web-component.test.tsx"
const REACT18_TEST_PATH = "./react-to-web-component.test.tsx"

// copy test file from tests folder to react18 folder
fs.copyFileSync(TEST_PATH, REACT18_TEST_PATH)

// read test file
const data = fs.readFileSync(REACT18_TEST_PATH, "utf8")
// add react-to-web-component import to top of file
const result = `import r2wc from '@r2wc/react-to-web-component';\n${data}`
// remove r2wc mock from test file
const result2 = result.replace("const r2wc = vi.fn()", "")
fs.writeFileSync(REACT18_TEST_PATH, result2, "utf8")
