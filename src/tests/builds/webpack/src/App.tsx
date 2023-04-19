import { FC } from "react"

const App: FC<{ text: string }> = ({ text = 'hello, world' }) => {
  return <div>{text}</div>
}

export default App
