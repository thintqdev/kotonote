/**
 * Dữ liệu demo từ vựng — UI tiếng Việt: nghĩa / ví dụ dịch hiển thị khi có; UI tiếng Nhật: ưu tiên nhãn tiếng Nhật.
 */

export const VOCAB_PAGE_SIZE = 24;

/** Số tối đa trong một phiên học flashcard demo */
export const STUDY_SESSION_SIZE = 10;

export const VOCAB_TAB_IDS = ['all', 'learned', 'unlearned', 'favorite'];

export const VOCAB_SORT_IDS = ['newest', 'oldest', 'reading'];

const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

/** @type {ReadonlyArray<{
 *   id: string,
 *   order: number,
 *   jlpt: string,
 *   pos: 'noun' | 'verb' | 'i_adj' | 'na_adj' | 'adv',
 *   surface: string,
 *   reading: string,
 *   meaningVi: string,
 *   meaningJa: string,
 *   exampleJaHtml: string,
 *   exampleVi: string,
 *   learned: boolean,
 *   favorite: boolean
 * }>} */
export const VOCAB_ITEMS = [
  {
    id: 'v1',
    order: 24,
    jlpt: 'N3',
    pos: 'noun',
    surface: '情報',
    reading: 'じょうほう',
    meaningVi: 'thông tin',
    meaningJa: '情報',
    exampleJaHtml:
      'この<ruby>情報<rt>じょうほう</rt></ruby>は<ruby>重要<rt>じゅうよう</rt></ruby>です。',
    exampleVi: 'Thông tin này quan trọng.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v2',
    order: 23,
    jlpt: 'N3',
    pos: 'verb',
    surface: '確かめる',
    reading: 'たしかめる',
    meaningVi: 'xác nhận, kiểm tra',
    meaningJa: '確かめる',
    exampleJaHtml:
      'メールの<ruby>宛名<rt>あてな</rt></ruby>を<ruby>確<rt>たし</rt></ruby>かめてください。',
    exampleVi: 'Hãy kiểm tra địa chỉ email.',
    learned: true,
    favorite: true,
  },
  {
    id: 'v3',
    order: 22,
    jlpt: 'N3',
    pos: 'i_adj',
    surface: '詳しい',
    reading: 'くわしい',
    meaningVi: 'chi tiết, tường tận',
    meaningJa: '詳しい',
    exampleJaHtml: 'この件については、もっと<ruby>詳<rt>くわ</rt></ruby>しく話したいです。',
    exampleVi: 'Về việc này tôi muốn nói kỹ hơn.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v4',
    order: 21,
    jlpt: 'N3',
    pos: 'adv',
    surface: '特に',
    reading: 'とくに',
    meaningVi: 'đặc biệt là',
    meaningJa: '特に',
    exampleJaHtml:
      '<ruby>朝<rt>あさ</rt></ruby>は<ruby>混<rt>こ</rt></ruby>みます。<ruby>特<rt>とく</rt></ruby>に月曜日は。',
    exampleVi: 'Buổi sáng đông. Đặc biệt là thứ Hai.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v5',
    order: 20,
    jlpt: 'N3',
    pos: 'na_adj',
    surface: '便利',
    reading: 'べんり',
    meaningVi: 'tiện lợi',
    meaningJa: '便利だ',
    exampleJaHtml:
      'この<ruby>駅<rt>えき</rt></ruby>の<ruby>近<rt>ちか</rt></ruby>くに<ruby>住<rt>す</rt></ruby>むと<ruby>便利<rt>べんり</rt></ruby>です。',
    exampleVi: 'Sống gần ga này thì rất tiện.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v6',
    order: 19,
    jlpt: 'N4',
    pos: 'noun',
    surface: '予定',
    reading: 'よてい',
    meaningVi: 'kế hoạch, dự định',
    meaningJa: '予定',
    exampleJaHtml:
      '<ruby>明日<rt>あした</rt></ruby>の<ruby>予定<rt>よてい</rt></ruby>を<ruby>教<rt>おし</rt></ruby>えてください。',
    exampleVi: 'Cho tôi biết kế hoạch ngày mai nhé.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v7',
    order: 18,
    jlpt: 'N4',
    pos: 'verb',
    surface: '忘れる',
    reading: 'わすれる',
    meaningVi: 'quên',
    meaningJa: '忘れる',
    exampleJaHtml:
      '<ruby>鍵<rt>かぎ</rt></ruby>を<ruby>取<rt>と</rt></ruby>るのを<ruby>忘<rt>わす</rt></ruby>れないでください。',
    exampleVi: 'Đừng quên lấy chìa khóa.',
    learned: false,
    favorite: true,
  },
  {
    id: 'v8',
    order: 17,
    jlpt: 'N4',
    pos: 'i_adj',
    surface: '難しい',
    reading: 'むずかしい',
    meaningVi: 'khó',
    meaningJa: '難しい',
    exampleJaHtml:
      'この<ruby>文<rt>ぶん</rt></ruby>は<ruby>少<rt>すこ</rt></ruby>し<ruby>難<rt>むずか</rt></ruby>しいです。',
    exampleVi: 'Câu này hơi khó.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v9',
    order: 16,
    jlpt: 'N4',
    pos: 'adv',
    surface: '少し',
    reading: 'すこし',
    meaningVi: 'một chút',
    meaningJa: '少し',
    exampleJaHtml:
      '<ruby>部屋<rt>へや</rt></ruby>が<ruby>少<rt>すこ</rt></ruby>し<ruby>狭<rt>せま</rt></ruby>いです。',
    exampleVi: 'Phòng hơi chật một chút.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v10',
    order: 15,
    jlpt: 'N3',
    pos: 'noun',
    surface: '性格',
    reading: 'せいかく',
    meaningVi: 'tính cách',
    meaningJa: '性格',
    exampleJaHtml: '彼の<ruby>性格<rt>せいかく</rt></ruby>は<ruby>穏<rt>おだ</rt></ruby>やかだ。',
    exampleVi: 'Tính cách anh ấy hiền lành.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v11',
    order: 14,
    jlpt: 'N3',
    pos: 'verb',
    surface: '比べる',
    reading: 'くらべる',
    meaningVi: 'so sánh',
    meaningJa: '比べる',
    exampleJaHtml:
      'この二つを<ruby>比<rt>くら</rt></ruby>べてみましょう。',
    exampleVi: 'Hãy thử so sánh hai cái này.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v12',
    order: 13,
    jlpt: 'N5',
    pos: 'noun',
    surface: '時間',
    reading: 'じかん',
    meaningVi: 'thời gian',
    meaningJa: '時間',
    exampleJaHtml:
      '<ruby>時間<rt>じかん</rt></ruby>がありません。',
    exampleVi: 'Không có thời gian.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v13',
    order: 12,
    jlpt: 'N5',
    pos: 'verb',
    surface: '行く',
    reading: 'いく',
    meaningVi: 'đi',
    meaningJa: '行く',
    exampleJaHtml:
      'どこへ<ruby>行<rt>い</rt></ruby>きますか。',
    exampleVi: 'Anh/chị đi đâu?',
    learned: true,
    favorite: true,
  },
  {
    id: 'v14',
    order: 11,
    jlpt: 'N3',
    pos: 'na_adj',
    surface: '簡単',
    reading: 'かんたん',
    meaningVi: 'đơn giản',
    meaningJa: '簡単だ',
    exampleJaHtml:
      'この<ruby>問題<rt>もんだい</rt></ruby>は<ruby>簡単<rt>かんたん</rt></ruby>です。',
    exampleVi: 'Bài này dễ.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v15',
    order: 10,
    jlpt: 'N3',
    pos: 'adv',
    surface: '必ず',
    reading: 'かならず',
    meaningVi: 'chắc chắn, nhất định',
    meaningJa: '必ず',
    exampleJaHtml:
      '<ruby>明日<rt>あした</rt></ruby>は<ruby>必<rt>かなら</rt></ruby>ず<ruby>来<rt>き</rt></ruby>てください。',
    exampleVi: 'Ngày mai nhất định phải đến nhé.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v16',
    order: 9,
    jlpt: 'N4',
    pos: 'noun',
    surface: '理由',
    reading: 'りゆう',
    meaningVi: 'lý do',
    meaningJa: '理由',
    exampleJaHtml:
      '<ruby>遅<rt>おく</rt></ruby>れた<ruby>理由<rt>りゆう</rt></ruby>を<ruby>説明<rt>せつめい</rt></ruby>します。',
    exampleVi: 'Tôi giải thích lý do muộn.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v17',
    order: 8,
    jlpt: 'N4',
    pos: 'i_adj',
    surface: '暑い',
    reading: 'あつい',
    meaningVi: 'nóng (trời)',
    meaningJa: '暑い',
    exampleJaHtml:
      'きょうはとても<ruby>暑<rt>あつ</rt></ruby>いですね。',
    exampleVi: 'Hôm nay trời nóng thật nhỉ.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v18',
    order: 7,
    jlpt: 'N3',
    pos: 'verb',
    surface: '調べる',
    reading: 'しらべる',
    meaningVi: 'tra cứu, điều tra',
    meaningJa: '調べる',
    exampleJaHtml:
      '<ruby>単語<rt>たんご</rt></ruby>の<ruby>意味<rt>いみ</rt></ruby>を<ruby>調<rt>しら</rt></ruby>べます。',
    exampleVi: 'Tôi tra nghĩa từ.',
    learned: false,
    favorite: true,
  },
  {
    id: 'v19',
    order: 6,
    jlpt: 'N3',
    pos: 'noun',
    surface: '文化',
    reading: 'ぶんか',
    meaningVi: 'văn hóa',
    meaningJa: '文化',
    exampleJaHtml:
      '日本の<ruby>文化<rt>ぶんか</rt></ruby>に<ruby>興味<rt>きょうみ</rt></ruby>があります。',
    exampleVi: 'Tôi thích văn hóa Nhật.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v20',
    order: 5,
    jlpt: 'N5',
    pos: 'adv',
    surface: 'よく',
    reading: 'よく',
    meaningVi: 'thường xuyên; kỹ',
    meaningJa: 'よく',
    exampleJaHtml:
      'わたしはよくここに<ruby>来<rt>き</rt></ruby>ます。',
    exampleVi: 'Tôi hay đến đây.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v21',
    order: 4,
    jlpt: 'N4',
    pos: 'na_adj',
    surface: '元気',
    reading: 'げんき',
    meaningVi: 'khỏe mạnh, vui vẻ',
    meaningJa: '元気だ',
    exampleJaHtml:
      '<ruby>元気<rt>げんき</rt></ruby>で<ruby>過<rt>す</rt></ruby>ごしていますか。',
    exampleVi: 'Anh/chị có khỏe không?',
    learned: false,
    favorite: false,
  },
  {
    id: 'v22',
    order: 3,
    jlpt: 'N3',
    pos: 'verb',
    surface: '伝える',
    reading: 'つたえる',
    meaningVi: 'truyền đạt, báo tin',
    meaningJa: '伝える',
    exampleJaHtml:
      '<ruby>状況<rt>じょうきょう</rt></ruby>を<ruby>上司<rt>じょうし</rt></ruby>に<ruby>伝<rt>つた</rt></ruby>えました。',
    exampleVi: 'Tôi đã báo tình hình cho cấp trên.',
    learned: true,
    favorite: false,
  },
  {
    id: 'v23',
    order: 2,
    jlpt: 'N3',
    pos: 'noun',
    surface: '機会',
    reading: 'きかい',
    meaningVi: 'cơ hội',
    meaningJa: '機会',
    exampleJaHtml:
      'この<ruby>機会<rt>きかい</rt></ruby>に<ruby>話<rt>はな</rt></ruby>したいことがあります。',
    exampleVi: 'Tôi có điều muốn nói nhân dịp này.',
    learned: false,
    favorite: false,
  },
  {
    id: 'v24',
    order: 1,
    jlpt: 'N4',
    pos: 'i_adj',
    surface: '明るい',
    reading: 'あかるい',
    meaningVi: 'sáng (phòng, tính cách)',
    meaningJa: '明るい',
    exampleJaHtml:
      'この<ruby>部屋<rt>へや</rt></ruby>は<ruby>明<rt>あか</rt></ruby>るいです。',
    exampleVi: 'Phòng này sáng.',
    learned: true,
    favorite: false,
  },
];

