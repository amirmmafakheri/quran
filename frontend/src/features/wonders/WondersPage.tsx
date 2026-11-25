import { AppLink } from '../../app/AppLink'
import { dashboardPath, type DashboardRoute } from '../../app/useDashboardRoute'
import { QURAN_WONDERS } from './wondersData'
import './WondersPage.css'

interface WondersPageProps {
  route: DashboardRoute
  navigate: (href: string) => void
}

export function WondersPage({ route, navigate }: WondersPageProps) {
  const wonder = QURAN_WONDERS.find(({ id }) => id === route.wonderId)

  if (route.wonderId && !wonder) {
    return (
      <section className="wonders-page" aria-labelledby="wonders-title">
        <AppLink
          href={dashboardPath({ view: 'wonders', wonderId: '' })}
          navigate={navigate}
          className="wonders-back-link"
        >
          <span aria-hidden="true">→</span>
          بازگشت به عجایب و معجزات قرآن
        </AppLink>
        <h2 id="wonders-title">این موضوع پیدا نشد</h2>
        <p className="wonders-detail-intro">ممکن است نشانی موضوع تغییر کرده یا نادرست باشد.</p>
      </section>
    )
  }

  if (wonder) {
    const wonderIndex = QURAN_WONDERS.indexOf(wonder)

    return (
      <article className="wonders-page wonder-detail" aria-labelledby="wonders-title">
        <AppLink
          href={dashboardPath({ view: 'wonders', wonderId: '' })}
          navigate={navigate}
          className="wonders-back-link"
        >
          <span aria-hidden="true">→</span>
          همه‌ی عجایب و معجزات قرآن
        </AppLink>
        <header className="wonders-detail-heading">
          <span className="wonder-number">
            {(wonderIndex + 1).toLocaleString('fa-IR')}
          </span>
          <div>
            <span className="section-kicker">یادداشت موضوعی</span>
            <h2 id="wonders-title">{wonder.title}</h2>
            <p className="wonders-detail-intro">
              یادداشت تحلیلی و ارجاع‌های قرآنی مرتبط با این موضوع.
            </p>
          </div>
        </header>

        <nav className="wonder-references" aria-label={`آیات مرتبط با ${wonder.title}`}>
          <span>آیات مرتبط:</span>
          {wonder.references.map((reference) => (
            <AppLink
              key={reference.label}
              href={dashboardPath({ view: 'reader', surah: reference.surahNumber })}
              navigate={navigate}
              className="wonder-reference-link"
            >
              {reference.label}
            </AppLink>
          ))}
        </nav>
        <div className="wonder-detail-notes">
          {wonder.notes.map((note) => <p key={note}>{note}</p>)}
        </div>
      </article>
    )
  }

  return (
    <section className="wonders-page" aria-labelledby="wonders-title">
      <header className="wonders-heading">
        <span className="wonders-icon" aria-hidden="true">✦</span>
        <div>
          <span className="section-kicker">مطالعه‌ی موضوعی</span>
          <h2 id="wonders-title">عجایب و معجزات قرآن</h2>
          <p>آیات مرتبط و دیدگاه‌های تفسیری درباره‌ی نشانه‌های آفرینش و جهان.</p>
        </div>
      </header>

      <p className="wonders-caution">
        این موضوع‌ها یکسان و قطعی تفسیر نشده‌اند؛ پیوندهای علمیِ پیشنهادی را باید به‌عنوان دیدگاه و محل گفت‌وگو خواند، نه اثبات قطعی. ادعاهای درمانی نیز جایگزین مشورت پزشکی نیستند.
      </p>

      <div className="wonders-list-heading">
        <h3>موضوع‌ها</h3>
        <span>{QURAN_WONDERS.length.toLocaleString('fa-IR')} موضوع</span>
      </div>

      <div className="wonders-list">
        {QURAN_WONDERS.map((wonder, index) => (
          <AppLink
            key={wonder.id}
            href={dashboardPath({ view: 'wonders', wonderId: wonder.id })}
            navigate={navigate}
            className="wonder-card"
          >
            <span className="wonder-number">
              {(index + 1).toLocaleString('fa-IR')}
            </span>
            <span className="wonder-card-copy">
              <span className="wonder-title">{wonder.title}</span>
              <span className="wonder-card-description">{wonder.notes[0]}</span>
            </span>
            <span className="wonder-card-arrow" aria-hidden="true">←</span>
          </AppLink>
        ))}
      </div>
    </section>
  )
}
