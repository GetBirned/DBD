import { useEffect, useRef } from 'react'
import { useMotionOK } from '@/lib/motion'

/** How often the grain may jump while scrolling, in ms — about the 12 fps of a flickering print. */
const STEP = 80

/**
 * Film grain over the whole frame. While the page is scrolling it jumps to a new position a dozen
 * times a second, like grain on stock running through a projector; when the scroll stops, so does
 * the grain. Still with reduced motion.
 */
export default function FilmGrain() {
  const ref = useRef<HTMLDivElement>(null)
  const motionOK = useMotionOK()

  useEffect(() => {
    if (!motionOK) return
    let last = 0
    const onScroll = () => {
      const now = performance.now()
      if (now - last < STEP || !ref.current) return
      last = now
      ref.current.style.transform = `translate(${(Math.random() - 0.5) * 8}%, ${(Math.random() - 0.5) * 8}%)`
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [motionOK])

  return <div ref={ref} aria-hidden className="grain-overlay" />
}
