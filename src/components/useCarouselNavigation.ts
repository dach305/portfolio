import { useEffect, useRef, type RefObject } from 'react'

/** Slide one card at a time, fading only cards newly entering the viewport. */
export function useCarouselNavigation(trackRef: RefObject<HTMLDivElement | null>, reducedMotion: boolean | null) {
  const transition = useRef({ busy: false, frame: 0, entering: [] as HTMLElement[] })

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const state = transition.current
    const cancel = () => {
      cancelAnimationFrame(state.frame)
      state.frame = 0
      state.busy = false
      state.entering.forEach(card => card.classList.remove('is-entering'))
      state.entering = []
      track.classList.remove('is-sliding')
      track.removeAttribute('aria-busy')
    }
    // Native swiping/scrolling and responsive changes take over immediately.
    const observer = new ResizeObserver(cancel)
    observer.observe(track)
    track.addEventListener('pointerdown', cancel, { passive: true })
    track.addEventListener('wheel', cancel, { passive: true })
    track.addEventListener('keydown', cancel)
    return () => {
      cancel()
      observer.disconnect()
      track.removeEventListener('pointerdown', cancel)
      track.removeEventListener('wheel', cancel)
      track.removeEventListener('keydown', cancel)
    }
  }, [trackRef, reducedMotion])

  return (direction: -1 | 1) => {
    const track = trackRef.current
    const state = transition.current
    if (!track || state.busy) return
    const cards = [...track.querySelectorAll<HTMLElement>('.project-card')]
    if (cards.length < 2) return
    const stride = cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left
    const start = track.scrollLeft
    const index = Math.round(start / stride) + direction
    const destination = Math.max(0, Math.min(index * stride, track.scrollWidth - track.clientWidth))
    if (Math.abs(destination - start) < 1) return
    if (reducedMotion) {
      track.scrollTo({ left: destination, behavior: 'instant' })
      return
    }

    // Use the same visible-card count as the responsive grid. One-card steps
    // introduce exactly the next range's rightmost or leftmost project.
    const visibleCount = Number.parseInt(getComputedStyle(track).getPropertyValue('--carousel-columns'), 10)
    const nextFirstIndex = Math.round(destination / stride)
    const enteringIndex = direction === 1 ? nextFirstIndex + visibleCount - 1 : nextFirstIndex
    state.entering = cards[enteringIndex] ? [cards[enteringIndex]] : []
    // Apply before scheduling the first scrolling frame, including on replay.
    state.entering.forEach(card => card.classList.add('is-entering'))
    state.busy = true
    track.classList.add('is-sliding')
    track.setAttribute('aria-busy', 'true')
    const started = performance.now()
    const step = (time: number) => {
      const progress = Math.min((time - started) / 420, 1)
      // Smooth acceleration/deceleration while retaining the full card travel.
      const eased = progress < .5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2
      track.scrollLeft = start + (destination - start) * eased
      if (progress < 1) {
        state.frame = requestAnimationFrame(step)
      } else {
        state.frame = 0
        state.busy = false
        state.entering.forEach(card => card.classList.remove('is-entering'))
        state.entering = []
        track.classList.remove('is-sliding')
        track.removeAttribute('aria-busy')
      }
    }
    state.frame = requestAnimationFrame(step)
  }
}
