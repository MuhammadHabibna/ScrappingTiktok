import { BrowserRouter, Routes, Route } from "react-router-dom"
import { useEffect } from "react"
import { Layout } from "./components/layout/Layout"
import Home from "./pages/Home"
import Settings from "./pages/Settings"
import { useStore } from "./hooks/useStore"

function App() {
  const { theme } = useStore()

  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
