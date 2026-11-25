import { DEFAULT_TRANSLATION_ID } from '../api'
import type { TranslationSummary } from '../api'
import './TranslationPicker.css'

interface TranslationPickerProps {
  id: string
  value: string
  translations: TranslationSummary[]
  loading: boolean
  error: string | null
  onChange: (id: string, name: string) => void
  onRetry: () => void
}

export function TranslationPicker({
  id,
  value,
  translations,
  loading,
  error,
  onChange,
  onRetry,
}: TranslationPickerProps) {
  return (
    <div className="translation-picker">
      <label htmlFor={id}>مترجم</label>
      {error ? (
        <div className="translation-list-error" role="alert">
          <span>فهرست مترجمان بارگذاری نشد.</span>
          <button type="button" onClick={onRetry}>
            تلاش دوباره
          </button>
        </div>
      ) : (
        <select
          id={id}
          value={value}
          disabled={loading || translations.length === 0}
          onChange={(event) => {
            const selected = translations.find(
              (translation) => translation.id === event.target.value,
            )
            if (selected) onChange(selected.id, selected.name)
          }}
        >
          {translations.length === 0 && (
            <option value={DEFAULT_TRANSLATION_ID}>
              {loading ? 'در حال دریافت...' : 'مترجمی موجود نیست'}
            </option>
          )}
          {translations.map((translation) => (
            <option key={translation.id} value={translation.id}>
              {translation.name}
            </option>
          ))}
        </select>
      )}
    </div>
  )
}