export function getDistinctJlptLevels() {
  const seen = new Set(VOCAB_ITEMS.map((i) => i.jlpt));
  return JLPT_ORDER.filter((lv) => seen.has(lv));
}

/**
 * @param {typeof VOCAB_ITEMS} items
 * @param {Record<string, { learned?: boolean, favorite?: boolean }>} marks
 */
export function mergeVocabMarks(items, marks) {
  return items.map((item) => {
    const m = marks[item.id];
    return {
      ...item,
      learned: m?.learned !== undefined ? m.learned : item.learned,
      favorite: m?.favorite !== undefined ? m.favorite : item.favorite,
    };
  });
}

function stripHtml(s) {
  return String(s || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * @param {ReturnType<typeof mergeVocabMarks>} merged
 * @param {{ jlpt?: string, tab?: string, q?: string }} filters
 */
export function filterVocabItems(merged, filters) {
  const jlpt = String(filters.jlpt || '').trim();
  const tab = String(filters.tab || 'all').trim();
  const qRaw = String(filters.q || '').trim().toLowerCase();

  return merged.filter((item) => {
    if (jlpt && item.jlpt !== jlpt) return false;
    if (tab === 'learned' && !item.learned) return false;
    if (tab === 'unlearned' && item.learned) return false;
    if (tab === 'favorite' && !item.favorite) return false;
    if (!qRaw) return true;
    const hay = [
      item.surface,
      item.reading,
      item.meaningVi,
      item.meaningJa,
      stripHtml(item.exampleJaHtml),
      item.exampleVi,
    ]
      .join(' ')
      .toLowerCase();
    return hay.includes(qRaw);
  });
}

/**
 * @param {ReturnType<typeof filterVocabItems>} items
 * @param {string} sort
 */
export function sortVocabItems(items, sort) {
  const copy = [...items];
  const key = VOCAB_SORT_IDS.includes(sort) ? sort : 'newest';
  if (key === 'oldest') {
    return copy.sort((a, b) => a.order - b.order);
  }
  if (key === 'reading') {
    return copy.sort((a, b) => a.reading.localeCompare(b.reading, 'ja'));
  }
  return copy.sort((a, b) => b.order - a.order);
}

/**
 * @param {number} pageRequested
 * @param {number} pageSize
 * @param {ReturnType<typeof mergeVocabMarks>} merged
 * @param {{ jlpt?: string, tab?: string, q?: string, sort?: string }} filters
 */
export function getVocabListPaged(pageRequested, pageSize, merged, filters) {
  const filtered = filterVocabItems(merged, filters);
  const sorted = sortVocabItems(filtered, filters.sort || 'newest');
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  let page = Number.isFinite(pageRequested) ? Math.floor(pageRequested) : 1;
  if (page < 1) page = 1;
  if (total === 0) {
    return {
      items: [],
      page: 1,
      pageSize,
      total: 0,
      totalPages: 1,
      fromIndex: 0,
      toIndex: 0,
    };
  }
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);
  const fromIndex = start + 1;
  const toIndex = Math.min(start + pageSize, total);
  return { items, page, pageSize, total, totalPages, fromIndex, toIndex };
}

/** Dùng với `setSearchParams` của react-router */
export function vocabListSearchParams({
  page = 1,
  jlpt = '',
  tab = '',
  q = '',
  sort = 'newest',
} = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  const j = String(jlpt || '').trim();
  if (j && getDistinctJlptLevels().includes(j)) params.set('jlpt', j);
  const tg = String(tab || '').trim();
  if (tg && tg !== 'all' && VOCAB_TAB_IDS.includes(tg)) params.set('tab', tg);
  const qt = String(q || '').trim();
  if (qt) params.set('q', qt);
  const st = String(sort || '').trim();
  if (st && st !== 'newest' && VOCAB_SORT_IDS.includes(st)) params.set('sort', st);
  return params;
}

/** @param {{ page?: number, jlpt?: string, tab?: string, q?: string, sort?: string }} filters */
export function vocabListHref(filters = {}) {
  const qs = vocabListSearchParams(filters).toString();
  return qs ? `/vocabulary/browse?${qs}` : '/vocabulary/browse';
}

/**
 * Xáo bản copy (Fisher–Yates)
 * @template T
 * @param {T[]} items
 */
export function shuffleVocabStudy(items) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Tạo hàng chờ ôn trong phiên học (mock — không SRS thật)
 * @param {typeof VOCAB_ITEMS} mergedItems đã merge marks nếu cần
 * @param {{ jlpt?: string, limit?: number }} opts
 */
export function buildStudyQueue(mergedItems, { jlpt = '', limit = STUDY_SESSION_SIZE } = {}) {
  const level = String(jlpt || '').trim();
  let pool = [...mergedItems];
  if (level) {
    const filtered = pool.filter((x) => x.jlpt === level);
    if (filtered.length > 0) pool = filtered;
  }
  const shuffled = shuffleVocabStudy(pool);
  const n = Math.max(1, Math.min(limit, shuffled.length));
  return shuffled.slice(0, n);
}

/**
 * Hiển thị nghĩa theo ngôn ngữ UI
 * @param {{ meaningVi: string, meaningJa: string }} item
 */
export function vocabMeaningLine(item, lang) {
  const isVi = String(lang || '').toLowerCase().startsWith('vi');
  return isVi ? item.meaningVi : item.meaningJa;
}

/** Chi tiết bổ sung theo id (nối vào VOCAB_ITEMS) — mock */
const DETAIL_EXTRA_BY_ID = {
  v1: {
    katakana: 'ジョウホウ',
    learnedAt: '2025-12-07',
    detailExampleJaHtml:
      'このアプリは<ruby>役<rt>やく</rt></ruby>に<ruby>立<rt>た</rt></ruby>つ<span class="vocab-detail-highlight">情報</span>が<ruby>多<rt>おお</rt></ruby>いです。',
    detailExampleVi: 'Ứng dụng này có nhiều thông tin hữu ích.',
    kanjiBreakdown: [
      { kanji: '情', reading: 'じょう', glossVi: 'tình, cảm xúc', glossJa: '心の状態' },
      { kanji: '報', reading: 'ほう', glossVi: 'báo, thông tin', glossJa: '知らせ' },
    ],
    synonyms: [
      { ja: 'ニュース', reading: '', glossVi: 'tin tức', glossJa: 'ニュース' },
      { ja: 'データ', reading: '', glossVi: 'dữ liệu', glossJa: 'データ' },
      { ja: '知らせ', reading: 'しらせ', glossVi: 'thông báo', glossJa: '知らせ' },
    ],
    commonPhrases: [
      {
        jaHtml: '<ruby>情報<rt>じょうほう</rt></ruby>を<ruby>集<rt>あつ</rt></ruby>める',
        glossVi: 'thu thập thông tin',
      },
      {
        jaHtml: '<ruby>情報<rt>じょうほう</rt></ruby>を<ruby>得<rt>え</rt></ruby>る',
        glossVi: 'có được / biết thông tin',
      },
    ],
    memoJa: '情報 = 情 + 報 ♡',
    memoVi: 'Nhớ: tình + báo → thông tin.',
  },
  v2: {
    katakana: 'タシカメル',
    learnedAt: '2025-11-01',
    detailExampleJaHtml:
      'よく<ruby>確<rt>たし</rt></ruby>かめてから<ruby>送<rt>おく</rt></ruby>りましょう。',
    detailExampleVi: 'Hãy kiểm tra kỹ rồi mới gửi nhé.',
    kanjiBreakdown: [{ kanji: '確', reading: 'たし・かく', glossVi: 'chắc chắn', glossJa: '確実' }],
    synonyms: [{ ja: '確認する', reading: '', glossVi: 'xác nhận', glossJa: '' }],
    commonPhrases: [],
    memoJa: '',
    memoVi: '',
  },
};

function defaultDetailExtra(item) {
  return {
    katakana: '',
    learnedAt: null,
    detailExampleJaHtml: item.exampleJaHtml,
    detailExampleVi: item.exampleVi,
    kanjiBreakdown: [],
    synonyms: [],
    commonPhrases: [],
    memoJa: '',
    memoVi: '',
  };
}

/**
 * @param {string} id
 * @param {Record<string, { learned?: boolean, favorite?: boolean }>} marks
 */
export function getVocabDetailMerged(id, marks = {}) {
  const mergedList = mergeVocabMarks(VOCAB_ITEMS, marks);
  const base = mergedList.find((x) => x.id === id);
  if (!base) return null;
  const extra = { ...defaultDetailExtra(base), ...(DETAIL_EXTRA_BY_ID[id] || {}) };
  return {
    ...base,
    katakana: extra.katakana,
    learnedAt: extra.learnedAt,
    detailExampleJaHtml: extra.detailExampleJaHtml,
    detailExampleVi: extra.detailExampleVi,
    kanjiBreakdown: extra.kanjiBreakdown,
    synonyms: extra.synonyms,
    commonPhrases: extra.commonPhrases,
    memoJa: extra.memoJa,
    memoVi: extra.memoVi,
  };
}

/** Thứ tự giống list “newest” — dùng cho prev/next */
export function getVocabOrderedIds(sort = 'newest') {
  return sortVocabItems([...VOCAB_ITEMS], sort).map((x) => x.id);
}

export function getVocabDetailNav(id, sort = 'newest') {
  const ordered = getVocabOrderedIds(sort);
  const idx = ordered.indexOf(id);
  if (idx === -1) {
    return { prevId: null, nextId: null, position: 0, total: ordered.length };
  }
  return {
    prevId: ordered[idx - 1] ?? null,
    nextId: ordered[idx + 1] ?? null,
    position: idx + 1,
    total: ordered.length,
  };
}
