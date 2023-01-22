import React from "react"
import ReactDOM from "react-dom/client"
// import "./index.css"
import App from "./App"
import reportWebVitals from "./reportWebVitals"
import { BrowserRouter } from "react-router-dom"
import { AppProvider } from "./misc/appContext"
import "../src/assets/style.scss"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <BrowserRouter>
    <AppProvider component={<App />} />
  </BrowserRouter>
  // <React.StrictMode>

  // </React.StrictMode>
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(//console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
