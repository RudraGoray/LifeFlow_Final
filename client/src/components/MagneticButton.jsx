import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

/**
 * MagneticButton — pulls slightly toward the cursor on hover with smooth spring physics.
 */
export default function MagneticButton({
  children,
  className = '',
  onClick,
  to,
  strength = 0.28,
  type = 'button',
  disabled = false,
  ...props
}) {
  const ref = useRef(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e) => {
    if (!ref.current || disabled) return
    const { clientX, clientY } = e
    const { left, top, width, height } = ref.current.getBoundingClientRect()
    const centerX = left + width / 2
    const centerY = top + height / 2

    const distanceX = (clientX - centerX) * strength
    const distanceY = (clientY - centerY) * strength

    // Bound maximum pull to 12px so it remains refined and tactile
    const clampedX = Math.max(-12, Math.min(12, distanceX))
    const clampedY = Math.max(-12, Math.min(12, distanceY))

    setPosition({ x: clampedX, y: clampedY })
  }

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 })
  }

  const content = (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 320, damping: 18, mass: 0.2 }}
      className="inline-block"
    >
      {children}
    </motion.div>
  )

  if (to) {
    return (
      <Link to={to} className={`inline-block ${className}`} {...props}>
        {content}
      </Link>
    )
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-block ${className}`}
      {...props}
    >
      {content}
    </button>
  )
}
