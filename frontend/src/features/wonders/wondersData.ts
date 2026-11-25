export interface WonderReference {
  label: string
  surahNumber: number
}

export interface QuranWonder {
  id: string
  title: string
  references: WonderReference[]
  notes: string[]
}

const wonderMarkdownFiles = import.meta.glob<string>(
  './content/*.md',
  { eager: true, query: '?raw', import: 'default' },
)

function parseWonderMarkdown(path: string, markdown: string): QuranWonder {
  const filenameMatch = /(?:^|\/)(\d+(?:-[a-z0-9][a-z0-9-]*)?|[a-z0-9][a-z0-9-]*)\.md$/u.exec(path)
  const sectionsMatch =
    /^# (.+)\r?\n\r?\n## آیات مرتبط\r?\n([\s\S]*?)\r?\n## یادداشت تحلیلی\r?\n([\s\S]*?)\s*$/u.exec(markdown)

  if (!filenameMatch || !sectionsMatch) {
    throw new Error(`Invalid wonder Markdown structure: ${path}`)
  }

  const filename = filenameMatch[1]
  const id = filename.replace(/^\d+-/u, '')
  const [, title, referencesContent, notesContent] = sectionsMatch
  const references = referencesContent
    .split(/\r?\n/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const referenceMatch = /^- (.+?) \| (\d+)$/u.exec(line)

      if (!referenceMatch) {
        throw new Error(`Invalid verse reference in wonder Markdown: ${path}`)
      }

      const [, label, surahNumberText] = referenceMatch
      const surahNumber = Number(surahNumberText)
      if (!Number.isInteger(surahNumber) || surahNumber < 1 || surahNumber > 114) {
        throw new Error(`Invalid surah number in wonder Markdown: ${path}`)
      }

      return { label, surahNumber }
    })
  const notes = notesContent
    .trim()
    .split(/\r?\n\s*\r?\n/u)
    .map((note) => note.trim())
    .filter(Boolean)

  if (references.length === 0 || notes.length === 0) {
    throw new Error(`Wonder Markdown must include references and notes: ${path}`)
  }

  return { id, title, references, notes }
}

export const QURAN_WONDERS: QuranWonder[] = Object.entries(wonderMarkdownFiles)
  .sort(([pathA], [pathB]) => pathA.localeCompare(pathB, 'en'))
  .map(([path, markdown]) => parseWonderMarkdown(path, markdown))
