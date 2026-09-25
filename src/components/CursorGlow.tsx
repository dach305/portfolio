import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './CursorGlow.css'

/** Remove this component to disable both levels of experimental lighting. */
export default function CursorGlow() {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const overlay = overlayRef.current
    if (!overlay) return
    const finePointer = window.matchMedia('(any-hover: hover) and (any-pointer: fine)')
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0
    let idleTimer = 0
    let active = false
    let card: HTMLElement | null = null
    let x = 0
    let y = 0
    let targetX = 0
    let targetY = 0
    let previousTime = 0

    const clearCard = () => {
      card?.style.removeProperty('--card-glow-visible')
      // Keep the last position during fade-out; resetting it makes light jump.
      card = null
    }

    const updateCard = (hit: Element | null) => {
      const nextCard = hit?.closest<HTMLElement>('.media-placeholder') ?? null
      if (nextCard !== card) {
        clearCard()
        card = nextCard
      }
      if (!card) return
      const bounds = card.getBoundingClientRect()
      card.style.setProperty('--card-mouse-x', `${targetX - bounds.left}px`)
      card.style.setProperty('--card-mouse-y', `${targetY - bounds.top}px`)
      card.style.setProperty('--card-glow-visible', '1')
    }

    const update = (time: number) => {
      frame = 0
      const elapsed = previousTime ? Math.min(time - previousTime, 64) : 16
      previousTime = time
      const blend = reducedMotion.matches || card ? 1 : 1 - Math.exp(-elapsed / 30)
      x += (targetX - x) * blend
      y += (targetY - y) * blend
      overlay.style.setProperty('--mouse-x', `${x}px`)
      overlay.style.setProperty('--mouse-y', `${y}px`)

      if (Math.abs(targetX - x) + Math.abs(targetY - y) > .1) {
        frame = requestAnimationFrame(update)
      }
    }

    const schedule = () => {
      if (active && !frame) frame = requestAnimationFrame(update)
    }
    const hide = () => {
      active = false
      cancelAnimationFrame(frame)
      frame = 0
      previousTime = 0
      window.clearTimeout(idleTimer)
      overlay.style.setProperty('--cursor-glow-visible', '0')
      clearCard()
    }
    const move = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !finePointer.matches) {
        hide()
        return
      }
      targetX = event.clientX
      targetY = event.clientY
      // Local lighting bypasses global interpolation and React state entirely.
      updateCard(event.target instanceof Element ? event.target : null)
      if (!active) {
        x = targetX
        y = targetY
      }
      active = true
      overlay.style.setProperty('--cursor-glow-visible', '1')
      window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        overlay.style.setProperty('--cursor-glow-visible', '.2')
      }, 700)
      schedule()
    }
    const leave = (event: PointerEvent) => {
      if (!event.relatedTarget) hide()
      else if (card && (!(event.relatedTarget instanceof Node) || !card.contains(event.relatedTarget))) clearCard()
    }
    const scroll = () => {
      if (!active) return
      updateCard(document.elementFromPoint(targetX, targetY))
      schedule()
    }
    const visibility = () => { if (document.hidden) hide() }

    document.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerout', leave)
    document.addEventListener('visibilitychange', visibility)
    document.addEventListener('scroll', scroll, { passive: true, capture: true })
    window.addEventListener('blur', hide)
    finePointer.addEventListener('change', hide)
    return () => {
      hide()
      document.removeEventListener('pointermove', move)
      document.removeEventListener('pointerout', leave)
      document.removeEventListener('visibilitychange', visibility)
      document.removeEventListener('scroll', scroll, true)
      window.removeEventListener('blur', hide)
      finePointer.removeEventListener('change', hide)
    }
  }, [])

  return createPortal(<div ref={overlayRef} className="cursor-glow" aria-hidden="true" />, document.body)
}
