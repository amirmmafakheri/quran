import type { DashboardRoute } from '../../app/useDashboardRoute'
import type { TranslationCatalog } from '../../app/useTranslationCatalog'
import { findTopic, findTopicCategory } from './topicsData'
import { TopicVerseResults } from './TopicVerseResults'
import './TopicsPage.css'

interface TopicsPageProps {
  route: DashboardRoute
  translationCatalog: TranslationCatalog
  selectedTranslation: string
  selectedTranslationName: string
  onTranslationChange: (id: string, name: string) => void
  navigate: (href: string) => void
}

export function TopicsPage({
  route,
  translationCatalog,
  selectedTranslation,
  selectedTranslationName,
  onTranslationChange,
  navigate,
}: TopicsPageProps) {
  const selectedCategory = findTopicCategory(route.category)
  const selectedTopic = findTopic(route.category, route.topic)
  const verseReferences = selectedTopic?.verseReferences ?? []

  return (
    <section className="feature-page topics-page" aria-labelledby="topics-title">
      <span className="feature-page-icon" aria-hidden="true">◇</span>
      <span className="section-kicker">راهنمای موضوعی</span>
      <h2 id="topics-title">موضوعات قرآن</h2>
      <p className="feature-page-lead">
        دسته و موضوع دلخواهتان را از پنل کناری انتخاب کنید.
      </p>

      {verseReferences.length > 0 ? (
        <TopicVerseResults
          references={verseReferences}
          translationId={selectedTranslation}
          translationCatalog={translationCatalog}
          translationName={selectedTranslationName}
          onTranslationChange={onTranslationChange}
          topicName={selectedTopic?.label ?? ''}
          navigate={navigate}
        />
      ) : (
        <aside className="topic-selection" aria-live="polite">
          {selectedTopic && selectedCategory ? (
            <>
              <div className="topic-selection-heading">
                <span className="topic-category-symbol" aria-hidden="true">
                  {selectedCategory.icon}
                </span>
                <div>
                  <span>{selectedCategory.label}</span>
                  <h3>{selectedTopic.label}</h3>
                </div>
              </div>
              <div className="feature-empty-state" role="status">
                <span className="empty-state-mark" aria-hidden="true">⌕</span>
                <strong>آیه‌ای برای این موضوع ثبت نشده است</strong>
                <p>برای نمایش آیات مرتبط با «{selectedTopic.label}»، داده‌ی ارجاع موضوعی باید افزوده شود.</p>
              </div>
            </>
          ) : (
            <div className="topic-selection-hint">
              <span aria-hidden="true">✦</span>
              <strong>
                {selectedCategory
                  ? `یک موضوع از دسته‌ی ${selectedCategory.label} انتخاب کنید`
                  : 'یک موضوع را از پنل کناری انتخاب کنید'}
              </strong>
              <p>فهرست دسته‌ها و موضوعات در پنل کناری قرار دارد.</p>
            </div>
          )}
        </aside>
      )}
    </section>
  )
}
