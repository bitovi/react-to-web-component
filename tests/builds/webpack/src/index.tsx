import r2wc from "react-to-webcomponent"
import App from "./App"

const AppWC = r2wc(App, { props: ["text"] })

export default AppWC
