import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

/**
 * AnimatedCounter — counts from 0 to `value` when scrolled into view.
 * @param {number}  value    — target number
 * @param {string}  suffix   — e.g. '+', 'K+', '%'
 * @param {number}  duration — animation duration in seconds (default 2)
 */
export default function AnimatedCounter({ value, suffix = '', duration = 2, className = '' }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isInView) return

    let startTime = null
    const startValue = 0
    const endValue = value

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / (duration * 1000), 1)

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * (endValue - startValue) + startValue))

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        setCount(endValue)
      }
    }

    requestAnimationFrame(step)
  }, [isInView, value, duration])

  const formatted = count >= 1000
    ? count >= 1000000
      ? `${(count / 1000000).toFixed(1)}M`
      : `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`
    : count.toLocaleString()

  return (
    <motion.span
      ref={ref}
      className={className}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
      transition={{ duration: 0.4 }}
    >
      {formatted}{suffix}
    </motion.span>
  )
}
