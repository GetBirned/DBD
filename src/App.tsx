import { Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import DesignsByDart from './pages/DesignsByDart'
import Fun from './pages/Fun'
import Footer from './components/Footer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <div className="ambient-glow" />
      <div className="grain-overlay" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dbd" element={<DesignsByDart />} />
        <Route path="/fun" element={<Fun />} />
      </Routes>
      <Footer />
    </>
  )
}
