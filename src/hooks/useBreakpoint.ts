import { useEffect, useState } from 'react'

const QUERIES = {
  mobile: '(max-width: 767px)',
} as const

export type Breakpoint = keyof typeof QUERIES

export function useBreakpoint(breakpoint: Breakpoint = 'mobile'): boolean {
  const query = QUERIES[breakpoint]
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    mql.addEventListener('change', onChange)
    setMatches(mql.matches)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}
