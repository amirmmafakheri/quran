import { useState } from 'react'
import type { Verse } from '../../api'
import './VerseCard.css'

interface VerseCardProps {
  surahNumber: number
  verse: Verse
}

const formatNumber = (value: number) => value.toLocaleString('fa-IR')

export function VerseCard({ surahNumber, verse }: VerseCardProps) {
  const [expanded, setExpanded] = useState(false)
  const verseId = verse.verse ?? 'opening'
  const arabicPanelId = `arabic-${surahNumber}-${verseId}`
  const translationText = verse.text ?? 'ترجمه‌ی این آیه برای این مترجم ثبت نشده است.'

  return (
    <article
      className={[
        'verse-card',
        verse.verse === null ? 'opening-verse' : '',
        expanded ? 'is-expanded' : '',
      ].filter(Boolean).join(' ')}
    >
      {verse.verse === null ? (
        <span className="opening-label">آغاز سوره</span>
      ) : (
        <span className="verse-number">{formatNumber(verse.verse)}</span>
      )}
      {verse.arabic_text ? (
        <button
          type="button"
          className="verse-translation-button"
          aria-expanded={expanded}
          aria-controls={arabicPanelId}
          onClick={() => setExpanded((value) => !value)}
        >
          <span>{translationText}</span>
          <span className="verse-toggle-icon" aria-hidden="true">⌄</span>
        </button>
      ) : (
        <p>{translationText}</p>
      )}
      <span className="verse-decoration" aria-hidden="true">✦</span>
      {verse.arabic_text && (
        <div
          className="verse-arabic-panel"
          id={arabicPanelId}
          aria-hidden={!expanded}
        >
          <div className="verse-arabic-inner">
            <p lang="ar" dir="rtl">
              {verse.arabic_text.split(/(\u0648\u06df)/g).map((part, index) =>
                part === '\u0648\u06df' ? (
                  <span className="verse-quranic-waw" key={index}>{part}</span>
                ) : part
              )}
            </p>
          </div>
        </div>
      )}
    </article>
  )
}
