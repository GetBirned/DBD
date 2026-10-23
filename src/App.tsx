import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Home from './pages/Home'
import ClickSound from './components/ClickSound'
import FloatingNav from './components/FloatingNav'
import Soundtrack from './components/Soundtrack'
import FilmGrain from './components/FilmGrain'
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
  return (
    <ChapterProvider>
      <ScrollToTop />
      <ClickSound />
      <FloatingNav />
      <Soundtrack />
      <FilmGrain />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* The site used to be three pages. Old links land on the matching chapter. */}
        <Route path="/dbd" element={<Navigate replace to="/#clients" />} />
        <Route path="/fun" element={<FunRedirect />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </ChapterProvider>
  )
}
