import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useEffect } from 'react'
import Home from './pages/Home'
import Footer from './components/Footer'
import ClickSound from './components/ClickSound'
import FloatingNav from './components/FloatingNav'
import Backdrop from './components/Backdrop'
import { ChapterProvider } from './components/chapters'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    // Explicit 'instant' — otherwise this inherits the site-wide smooth scroll
    // behavior and animates on every route change, which feels sluggish.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])
  return null
}

/** The old /fun page is now the Projects chapter; keep `?p=` so project deep links still open. */
function FunRedirect() {
  const { search } = useLocation()
  return <Navigate replace to={{ pathname: '/', search, hash: '#projects' }} />
}

export default function App() {
  const location = useLocation()

  return (
    <ChapterProvider>
      <ScrollToTop />
      <ClickSound />
      <Backdrop />
      <FloatingNav />
      <div className="grain-overlay" />
      {/* No `initial={false}` here: it's inherited by every motion element on the page and would
          suppress all of their scroll-in reveals on first load, not just the route fade. */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          {/* The site used to be three pages. Old links land on the matching chapter. */}
          <Route path="/dbd" element={<Navigate replace to="/#clients" />} />
          <Route path="/fun" element={<FunRedirect />} />
          <Route path="*" element={<Navigate replace to="/" />} />
        </Routes>
      </AnimatePresence>
      <Footer />
    </ChapterProvider>
  )
}
