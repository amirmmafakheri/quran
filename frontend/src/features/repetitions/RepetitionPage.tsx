import type { DashboardRoute } from '../../app/useDashboardRoute'
import { dashboardPath } from '../../app/useDashboardRoute'
import { AppLink } from '../../app/AppLink'
import { REPETITION_WORDS } from './repetitionData'
import './RepetitionPage.css'

interface RepetitionPageProps {
  route: DashboardRoute
  navigate: (href: string) => void
}

export function RepetitionPage({ route, navigate }: RepetitionPageProps) {
  const normalizedRouteWord = normalizeSearch(route.word)
  const selectedWord = REPETITION_WORDS.find((item) =>
    [item.pathTerm, item.word, ...item.searchTerms]
      .some((term) => normalizeSearch(term) === normalizedRouteWord),
  )

  function toggleWord(pathTerm: string, isExpanded: boolean) {
    navigate(isExpanded
      ? dashboardPath({ view: 'repetitions', word: '' })
      : dashboardPath({ view: 'repetitions', word: pathTerm }))
  }

  return (
    <section className="feature-page repetition-page" aria-labelledby="repetition-title">
      <header className="repetition-heading">
        <span className="feature-page-icon" aria-hidden="true">✦</span>
        <div>
          <h2 id="repetition-title">واژگان پرتکرار قرآن</h2>
        </div>
      </header>

      {route.word && !selectedWord && (
        <div className="repetition-analysis repetition-analysis-empty" role="status">
          <strong>«{route.word}» در فهرست واژه‌های منتخب نیست.</strong>
          <p>برای ارائه‌ی تکرار دقیق این مورد، داده‌ی شمارش ریشه‌ها و مشتقات آن لازم است.</p>
        </div>
      )}

      <div className="repetition-list-heading">
        <div>
          <h3>فهرست واژه‌ها</h3>
          <p>{REPETITION_WORDS.length.toLocaleString('fa-IR')} مورد</p>
        </div>
      </div>

      <div className="repetition-card-list">
        {REPETITION_WORDS.map((item) => {
          const isExpanded = selectedWord?.rank === item.rank
          const analysisPanelId = `repetition-analysis-${item.rank}`
          const wordHref = dashboardPath({ view: 'repetitions', word: item.pathTerm })

          return (
            <article
              key={item.rank}
              className={`repetition-card ${isExpanded ? 'is-expanded' : ''}`}
            >
              <a
                href={wordHref}
                className="repetition-card-trigger"
                title={`نمایش یادداشت تحلیلی «${item.word}»`}
                aria-current={isExpanded ? 'page' : undefined}
                aria-expanded={isExpanded}
                aria-controls={analysisPanelId}
                onClick={(event) => {
                  if (
                    event.button !== 0 ||
                    event.metaKey ||
                    event.ctrlKey ||
                    event.shiftKey ||
                    event.altKey
                  ) {
                    return
                  }

                  event.preventDefault()
                  toggleWord(item.pathTerm, isExpanded)
                }}
              >
                <span className="repetition-rank">
                  {item.rank.toLocaleString('fa-IR')}
                </span>
                <span className="repetition-card-content">
                  <span className="repetition-card-primary">
                    <span className="repetition-card-word" lang="ar" dir="rtl">
                      {item.word}
                    </span>
                    <span className="repetition-card-chevron" aria-hidden="true">⌄</span>
                  </span>
                  <span className="repetition-card-meta">
                    <span>{item.approximateCount} بار</span>
                    <span className="repetition-meta-divider" aria-hidden="true">·</span>
                    <span>{item.domain}</span>
                  </span>
                </span>
                <span className="repetition-card-decoration" aria-hidden="true">✦</span>
              </a>
              <div
                className="repetition-card-panel"
                id={analysisPanelId}
                role="region"
                aria-hidden={!isExpanded}
                aria-label={`یادداشت تحلیلی واژه‌ی ${item.word}`}
              >
                <div className="repetition-card-panel-inner">
                  <div className="repetition-analysis-copy">
                    {item.analysis.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  </div>
                </div>
              </div>
            </article>
          )
        })}
      </div>

      <AppLink
        href={dashboardPath({ view: 'topics', category: '', topic: '' })}
        navigate={navigate}
        className="feature-next-link"
      >
        رفتن به موضوعات <span aria-hidden="true">←</span>
      </AppLink>
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
}
