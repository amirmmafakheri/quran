import { useEffect, useMemo, useState } from 'react'
import { getSurah } from '../../api'
import type { Surah } from '../../api'
import { AppLink } from '../../app/AppLink'
import { dashboardPath } from '../../app/useDashboardRoute'
import { TranslationPicker } from '../../app/TranslationPicker'
import type { TranslationCatalog } from '../../app/useTranslationCatalog'
import { VerseCard } from '../verses/VerseCard'
import type { TopicVerseReferenceGroup } from './topicsData'

interface TopicVerseResultsProps {
  references: readonly TopicVerseReferenceGroup[]
  translationId: string
  translationCatalog: TranslationCatalog
  translationName: string
  onTranslationChange: (id: string, name: string) => void
  topicName: string
  navigate: (href: string) => void
}

interface LoadedSurahs {
  translationId: string
  referencesKey: string
  surahs: Surah[]
}

interface LoadingError {
  translationId: string
  referencesKey: string
  attempt: number
  message: string
}

interface TopicVerse {
  surahNumber: number
  surahName: string
  verse: Surah['verses'][number]
}

const formatNumber = (value: number) => value.toLocaleString('fa-IR')

export function TopicVerseResults({
  references,
  translationId,
  translationCatalog,
  translationName,
  onTranslationChange,
  topicName,
  navigate,
}: TopicVerseResultsProps) {
  const [loadedSurahs, setLoadedSurahs] = useState<LoadedSurahs | null>(null)
  const [error, setError] = useState<LoadingError | null>(null)
  const [retry, setRetry] = useState(0)
  const [search, setSearch] = useState('')
  const referencesKey = references
    .map(({ number, verses }) => `${number}:${verses.join(',')}`)
    .join(';')

  useEffect(() => {
    const controller = new AbortController()

    Promise.all(
      references.map(({ number }) =>
        getSurah(number, translationId, controller.signal),
      ),
    )
      .then((surahs) => {
        const missingReferences = references.flatMap((group, index) => {
          const verses = new Set(
            surahs[index].verses.flatMap((verse) =>
              verse.verse === null ? [] : [verse.verse],
            ),
          )
          return group.verses
            .filter((verseNumber) => !verses.has(verseNumber))
            .map((verseNumber) => `${group.number}:${verseNumber}`)
        })

        if (missingReferences.length > 0) {
          throw new Error(`آیه‌های ${missingReferences.join('، ')} در داده‌ی سوره پیدا نشدند.`)
        }

        if (!controller.signal.aborted) {
          setLoadedSurahs({ translationId, referencesKey, surahs })
          setError(null)
        }
      })
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) {
          setError({
            translationId,
            referencesKey,
            attempt: retry,
            message: reason instanceof Error ? reason.message : 'بارگذاری آیات ناموفق بود.',
          })
        }
      })

    return () => controller.abort()
  }, [references, referencesKey, retry, translationId])

  const activeSurahs =
    loadedSurahs?.translationId === translationId &&
    loadedSurahs.referencesKey === referencesKey
      ? loadedSurahs.surahs
      : null
  const activeError =
    error?.translationId === translationId &&
    error.referencesKey === referencesKey &&
    error.attempt === retry
      ? error.message
      : null
  const loading = activeSurahs === null && activeError === null

  const topicVerses = useMemo(() => {
    if (!activeSurahs) return []

    return references.flatMap((group, index) => {
      const surah = activeSurahs[index]
      return group.verses.flatMap((verseNumber) => {
        const verse = surah.verses.find((item) => item.verse === verseNumber)
        return verse
          ? [{ surahNumber: surah.number, surahName: surah.name, verse }]
          : []
      })
    })
  }, [activeSurahs, references])

  const visibleVerses = useMemo(() => {
    const query = normalizeSearch(search)
    if (!query) return topicVerses

    return topicVerses.filter(({ surahNumber, surahName, verse }) =>
      [
        String(surahNumber),
        String(verse.verse ?? ''),
        surahName,
        verse.text ?? '',
      ].some((value) => normalizeSearch(value).includes(query)),
    )
  }, [search, topicVerses])

  const groupedVerses = useMemo(() => {
    const groups = new Map<number, { name: string; verses: TopicVerse[] }>()
    for (const verse of visibleVerses) {
      const group = groups.get(verse.surahNumber) ?? {
        name: verse.surahName,
        verses: [],
      }
      group.verses.push(verse)
      groups.set(verse.surahNumber, group)
    }
    return [...groups.entries()]
  }, [visibleVerses])

  return (
    <section className="topic-verse-results" aria-live="polite">
      <header className="topic-verse-results-heading">
        <div>
          <span className="section-kicker">آیات مرتبط</span>
          <h3>{topicName}</h3>
          <p>ترجمه‌ی {translationName} · متن عربی از داده‌ی اصلی قرآن</p>
        </div>
        <span className="topic-verse-total">
          {formatNumber(references.reduce((count, group) => count + group.verses.length, 0))} آیه
        </span>
      </header>

      <div className="topic-verse-controls">
        <TranslationPicker
          id="topic-translation-select"
          value={translationId}
          translations={translationCatalog.translations}
          loading={translationCatalog.loading}
          error={translationCatalog.error}
          onChange={onTranslationChange}
          onRetry={translationCatalog.retry}
        />
        <label className="topic-verse-search">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">جست‌وجو در آیات مرتبط</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="جست‌وجو در نام سوره، شماره یا ترجمه‌ی آیه"
            autoComplete="off"
          />
        </label>
      </div>

      {loading && <p className="topic-verse-status" role="status">در حال بارگذاری آیات…</p>}
      {activeError && (
        <div className="topic-verse-error" role="alert">
          <span>{activeError}</span>
          <button type="button" onClick={() => setRetry((value) => value + 1)}>
            تلاش دوباره
          </button>
        </div>
      )}
      {!loading && !activeError && visibleVerses.length === 0 && (
        <p className="topic-verse-status" role="status">
          آیه‌ای با این جست‌وجو پیدا نشد.
        </p>
      )}

      {activeSurahs && groupedVerses.map(([surahNumber, group]) => (
        <section className="topic-verse-group" key={surahNumber}>
          <header className="topic-verse-group-heading">
            <h4>
              سوره‌ی {group.name}
              <span>{formatNumber(surahNumber)}</span>
            </h4>
            <AppLink
              href={dashboardPath({ view: 'reader', surah: surahNumber })}
              navigate={navigate}
            >
              مشاهده سوره
            </AppLink>
          </header>
          <div className="topic-verse-list">
            {group.verses.map(({ verse }) => (
              <VerseCard
                key={`${surahNumber}-${verse.verse}`}
                surahNumber={surahNumber}
                verse={verse}
              />
            ))}
          </div>
        </section>
      ))}
    </section>
  )
}

function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('fa')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(/[\s\u200c\u200e\u200f]+/g, '')
}
