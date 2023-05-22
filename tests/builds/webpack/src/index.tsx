import r2wc from "@r2wc/react-to-web-component"
import App from "./App"

const AppWC = r2wc(App, { props: ["text"] })

export default AppWC

