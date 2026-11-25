import { useCallback, useEffect, useState } from 'react'

export type DashboardView = 'surahs' | 'reader' | 'repetitions' | 'topics' | 'wonders'

export interface DashboardRoute {
  view: DashboardView
  surah: number
  word: string
  category: string
  topic: string
  wonderId: string
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function stripBasePath(pathname: string): string {
  const basePath = import.meta.env.BASE_URL
  const basePrefix = basePath === '/' ? '' : basePath.replace(/\/$/u, '')
  if (!basePrefix) return pathname
  if (pathname === basePrefix) return '/'
  return pathname.startsWith(`${basePrefix}/`) ? pathname.slice(basePrefix.length) : pathname
}

function addBasePath(pathname: string): string {
  const basePath = import.meta.env.BASE_URL
  const basePrefix = basePath === '/' ? '' : basePath.replace(/\/$/u, '')
  return `${basePrefix}${pathname}`
}

export function readDashboardRoute(pathname: string): DashboardRoute {
  const [section, second, third] = stripBasePath(pathname)
    .split('/')
    .filter(Boolean)
    .map(decodeSegment)

  if (section === 'surahs') {
    const surah = Number(second)
    if (Number.isInteger(surah) && surah >= 1 && surah <= 114) {
      return { view: 'reader', surah, word: '', category: '', topic: '', wonderId: '' }
    }

    return { view: 'surahs', surah: 1, word: '', category: '', topic: '', wonderId: '' }
  }

  if (section === 'repetitions') {
    return {
      view: 'repetitions',
      surah: 1,
      word: second ?? '',
      category: '',
      topic: '',
      wonderId: '',
    }
  }

  if (section === 'topics') {
    return {
      view: 'topics',
      surah: 1,
      word: '',
      category: second ?? '',
      topic: third ?? '',
      wonderId: '',
    }
  }

  if (section === 'wonders') {
    return {
      view: 'wonders',
      surah: 1,
      word: '',
      category: '',
      topic: '',
      wonderId: second ?? '',
    }
  }

  return { view: 'reader', surah: 1, word: '', category: '', topic: '', wonderId: '' }
}

export function dashboardPath(
  changes: Partial<Pick<DashboardRoute, 'view' | 'surah' | 'word' | 'category' | 'topic' | 'wonderId'>>,
): string {
  const current = readDashboardRoute(window.location.pathname)
  const route = { ...current, ...changes }

  if (route.view === 'surahs') {
    return addBasePath('/surahs')
  }
  if (route.view === 'reader') {
    const surah = Number.isInteger(route.surah) && route.surah >= 1 && route.surah <= 114
      ? route.surah
      : 1
    return addBasePath(`/surahs/${surah}`)
  }
  if (route.view === 'repetitions') {
    return addBasePath(
      route.word ? `/repetitions/${encodeURIComponent(route.word)}` : '/repetitions',
    )
  }
  if (route.view === 'wonders') {
    return addBasePath(
      route.wonderId ? `/wonders/${encodeURIComponent(route.wonderId)}` : '/wonders',
    )
  }

  const category = route.category ? `/${encodeURIComponent(route.category)}` : ''
  const topic = route.topic ? `/${encodeURIComponent(route.topic)}` : ''
  return addBasePath(`/topics${category}${topic}`)
}

export function useDashboardRoute() {
  const [route, setRoute] = useState(() => readDashboardRoute(window.location.pathname))

  useEffect(() => {
    const handlePopState = () => setRoute(readDashboardRoute(window.location.pathname))
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((path: string) => {
    window.history.pushState(null, '', path)
    setRoute(readDashboardRoute(window.location.pathname))
  }, [])

  return { route, navigate }
}
