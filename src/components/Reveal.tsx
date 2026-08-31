import { motion } from 'framer-motion'
import type { CSSProperties, ReactNode, TouchEventHandler } from 'react'

/** Fades and rises content into place the first time it scrolls into view. */
export default function Reveal({
  children,
  delay = 0,
  className,
  style,
  onTouchStart,
  onTouchEnd,
}: {
  children: ReactNode
  delay?: number
  className?: string
  style?: CSSProperties
  onTouchStart?: TouchEventHandler
  onTouchEnd?: TouchEventHandler
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
      style={style}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {children}
    </motion.div>
  )
}
