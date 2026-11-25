import './App.css'
import { useEffect, useLayoutEffect, useState } from 'react'
import { DEFAULT_TRANSLATION_ID } from '../api'
import { readPersistedSetting, writePersistedSetting } from './persistedSettings'
import { useDashboardRoute } from './useDashboardRoute'
import { useTranslationCatalog } from './useTranslationCatalog'
import { SurahSidebar } from '../features/surah-index/SurahSidebar'
import { useSurahCatalog } from '../features/surah-index/useSurahCatalog'
import { SurahReader } from '../features/reader/SurahReader'
import { RepetitionPage } from '../features/repetitions/RepetitionPage'
import { TopicsPage } from '../features/topics/TopicsPage'
import { WondersPage } from '../features/wonders/WondersPage'
import { SurahIndexPage } from '../features/surah-index/SurahIndexPage'

const TRANSLATION_SETTING_KEY = 'quran-dashboard.translation-id'
const THEME_SETTING_KEY = 'quran-dashboard.theme'

type Theme = 'light' | 'dark'

export function App() {
  const { route, navigate } = useDashboardRoute()
  const { surahs, error, loading, retry } = useSurahCatalog()
  const translationCatalog = useTranslationCatalog()
  const [selectedTranslationId, setSelectedTranslationId] = useState(
    () => readPersistedSetting(TRANSLATION_SETTING_KEY) || DEFAULT_TRANSLATION_ID,
  )
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = readPersistedSetting(THEME_SETTING_KEY)
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme
    if (savedTheme !== null) console.warn(`Ignoring invalid saved theme "${savedTheme}".`)
    return 'light'
  })
  const availableTranslation = translationCatalog.translations.find(
    (translation) => translation.id === selectedTranslationId,
  )
  const fallbackTranslation =
    translationCatalog.translations.find(
      (translation) => translation.id === DEFAULT_TRANSLATION_ID,
    ) ?? translationCatalog.translations[0]
  const selectedTranslation = availableTranslation ??
    (!translationCatalog.loading && !translationCatalog.error ? fallbackTranslation : undefined)
  const activeTranslationId = selectedTranslation?.id ?? selectedTranslationId

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    writePersistedSetting(THEME_SETTING_KEY, theme)
  }, [theme])

  useEffect(() => {
    if (translationCatalog.loading || translationCatalog.error) return
    if (availableTranslation || !fallbackTranslation) return

    console.warn(
      `Saved translation "${selectedTranslationId}" is unavailable; using "${fallbackTranslation.id}".`,
    )
    writePersistedSetting(TRANSLATION_SETTING_KEY, fallbackTranslation.id)
  }, [
    availableTranslation,
    fallbackTranslation,
    selectedTranslationId,
    translationCatalog.error,
    translationCatalog.loading,
  ])

  const handleTranslationChange = (id: string) => {
    setSelectedTranslationId(id)
    writePersistedSetting(TRANSLATION_SETTING_KEY, id)
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <a className="brand" href={import.meta.env.BASE_URL} aria-label="قرآن‌خوان، صفحه‌ی اصلی">
          <span className="brand-mark" aria-hidden="true">۞</span>
          <span className="brand-copy">
            <strong>قرآن‌خوان</strong>
            <small>همراهِ خواندن و اندیشه</small>
          </span>
        </a>
        <button
          className="theme-toggle"
          type="button"
          aria-label={theme === 'dark' ? 'تغییر به حالت روشن' : 'تغییر به حالت تیره'}
          title={theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}
          onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
          <span>{theme === 'dark' ? 'حالت روشن' : 'حالت تیره'}</span>
        </button>
      </header>

      <div className="dashboard-layout">
        <SurahSidebar
          route={route}
          navigate={navigate}
        />

        <main className="dashboard-content">
          <h1 className="visually-hidden">قرآن‌خوان</h1>
          {route.view === 'reader' ? (
            <SurahReader
              route={route}
              surahs={surahs}
              loadingList={loading}
              translationCatalog={translationCatalog}
              selectedTranslation={activeTranslationId}
              onTranslationChange={handleTranslationChange}
              navigate={navigate}
            />
          ) : route.view === 'surahs' ? (
            <SurahIndexPage
              surahs={surahs}
              loading={loading}
              error={error}
              onRetry={retry}
              navigate={navigate}
            />
          ) : route.view === 'repetitions' ? (
            <RepetitionPage route={route} navigate={navigate} />
          ) : route.view === 'topics' ? (
            <TopicsPage
              key={route.category}
              route={route}
              translationCatalog={translationCatalog}
              selectedTranslation={activeTranslationId}
              selectedTranslationName={selectedTranslation?.name ?? 'قمشه‌ای'}
              onTranslationChange={handleTranslationChange}
              navigate={navigate}
            />
          ) : (
            <WondersPage route={route} navigate={navigate} />
          )}
        </main>
      </div>

    </div>
  )
}
