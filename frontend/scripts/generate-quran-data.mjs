import assert from 'node:assert/strict'
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const frontendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectDirectory = path.resolve(frontendDirectory, '..')
const dataDirectory = path.join(frontendDirectory, 'public', 'quran-data')

const translationNames = {
  ansarian: 'انصاریان',
  ayati: 'آیتی',
  bahrampour: 'بهرام‌پور',
  fooladvand: 'فولادوند',
  gharaati: 'قرائتی',
  ghomshei: 'قمشه‌ای',
  khorramdel: 'خرمدل',
  khorramshahi: 'خرمشاهی',
  makarem: 'مکارم شیرازی',
  moezzi: 'معزی',
  mojtabavi: 'مجتبوی',
  sadeqi: 'صادقی تهرانی',
  safavi: 'صفوی',
}

const metadataDirectory = path.join(projectDirectory, 'quran_surahs')
const metadataFiles = (await readdir(metadataDirectory))
  .filter((name) => /^\d{3}_.*\.json$/u.test(name))
  .sort()

assert.equal(metadataFiles.length, 114, 'Expected metadata for all 114 surahs.')

const surahs = await Promise.all(metadataFiles.map(async (name) => {
  const filePath = path.join(metadataDirectory, name)
  const metadata = JSON.parse(await readFile(filePath, 'utf8'))

  assert.equal(metadata.number, Number(name.slice(0, 3)), `Surah number mismatch in ${name}.`)
  assert.ok(Number.isInteger(metadata.verse_count) && metadata.verse_count > 0)
  assert.ok(typeof metadata.name === 'string' && metadata.name.length > 0)
  assert.ok(typeof metadata.revelation_place === 'string' && metadata.revelation_place.length > 0)
  assert.ok(!('verses' in metadata), `Duplicate verse data found in ${name}.`)
  assert.ok(!('url' in metadata), `Unexpected URL field found in ${name}.`)

  return metadata
})).then((items) => items.sort((left, right) => left.number - right.number))

for (let index = 0; index < surahs.length; index += 1) {
  assert.equal(surahs[index].number, index + 1, 'Surah metadata has missing or duplicate numbers.')
}

const surahsByNumber = new Map(surahs.map((surah) => [surah.number, surah]))
const arabicSource = JSON.parse(
  await readFile(path.join(projectDirectory, 'quran_uthmani.json'), 'utf8'),
)
assert.equal(arabicSource.length, 114, 'Expected Arabic text for all 114 surahs.')

const arabicSurahs = arabicSource.map((surah) => {
  const metadata = surahsByNumber.get(surah.number)
  assert.ok(metadata, `Arabic text contains unknown surah ${surah.number}.`)
  assert.equal(surah.verse_count, metadata.verse_count, `Arabic verse count mismatch in surah ${surah.number}.`)

  const numberedVerses = surah.verses.filter((verse) => verse.verse !== null)
  assert.equal(numberedVerses.length, metadata.verse_count, `Missing Arabic verses in surah ${surah.number}.`)
  assert.equal(
    new Set(numberedVerses.map((verse) => verse.verse)).size,
    metadata.verse_count,
    `Duplicate Arabic verse numbers in surah ${surah.number}.`,
  )

  for (let verseNumber = 1; verseNumber <= metadata.verse_count; verseNumber += 1) {
    assert.ok(
      numberedVerses.some((verse) => verse.verse === verseNumber && verse.text),
      `Missing Arabic text for ${surah.number}:${verseNumber}.`,
    )
  }

  const hasBasmala = surah.verses.some((verse) => verse.verse === null)
  assert.equal(hasBasmala, surah.number !== 1 && surah.number !== 9)

  return {
    number: surah.number,
    verses: surah.verses.map(({ verse, text }) => ({ verse, text })),
  }
})

const translationsDirectory = path.join(projectDirectory, 'translations')
const translationFiles = (await readdir(translationsDirectory))
  .filter((name) => /^fa\..+\.txt$/u.test(name))
  .sort()
assert.equal(
  translationFiles.length,
  Object.keys(translationNames).length,
  'Translation files and configured display names do not match.',
)

const expectedVerseKeys = new Set(
  surahs.flatMap(({ number, verse_count }) =>
    Array.from({ length: verse_count }, (_, index) => `${number}|${index + 1}`),
  ),
)
const translations = []
const translationData = []

for (const name of translationFiles) {
  const match = /^fa\.(.+)\.txt$/u.exec(name)
  assert.ok(match, `Invalid translation filename ${name}.`)
  const id = match[1]
  const displayName = translationNames[id]
  assert.ok(displayName, `No display name configured for translation ${id}.`)

  const verses = {}
  const actualVerseKeys = new Set()
  const lines = (await readFile(path.join(translationsDirectory, name), 'utf8')).split(/\r?\n/u)

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const firstSeparator = line.indexOf('|')
    const secondSeparator = line.indexOf('|', firstSeparator + 1)
    assert.ok(firstSeparator > 0 && secondSeparator > firstSeparator + 1, `Malformed row in ${name}:${index + 1}.`)

    const surahNumber = Number(line.slice(0, firstSeparator))
    const verseNumber = Number(line.slice(firstSeparator + 1, secondSeparator))
    const text = line.slice(secondSeparator + 1).trim()
    const key = `${surahNumber}|${verseNumber}`

    assert.ok(expectedVerseKeys.has(key), `Invalid verse reference ${key} in ${name}:${index + 1}.`)
    assert.ok(!actualVerseKeys.has(key), `Duplicate verse reference ${key} in ${name}:${index + 1}.`)

    actualVerseKeys.add(key)
    const surahVerses = verses[surahNumber] ??= {}
    surahVerses[verseNumber] = text || null
  }

  assert.equal(
    actualVerseKeys.size,
    expectedVerseKeys.size,
    `Translation ${name} has missing verse records.`,
  )
  for (const key of expectedVerseKeys) {
    assert.ok(actualVerseKeys.has(key), `Translation ${name} is missing verse ${key}.`)
  }

  translations.push({ id, name: displayName })
  translationData.push({ id, verses })
}

translations.sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0)

const translationsOutputDirectory = path.join(dataDirectory, 'translations')
await mkdir(translationsOutputDirectory, { recursive: true })
await Promise.all([
  writeFile(path.join(dataDirectory, 'surahs.json'), JSON.stringify(surahs)),
  writeFile(path.join(dataDirectory, 'arabic.json'), JSON.stringify(arabicSurahs)),
  writeFile(path.join(dataDirectory, 'translations.json'), JSON.stringify(translations)),
  ...translationData.map(({ id, verses }) =>
    writeFile(
      path.join(translationsOutputDirectory, `${id}.json`),
      JSON.stringify(verses),
    ),
  ),
])

console.log(
  `Generated static Quran data: ${surahs.length} surahs, ${translations.length} translations, ${expectedVerseKeys.size} verses per translation.`,
)
