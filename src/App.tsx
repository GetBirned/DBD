import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Home from './pages/Home'
import DesignsByDart from './pages/DesignsByDart'
import Fun from './pages/Fun'
import Footer from './components/Footer'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Explicit 'instant' — otherwise this inherits the site-wide smooth scroll
    // behavior and animates on every route change, which feels sluggish.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

export default function App() {
  const location = useLocation()

  return (
    <>
      <ScrollToTop />
      <div className="ambient-glow" />
      <div className="grain-overlay" />
      <AnimatePresence mode="wait" initial={false}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/dbd" element={<DesignsByDart />} />
          <Route path="/fun" element={<Fun />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </>
  )
}
