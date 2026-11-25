import { useMemo, useState } from 'react'
import type { SurahSummary } from '../../api'
import { AppLink } from '../../app/AppLink'
import { readPersistedSetting, writePersistedSetting } from '../../app/persistedSettings'
import { dashboardPath } from '../../app/useDashboardRoute'
import './SurahIndexPage.css'

interface SurahIndexPageProps {
  surahs: SurahSummary[]
  loading: boolean
  error: string | null
  onRetry: () => void
  navigate: (href: string) => void
}

type SurahSortOrder = 'quran' | 'longest' | 'shortest' | 'alphabetical'

const SORT_ORDER_SETTING_KEY = 'quran-dashboard.surah-sort-order'
const formatNumber = (value: number) => value.toLocaleString('fa-IR')
const persianDigits = '۰۱۲۳۴۵۶۷۸۹'
const arabicDigits = '٠١٢٣٤٥٦٧٨٩'
const persianCollator = new Intl.Collator('fa')

function isSurahSortOrder(value: string | null): value is SurahSortOrder {
  return value === 'quran' ||
    value === 'longest' ||
    value === 'shortest' ||
    value === 'alphabetical'
}

function normalizeSearchValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase('fa')
    .replace(/[يى]/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[\s\u200c\u200e\u200f]+/g, '')
    .replace(/[۰-۹]/g, (digit) => String(persianDigits.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(arabicDigits.indexOf(digit)))
}

export function SurahIndexPage({
  surahs,
  loading,
  error,
  onRetry,
  navigate,
}: SurahIndexPageProps) {
  const [search, setSearch] = useState('')
  const [sortOrder, setSortOrder] = useState<SurahSortOrder>(() => {
    const savedOrder = readPersistedSetting(SORT_ORDER_SETTING_KEY)
    if (isSurahSortOrder(savedOrder)) return savedOrder
    if (savedOrder !== null) {
      console.warn(`Ignoring invalid saved surah sort order "${savedOrder}".`)
    }
    return 'quran'
  })
  const normalizedSearch = normalizeSearchValue(search)
  const isNumberSearch = /^\d+$/.test(normalizedSearch)
  const filteredSurahs = useMemo(
    () =>
      surahs.filter((surah) => {
        if (!normalizedSearch) return true

        if (isNumberSearch) return String(surah.number) === normalizedSearch

        return [surah.name, surah.name_meaning ?? ''].some((value) =>
          normalizeSearchValue(value).includes(normalizedSearch),
        )
      }),
    [isNumberSearch, normalizedSearch, surahs],
  )
  const sortedSurahs = useMemo(
    () =>
      [...filteredSurahs].sort((first, second) => {
        if (sortOrder === 'longest') {
          return second.verse_count - first.verse_count || first.number - second.number
        }
        if (sortOrder === 'shortest') {
          return first.verse_count - second.verse_count || first.number - second.number
        }
        if (sortOrder === 'alphabetical') {
          return persianCollator.compare(first.name, second.name) || first.number - second.number
        }
        return first.number - second.number
      }),
    [filteredSurahs, sortOrder],
  )

  return (
    <section className="surah-index-page" aria-labelledby="surah-index-title">
      <header className="surah-index-heading">
        <div className="surah-index-heading-icon" aria-hidden="true">☷</div>
        <div>
          <h2 id="surah-index-title">فهرست سوره‌ها</h2>
        </div>
        <span className="surah-index-total" aria-live="polite">
          {normalizedSearch
            ? `${formatNumber(filteredSurahs.length)} نتیجه`
            : `${formatNumber(surahs.length || 114)} سوره`}
        </span>
      </header>

      {error ? (
        <div className="surah-index-message" role="alert">
          <div>
            <strong>فهرست سوره‌ها بارگذاری نشد</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={onRetry}>تلاش دوباره</button>
        </div>
      ) : loading ? (
        <div className="surah-index-loading" role="status">
          <span className="loading-spinner" aria-hidden="true" />
          <span>در حال دریافت فهرست سوره‌ها…</span>
        </div>
      ) : (
        <>
          <div className="surah-index-controls">
            <div className="surah-search">
              <span className="surah-search-icon" aria-hidden="true">⌕</span>
              <label className="sr-only" htmlFor="surah-search">
                جست‌وجو بر اساس نام، معنی یا شماره سوره
              </label>
              <input
                id="surah-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="جست‌وجو بر اساس نام، معنی یا شماره سوره"
                autoComplete="off"
              />
              {search && (
                <button
                  type="button"
                  className="surah-search-clear"
                  onClick={() => setSearch('')}
                  aria-label="پاک کردن جست‌وجو"
                >
                  ×
                </button>
              )}
            </div>
            <div className="surah-sort">
              <label htmlFor="surah-sort-order">مرتب‌سازی</label>
              <select
                id="surah-sort-order"
                value={sortOrder}
                onChange={(event) => {
                  const value = event.currentTarget.value
                  if (
                    value === 'quran' ||
                    value === 'longest' ||
                    value === 'shortest' ||
                    value === 'alphabetical'
                  ) {
                    setSortOrder(value)
                    writePersistedSetting(SORT_ORDER_SETTING_KEY, value)
                  }
                }}
              >
                <option value="quran">ترتیب قرآن</option>
                <option value="longest">بیشترین تعداد آیه</option>
                <option value="shortest">کمترین تعداد آیه</option>
                <option value="alphabetical">نام سوره (الفبایی)</option>
              </select>
            </div>
          </div>
          {sortedSurahs.length > 0 ? (
            <div className="surah-card-grid">
              {sortedSurahs.map((surah) => (
                <AppLink
                  key={surah.number}
                  href={dashboardPath({ view: 'reader', surah: surah.number })}
                  navigate={navigate}
                  className="surah-card"
                >
                  <span className="surah-card-number">{formatNumber(surah.number)}</span>
                  <span className="surah-card-main">
                    <strong className="surah-card-name">{surah.name}</strong>
                    <span className="surah-card-meaning">
                      {surah.name_meaning
                        ? `${surah.name_meaning}`
                        : 'معنی نام در داده‌ی موجود ثبت نشده است'}
                    </span>
                  </span>
                  <span className="surah-card-meta">
                    <span>{formatNumber(surah.verse_count)} آیه</span>
                    <span className="surah-card-meta-divider" aria-hidden="true" />
                    <span>{surah.revelation_place}</span>
                  </span>
                  <span className="surah-card-arrow" aria-hidden="true">←</span>
                </AppLink>
              ))}
            </div>
          ) : (
            <div className="surah-search-empty" role="status">
              <span aria-hidden="true">⌕</span>
              <strong>سوره‌ای با این مشخصات پیدا نشد</strong>
              <p>نام، معنی یا شماره‌ی سوره را بررسی کنید.</p>
            </div>
          )}
        </>
      )}
    </section>
  )
}
