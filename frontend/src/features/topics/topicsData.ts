export interface TopicVerseReferenceGroup {
  number: number
  verses: readonly number[]
}

interface TopicReferenceFile {
  surahs: TopicVerseReferenceGroup[]
}

const topicReferenceFiles = import.meta.glob<TopicReferenceFile>(
  './data/**/*.json',
  { eager: true, import: 'default' },
)

export interface QuranTopic {
  id: string
  label: string
  verseReferences?: readonly TopicVerseReferenceGroup[]
}

export interface QuranTopicCategory {
  id: string
  label: string
  icon: string
  description: string
  topics: QuranTopic[]
}

const TOPIC_CATEGORY_DATA: QuranTopicCategory[] = [
  {
    id: 'belief',
    label: 'خدا و ایمان',
    icon: '✧',
    description: 'مفاهیم اعتقادی و ایمانی',
    topics: [
      { id: 'tawhid', label: 'توحید' },
      { id: 'divine-names', label: 'نام‌ها و صفات خداوند' },
      { id: 'angels', label: 'فرشتگان' },
      { id: 'faith', label: 'ایمان' },
      { id: 'hereafter', label: 'آخرت و قیامت' },
      { id: 'knowledge', label: 'علم و دانش' },
    ],
  },
  {
    id: 'prophets',
    label: 'پیامبران و داستان‌ها',
    icon: '◈',
    description: 'پیامبران و روایت‌های قرآنی',
    topics: [
      { id: 'adam', label: 'آدم (ع)' },
      { id: 'idris', label: 'ادریس (ع)' },
      { id: 'noah', label: 'نوح (ع)' },
      { id: 'hud', label: 'هود (ع)' },
      { id: 'salih', label: 'صالح (ع)' },
      { id: 'abraham', label: 'ابراهیم (ع)' },
      { id: 'lut', label: 'لوط (ع)' },
      { id: 'ismail', label: 'اسماعیل (ع)' },
      { id: 'ishaq', label: 'اسحاق (ع)' },
      { id: 'yaqub', label: 'یعقوب (ع)' },
      { id: 'yusuf', label: 'یوسف (ع)' },
      { id: 'ayyub', label: 'ایوب (ع)' },
      { id: 'shuayb', label: 'شعیب (ع)' },
      { id: 'moses', label: 'موسی (ع)' },
      { id: 'harun', label: 'هارون (ع)' },
      { id: 'dhul-kifl', label: 'ذوالکفل (ع)' },
      { id: 'dawud', label: 'داوود (ع)' },
      { id: 'solomon', label: 'سلیمان (ع)' },
      { id: 'ilyas', label: 'الیاس (ع)' },
      { id: 'alyasa', label: 'الیسع (ع)' },
      { id: 'yunus', label: 'یونس (ع)' },
      { id: 'zakariya', label: 'زکریا (ع)' },
      { id: 'yahya', label: 'یحیی (ع)' },
      { id: 'jesus', label: 'عیسی (ع)' },
      { id: 'muhammad', label: 'محمد (ص)' },
      { id: 'quran-stories', label: 'داستان‌های قرآن' },
    ],
  },
  {
    id: 'worship',
    label: 'عبادت و بندگی',
    icon: '☼',
    description: 'عبادت‌ها و نیایش',
    topics: [
      { id: 'prayer', label: 'نماز' },
      { id: 'fasting', label: 'روزه' },
      { id: 'charity', label: 'زکات و انفاق' },
      { id: 'hajj', label: 'حج' },
      { id: 'prayer-supplication', label: 'دعا و نیایش' },
    ],
  },
  {
    id: 'ethics',
    label: 'اخلاق و رفتار',
    icon: '❋',
    description: 'ارزش‌های اخلاقی و رفتار نیک',
    topics: [
      { id: 'patience', label: 'صبر' },
      { id: 'gratitude', label: 'شکرگزاری' },
      { id: 'justice', label: 'عدالت' },
      { id: 'forgiveness', label: 'گذشت و بخشش' },
      { id: 'parents', label: 'پدر و مادر' },
    ],
  },
  {
    id: 'society',
    label: 'خانواده و جامعه',
    icon: '⌂',
    description: 'روابط خانوادگی و اجتماعی',
    topics: [
      { id: 'family', label: 'خانواده' },
      { id: 'orphans', label: 'یتیمان' },
      { id: 'neighbors', label: 'همسایگان' },
      { id: 'justice-social', label: 'حقوق مردم' },
      { id: 'wealth', label: 'اموال و مسئولیت اجتماعی' },
    ],
  },
  {
    id: 'creation',
    label: 'آفرینش و طبیعت',
    icon: '❈',
    description: 'نشانه‌های آفرینش در جهان',
    topics: [
      { id: 'heavens', label: 'آسمان' },
      { id: 'earth', label: 'زمین' },
      { id: 'water', label: 'آب و باران' },
      { id: 'sea', label: 'دریا' },
      { id: 'plants', label: 'گیاهان' },
      { id: 'sun-moon', label: 'خورشید و ماه' },
    ],
  },
  {
    id: 'animals',
    label: 'حیوانات',
    icon: '❋',
    description: 'جانوران نام‌برده در قرآن',
    topics: [
      { id: 'ant', label: 'مورچه' },
      { id: 'bee', label: 'زنبور عسل' },
      { id: 'camel', label: 'شتر' },
      { id: 'elephant', label: 'فیل' },
      { id: 'spider', label: 'عنکبوت' },
    ],
  },
]

export const TOPIC_CATEGORIES: QuranTopicCategory[] = TOPIC_CATEGORY_DATA.map(
  (category) => ({
    ...category,
    topics: category.topics.map((topic) => ({
      ...topic,
      verseReferences:
        topicReferenceFiles[`./data/${category.id}/${topic.id}.json`]?.surahs ?? [],
    })),
  }),
)

export function findTopicCategory(categoryId: string): QuranTopicCategory | undefined {
  return TOPIC_CATEGORIES.find((category) => category.id === categoryId)
}

export function findTopic(
  categoryId: string,
  topicId: string,
): QuranTopic | undefined {
  return findTopicCategory(categoryId)?.topics.find((topic) => topic.id === topicId)
}
