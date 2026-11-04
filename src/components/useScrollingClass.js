import { useEffect } from 'react'

// Adds `is-scrolling` to a scroll region while it moves, so its scrollbar can stay
// hidden at rest (see .scroll-quiet in game.css).
export function useScrollingClass(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let t
    const onScroll = () => {
      el.classList.add('is-scrolling')
      clearTimeout(t)
      t = setTimeout(() => el.classList.remove('is-scrolling'), 900)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      clearTimeout(t)
      el.removeEventListener('scroll', onScroll)
    }
  }, [ref])
}
