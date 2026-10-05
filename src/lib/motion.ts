import { useReducedMotion } from 'framer-motion'

/** The site's one ease — a soft expo-out, shared by every reveal so the page moves as one system. */
export const EASE = [0.22, 1, 0.36, 1] as const

/**
 * True when scroll-linked motion should run. Visitors who ask the OS for reduced motion get
 * the same content in its final, settled state instead of having it scrubbed by their scroll.
 */
export function useMotionOK() {
  return !useReducedMotion()
}
