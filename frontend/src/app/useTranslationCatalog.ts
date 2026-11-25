import { useEffect, useState } from 'react'
import { getTranslations } from '../api'
import type { TranslationSummary } from '../api'

interface TranslationCatalogResult {
  attempt: number
  translations: TranslationSummary[]
}

interface TranslationCatalogFailure {
  attempt: number
  message: string
}

export interface TranslationCatalog {
  translations: TranslationSummary[]
  loading: boolean
  error: string | null
  retry: () => void
}

export function useTranslationCatalog(): TranslationCatalog {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<TranslationCatalogResult | null>(null)
  const [failure, setFailure] = useState<TranslationCatalogFailure | null>(null)

  useEffect(() => {
    let active = true

    getTranslations()
      .then((translations) => {
        if (active) setResult({ attempt, translations })
      })
      .catch((reason: unknown) => {
        if (active) {
          setFailure({
            attempt,
            message: reason instanceof Error ? reason.message : 'فهرست مترجمان بارگذاری نشد.',
          })
        }
      })

    return () => {
      active = false
    }
  }, [attempt])

  const activeResult = result?.attempt === attempt ? result : null
  const activeFailure = failure?.attempt === attempt ? failure : null

  return {
    translations: activeResult?.translations ?? [],
    loading: activeResult === null && activeFailure === null,
    error: activeFailure?.message ?? null,
    retry: () => setAttempt((value) => value + 1),
  }
}
