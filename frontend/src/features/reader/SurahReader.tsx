import { useEffect, useState } from 'react'
import { getSurah } from '../../api'
import type { Surah } from '../../api'
import type { DashboardRoute } from '../../app/useDashboardRoute'
import { dashboardPath } from '../../app/useDashboardRoute'
import type { SurahSummary } from '../../api'
import { TranslationPicker } from '../../app/TranslationPicker'
import type { TranslationCatalog } from '../../app/useTranslationCatalog'
import { VerseCard } from '../verses/VerseCard'
import './SurahReader.css'

interface SurahReaderProps {
  route: DashboardRoute
  surahs: SurahSummary[]
  loadingList: boolean
  translationCatalog: TranslationCatalog
  selectedTranslation: string
  onTranslationChange: (id: string, name: string) => void
  navigate: (href: string) => void
}

const formatNumber = (value: number) => value.toLocaleString('fa-IR')

export function SurahReader({
  route,
  surahs,
  loadingList,
  translationCatalog,
  selectedTranslation,
  onTranslationChange,
  navigate,
}: SurahReaderProps) {
  const [surahResult, setSurahResult] = useState<{
    number: number
    translationId: string
    surah: Surah
  } | null>(null)
  const [error, setError] = useState<{
    number: number
    translationId: string
    attempt: number
    message: string
  } | null>(null)
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getSurah(route.surah, selectedTranslation, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setSurahResult({
            number: route.surah,
            translationId: selectedTranslation,
            surah: result,
          })
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError({
            number: route.surah,
            translationId: selectedTranslation,
            attempt: retry,
            message: reason instanceof Error ? reason.message : 'بارگذاری ترجمه ناموفق بود.',
          })
        }
      })

    return () => controller.abort()
  }, [route.surah, retry, selectedTranslation])

  const activeSurah =
    surahResult?.number === route.surah &&
    surahResult.translationId === selectedTranslation
      ? surahResult.surah
      : null
  const activeError =
    error?.number === route.surah &&
    error.translationId === selectedTranslation &&
    error.attempt === retry
      ? error.message
      : null
  const loading = activeSurah === null && activeError === null

  return (
    <>
      <section className="surah-heading" aria-live="polite">
        <div className="surah-title-group">
          <span className="surah-number-badge">
            {activeSurah ? formatNumber(activeSurah.number) : '…'}
          </span>
          <div>
            <h2>{activeSurah?.name ?? (loading ? 'در حال بارگذاری…' : 'سوره را انتخاب کنید')}</h2>
            {activeSurah?.name_meaning && (
              <p className="surah-meaning">{activeSurah.name_meaning}</p>
            )}
          </div>
        </div>
        {activeSurah && (
          <div className="surah-facts">
            <div className="fact">
              <span className="fact-icon" aria-hidden="true">✧</span>
              <span>
                <small>تعداد آیات</small>
                <strong>{formatNumber(activeSurah.verse_count)} آیه</strong>
              </span>
            </div>
            <span className="fact-divider" aria-hidden="true" />
            <div className="fact">
              <span className="fact-icon location-icon" aria-hidden="true">⌖</span>
              <span>
                <small>محل نزول</small>
                <strong>{activeSurah.revelation_place}</strong>
              </span>
            </div>
          </div>
        )}
      </section>

      <section className="translation-section" aria-label="ترجمه‌ی سوره">
        <div className="translation-header">
          <div className="translation-header-tools">
            <TranslationPicker
              id="reader-translation-select"
              value={selectedTranslation}
              translations={translationCatalog.translations}
              loading={translationCatalog.loading}
              error={translationCatalog.error}
              onChange={onTranslationChange}
              onRetry={translationCatalog.retry}
            />
          </div>
        </div>

        {activeError ? (
          <div className="message-panel error-panel" role="alert">
            <span className="message-icon" aria-hidden="true">!</span>
            <div>
              <strong>ترجمه بارگذاری نشد</strong>
              <p>{activeError}</p>
            </div>
            <button className="retry-button" type="button" onClick={() => setRetry((value) => value + 1)}>
              تلاش دوباره
            </button>
          </div>
        ) : !activeSurah ? (
          <div className="loading-panel" role="status">
            <span className="loading-spinner" aria-hidden="true" />
            <span>در حال آماده‌سازی ترجمه…</span>
          </div>
        ) : (
          <div className="verse-list">
            {activeSurah.verses.map((verse) => (
              <VerseCard
                key={`${activeSurah.number}-${verse.verse ?? 'opening'}`}
                surahNumber={activeSurah.number}
                verse={verse}
              />
            ))}
          </div>
        )}
      </section>

      <section className="reader-select-panel" aria-label="انتخاب سوره">
        <div className="reader-select-intro">
          <span className="section-kicker">مطالعه‌ی سوره</span>
          <label htmlFor="surah-select">رفتن به سوره‌ی دیگر</label>
        </div>
        <div className="select-wrap">
          <select
            id="surah-select"
            value={route.surah}
            onChange={(event) => {
              const number = Number(event.target.value)
              navigate(dashboardPath({ view: 'reader', surah: number }))
            }}
            disabled={loadingList || surahs.length === 0}
          >
            {surahs.map((item) => (
              <option key={item.number} value={item.number}>
                {formatNumber(item.number)}. {item.name}
              </option>
            ))}
          </select>
          <span className="select-chevron" aria-hidden="true">⌄</span>
        </div>
      </section>
    </>
  )
}
