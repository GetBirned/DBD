import { useEffect } from 'react'
import { playClick } from '@/lib/sound'

/**
 * Plays a subtle click sound for every button press, site-wide — mounted once so
 * new buttons get it for free instead of wiring an onClick into each one.
 * Listens on the capture phase so it fires even if a button's own handler calls
 * stopPropagation().
 */
export default function ClickSound() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const button = target?.closest('button')
      if (!button || button.disabled) return
      playClick()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
