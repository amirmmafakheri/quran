import type { DashboardRoute } from '../../app/useDashboardRoute'
import { dashboardPath } from '../../app/useDashboardRoute'
import { AppLink } from '../../app/AppLink'
import { TOPIC_CATEGORIES } from '../topics/topicsData'
import './SurahSidebar.css'

interface SurahSidebarProps {
  route: DashboardRoute
  navigate: (href: string) => void
}

export function SurahSidebar({ route, navigate }: SurahSidebarProps) {
  const surahSectionActive = route.view === 'surahs' || route.view === 'reader'

  return (
    <aside className="dashboard-sidebar" aria-label="پنل مطالعه">
      <div className="sidebar-heading">
        <span className="sidebar-heading-mark" aria-hidden="true">۞</span>
        <div>
          <strong>مطالعه‌ی قرآن</strong>
        </div>
      </div>

      <nav className="sidebar-navigation" aria-label="بخش‌های داشبورد">
        <AppLink
          href={dashboardPath({ view: 'surahs' })}
          navigate={navigate}
          className={`sidebar-nav-link${surahSectionActive ? ' is-active' : ''}`}
          aria-current={surahSectionActive ? 'page' : undefined}
        >
          <span className="sidebar-nav-icon" aria-hidden="true">☷</span>
          <span>فهرست سوره‌ها</span>
          <span className="sidebar-nav-count">۱۱۴</span>
        </AppLink>
        <AppLink
          href={dashboardPath({ view: 'repetitions', word: '' })}
          navigate={navigate}
          className={`sidebar-nav-link${route.view === 'repetitions' ? ' is-active' : ''}`}
          aria-current={route.view === 'repetitions' ? 'page' : undefined}
        >
          <span className="sidebar-nav-icon" aria-hidden="true">↻</span>
          <span>واژگان پرتکرار</span>
          <span className="sidebar-nav-arrow" aria-hidden="true">‹</span>
        </AppLink>
        <AppLink
          href={dashboardPath({ view: 'topics', category: '', topic: '' })}
          navigate={navigate}
          className={`sidebar-nav-link${route.view === 'topics' ? ' is-active' : ''}`}
          aria-current={route.view === 'topics' ? 'page' : undefined}
        >
          <span className="sidebar-nav-icon" aria-hidden="true">◇</span>
          <span>موضوعات</span>
          <span className="sidebar-nav-arrow" aria-hidden="true">‹</span>
        </AppLink>
        <AppLink
          href={dashboardPath({ view: 'wonders', wonderId: '' })}
          navigate={navigate}
          className={`sidebar-nav-link${route.view === 'wonders' ? ' is-active' : ''}`}
          aria-current={route.view === 'wonders' ? 'page' : undefined}
        >
          <span className="sidebar-nav-icon" aria-hidden="true">✦</span>
          <span>عجایب و معجزات قرآن</span>
          <span className="sidebar-nav-arrow" aria-hidden="true">‹</span>
        </AppLink>
      </nav>

      {route.view === 'repetitions' ? (
        <section className="sidebar-detail" aria-labelledby="sidebar-repetitions-title">
          <div className="sidebar-section-heading">
            <h2 id="sidebar-repetitions-title">واژگان پرتکرار قرآن</h2>
          </div>
        </section>
      ) : route.view === 'topics' ? (
        <section className="sidebar-detail" aria-labelledby="sidebar-topics-title">
          <div className="sidebar-section-heading">
            <h2 id="sidebar-topics-title">دسته‌بندی موضوعات</h2>
          </div>
          <nav className="sidebar-topic-tree" aria-label="موضوعات قرآن">
            {TOPIC_CATEGORIES.map((category) => (
              <div className="sidebar-topic-branch" key={category.id}>
                <AppLink
                  href={dashboardPath({
                    view: 'topics',
                    category: category.id,
                    topic: '',
                  })}
                  navigate={navigate}
                  className={`topic-category-link${route.category === category.id ? ' is-selected' : ''}`}
                  aria-current={route.category === category.id && !route.topic ? 'page' : undefined}
                >
                  <span aria-hidden="true">
                    {route.category === category.id ? '⌄' : '‹'}
                  </span>
                  <span>{category.label}</span>
                </AppLink>
                {route.category === category.id && (
                  <div className="sidebar-topic-children">
                    {category.topics.map((topic) => (
                      <AppLink
                        key={topic.id}
                        href={dashboardPath({
                          view: 'topics',
                          category: category.id,
                          topic: topic.id,
                        })}
                        navigate={navigate}
                        className={`topic-child-link${route.topic === topic.id ? ' is-selected' : ''}`}
                        aria-current={route.topic === topic.id ? 'page' : undefined}
                      >
                        {topic.label}
                      </AppLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </section>
      ) : route.view === 'wonders' ? (
        <section className="sidebar-detail" aria-labelledby="sidebar-wonders-title">
          <div className="sidebar-section-heading">
            <h2 id="sidebar-wonders-title">عجایب و معجزات قرآن</h2>
          </div>
        </section>
      ) : null}
    </aside>
  )
}
