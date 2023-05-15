import r2wc from "react-to-webcomponent"
import App from "./App"

const AppWC = r2wc(App, { props: ["text"] })

// customElements.define("app-wc", AppWC)

export default AppWC
