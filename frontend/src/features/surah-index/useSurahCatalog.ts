import { useEffect, useState } from 'react'
import { getSurahs } from '../../api'
import type { SurahSummary } from '../../api'

export function useSurahCatalog() {
  const [surahs, setSurahs] = useState<SurahSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let active = true

    getSurahs()
      .then((items) => {
        if (active) setSurahs(items)
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'بارگذاری فهرست سوره‌ها ناموفق بود.')
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [attempt])

  function retry() {
    setError(null)
    setLoading(true)
    setAttempt((value) => value + 1)
  }

  return { surahs, error, loading, retry }
}
