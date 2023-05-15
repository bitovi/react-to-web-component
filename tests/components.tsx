import React from "react"

export const Greeting: React.FC<{ name: string }> = ({ name }) => {
  return <h1>Hello, {name}</h1>
}

export const CamelCaseGreeting: React.FC<{ camelCaseName: string }> = ({
  camelCaseName,
}) => {
  return <h1>Hello, {camelCaseName}</h1>
}
