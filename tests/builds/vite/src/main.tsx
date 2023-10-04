import r2wc from "@r2wc/react-to-web-component"
import App from "./App"

const AppWC = r2wc(App, { props: ["text"] })

// customElements.define("app-wc", AppWC)

export default AppWC
