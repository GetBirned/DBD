import { useEffect } from 'react'
import { playClick } from '@/lib/sound'

/**
 * Plays a subtle click sound for button presses, site-wide — mounted once so
 * new buttons get it for free instead of wiring an onClick into each one.
 * Popups are quiet: nothing that opens one (marked aria-haspopup="dialog") and
 * nothing inside one makes a sound.
 * Listens on the capture phase so it fires even if a button's own handler calls
 * stopPropagation().
 */
export default function ClickSound() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const button = target?.closest('button')
      if (!button || button.disabled) return
      if (button.getAttribute('aria-haspopup') === 'dialog' || button.closest('[role="dialog"]')) return
      playClick()
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
