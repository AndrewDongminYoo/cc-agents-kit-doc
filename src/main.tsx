import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"

const root = document.getElementById("root")!
const locale = /^\/ko(?:\/|$)/.test(window.location.pathname) ? "ko" : "en"
document.documentElement.lang = locale
const app = (
  <StrictMode>
    <App locale={locale} />
  </StrictMode>
)

if (root.hasChildNodes()) {
  hydrateRoot(root, app)
} else {
  createRoot(root).render(app)
}
