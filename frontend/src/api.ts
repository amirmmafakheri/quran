export interface SurahSummary {
  number: number
  name: string
  name_meaning: string | null
  verse_count: number
  revelation_place: string
}

export interface TranslationSummary {
  id: string
  name: string
}

export interface Verse {
  verse: number | null
  text: string | null
  arabic_text: string | null
}

export interface Surah extends SurahSummary {
  verses: Verse[]
}

interface ArabicSurah {
  number: number
  verses: { verse: number | null; text: string }[]
}

type TranslationVerses = Record<string, Record<string, string | null>>

const DATA_BASE_URL = `${import.meta.env.BASE_URL}quran-data`
export const DEFAULT_TRANSLATION_ID = 'ghomshei'

const jsonRequests = new Map<string, Promise<unknown>>()

function requestJson<T>(path: string): Promise<T> {
  const url = `${DATA_BASE_URL}/${path}`
  const cachedRequest = jsonRequests.get(url)
  if (cachedRequest) return cachedRequest as Promise<T>

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`دریافت داده با خطای ${response.status} روبه‌رو شد.`)
      }
      return response.json() as Promise<T>
    })
    .catch((reason: unknown) => {
      jsonRequests.delete(url)
      throw reason
    })

  jsonRequests.set(url, request)
  return request
}

function abortable<T>(request: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return request
  if (signal.aborted) {
    return Promise.reject(new DOMException('درخواست لغو شد.', 'AbortError'))
  }

  return new Promise((resolve, reject) => {
    const handleAbort = () => {
      signal.removeEventListener('abort', handleAbort)
      reject(new DOMException('درخواست لغو شد.', 'AbortError'))
    }

    signal.addEventListener('abort', handleAbort, { once: true })
    request.then(
      (value) => {
        signal.removeEventListener('abort', handleAbort)
        resolve(value)
      },
      (reason: unknown) => {
        signal.removeEventListener('abort', handleAbort)
        reject(reason)
      },
    )
  })
}

export function getSurahs(): Promise<SurahSummary[]> {
  return requestJson<SurahSummary[]>('surahs.json')
}

export function getTranslations(): Promise<TranslationSummary[]> {
  return requestJson<TranslationSummary[]>('translations.json')
}

export function getSurah(
  number: number,
  translationId: string = DEFAULT_TRANSLATION_ID,
  signal?: AbortSignal,
): Promise<Surah> {
  const request = Promise.all([
    requestJson<SurahSummary[]>('surahs.json'),
    requestJson<ArabicSurah[]>('arabic.json'),
    requestJson<TranslationVerses>(
      `translations/${encodeURIComponent(translationId)}.json`,
    ),
  ]).then(([surahs, arabicSurahs, translationVerses]) => {
    const metadata = surahs.find((surah) => surah.number === number)
    if (!metadata) throw new Error(`اطلاعات سوره‌ی ${number} پیدا نشد.`)

    const arabicSurah = arabicSurahs.find((surah) => surah.number === number)
    if (!arabicSurah) throw new Error(`متن عربی سوره‌ی ${number} پیدا نشد.`)

    const verses = arabicSurah.verses.map(({ verse, text: arabicText }) => {
      const translationSurah = verse === null ? 1 : number
      const translationVerse = verse === null ? 1 : verse
      const text = translationVerses[String(translationSurah)]?.[String(translationVerse)]
      if (text === undefined) {
        throw new Error(`ترجمه‌ی آیه‌ی ${translationVerse} از سوره‌ی ${translationSurah} پیدا نشد.`)
      }
      return { verse, text, arabic_text: arabicText }
    })

    return { ...metadata, verses }
  })

  return abortable(request, signal)
}
