/**
 * Kanji demo — học theo bài (chunk), tiến cây quiz lưu localStorage tách biệt từ vựng.
 */

export const KANJI_LESSON_SIZE = 4;

export const KANJI_QUIZ_PER_STAGE = 12;

/** Giai đoạn cây giống từ vựng: 0…3 */
export const KANJI_LESSON_GROWTH_MAX = 3;

const JLPT_ORDER = ["N5", "N4", "N3", "N2", "N1"];

/**
 * @typedef {{
 *   id: string,
 *   order: number,
 *   jlpt: string,
 *   char: string,
 *   onYomi: string,
 *   kunYomi: string,
 *   hanViet: string,
 *   meaningVi: string,
 *   vocabJa: string,
 *   exampleJa: string,
 *   exampleVi: string,
 *   learned: boolean
 * }} KanjiItem
 */

/** @type {ReadonlyArray<KanjiItem>} */
export const KANJI_ITEMS = [
  {
    id: "k1",
    order: 12,
    jlpt: "N3",
    char: "漢",
    onYomi: "カン",
    kunYomi: "—",
    hanViet: "Hán",
    meaningVi: "chữ Hán",
    vocabJa: "漢字（かんじ）",
    exampleJa: "毎日、漢字を五つ覚えています。",
    exampleVi: "Mỗi ngày tôi học thuộc năm chữ Kanji.",
    learned: true,
  },
  {
    id: "k2",
    order: 11,
    jlpt: "N3",
    char: "字",
    onYomi: "ジ",
    kunYomi: "あざ",
    hanViet: "Tự",
    meaningVi: "chữ, tự",
    vocabJa: "文字（もじ）",
    exampleJa: "この字の読み方を教えてください。",
    exampleVi: "Làm ơn chỉ cho tôi cách đọc chữ này.",
    learned: true,
  },
  {
    id: "k3",
    order: 10,
    jlpt: "N3",
    char: "勉",
    onYomi: "ベン",
    kunYomi: "つと(む)",
    hanViet: "Miễn",
    meaningVi: "chăm, cố gắng",
    vocabJa: "勉強（べんきょう）",
    exampleJa: "試験のために毎晩勉強しています。",
    exampleVi: "Tôi học mỗi tối để chuẩn bị cho kỳ thi.",
    learned: false,
  },
  {
    id: "k4",
    order: 9,
    jlpt: "N3",
    char: "強",
    onYomi: "キョウ・ゴウ",
    kunYomi: "つよ(い)",
    hanViet: "Cường",
    meaningVi: "mạnh, ép buộc",
    vocabJa: "強い（つよい）",
    exampleJa: "彼は意志が強いです。",
    exampleVi: "Anh ấy có ý chí rất mạnh.",
    learned: false,
  },
  {
    id: "k5",
    order: 8,
    jlpt: "N3",
    char: "習",
    onYomi: "シュウ",
    kunYomi: "なら(う)",
    hanViet: "Tập",
    meaningVi: "luyện tập, học",
    vocabJa: "習う（ならう）",
    exampleJa: "先生に日本語の作文を習いました。",
    exampleVi: "Tôi đã học viết luận tiếng Nhật với giáo viên.",
    learned: true,
  },
  {
    id: "k6",
    order: 7,
    jlpt: "N3",
    char: "慣",
    onYomi: "カン",
    kunYomi: "な(れる)",
    hanViet: "Quán",
    meaningVi: "quen",
    vocabJa: "慣れる（なれる）",
    exampleJa: "新しい環境に少しずつ慣れてきました。",
    exampleVi: "Tôi dần quen với môi trường mới.",
    learned: false,
  },
  {
    id: "k7",
    order: 6,
    jlpt: "N3",
    char: "練",
    onYomi: "レン",
    kunYomi: "ね(る)",
    hanViet: "Luyện",
    meaningVi: "luyện (tập)",
    vocabJa: "練習（れんしゅう）",
    exampleJa: "発音を練習してから録音しました。",
    exampleVi: "Sau khi luyện phát âm tôi đã ghi âm.",
    learned: false,
  },
  {
    id: "k8",
    order: 5,
    jlpt: "N3",
    char: "復",
    onYomi: "フク",
    kunYomi: "ま(た)",
    hanViet: "Phục",
    meaningVi: "ôn lại, phục",
    vocabJa: "復習（ふくしゅう）",
    exampleJa: "週末に今週の単語を復習します。",
    exampleVi: "Cuối tuần tôi ôn lại từ vựng của tuần này.",
    learned: false,
  },
  {
    id: "k9",
    order: 4,
    jlpt: "N3",
    char: "読",
    onYomi: "ドク・トク",
    kunYomi: "よ(む)",
    hanViet: "Độc",
    meaningVi: "đọc",
    vocabJa: "読む（よむ）",
    exampleJa: "図書館で雑誌を読みました。",
    exampleVi: "Tôi đã đọc tạp chí ở thư viện.",
    learned: true,
  },
  {
    id: "k10",
    order: 3,
    jlpt: "N3",
    char: "書",
    onYomi: "ショ",
    kunYomi: "か(く)",
    hanViet: "Thư",
    meaningVi: "viết",
    vocabJa: "書く（かく）",
    exampleJa: "手紙に住所を書き忘れないでください。",
    exampleVi: "Đừng quên viết địa chỉ vào thư nhé.",
    learned: true,
  },
  {
    id: "k11",
    order: 2,
    jlpt: "N3",
    char: "聞",
    onYomi: "ブン・モン",
    kunYomi: "き(く)",
    hanViet: "Văn / Vấn",
    meaningVi: "nghe; hỏi",
    vocabJa: "聞く（きく）",
    exampleJa: "ニュースを聞きながら朝ごはんを食べます。",
    exampleVi: "Tôi ăn sáng vừa nghe tin tức.",
    learned: false,
  },
  {
    id: "k12",
    order: 1,
    jlpt: "N3",
    char: "話",
    onYomi: "ワ",
    kunYomi: "はな(す)・はなし",
    hanViet: "Thoại",
    meaningVi: "nói chuyện; chuyện",
    vocabJa: "話す（はなす）",
    exampleJa: "友だちと電話で長い話をしました。",
    exampleVi: "Tôi đã nói chuyện điện thoại rất lâu với bạn.",
    learned: false,
  },
];

export function getDistinctKanjiJlptLevels() {
  const seen = new Set(KANJI_ITEMS.map((i) => i.jlpt));
  return JLPT_ORDER.filter((lv) => seen.has(lv));
}

/**
 * @param {typeof KANJI_ITEMS} items
 * @param {Record<string, { learned?: boolean }>} marks
 */
export function mergeKanjiMarks(items, marks) {
  return items.map((item) => {
    const m = marks[item.id];
    return {
      ...item,
      learned: m?.learned !== undefined ? m.learned : item.learned,
    };
  });
}

function shuffleKanji(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Nghĩa hiển thị / quiz (tiếng Việt).
 * @param {{ meaningVi: string }} item
 */
export function kanjiMeaningLine(item, lang) {
  void lang;
  return item.meaningVi ?? "";
}

/**
 * Chuỗi đọc dùng trong quiz (phân biệt âm On / Kun).
 * @param {KanjiItem | Record<string, unknown>} item
 */
export function kanjiReadingsDisplay(item) {
  const on = String(item.onYomi ?? "—").trim() || "—";
  const kun = String(item.kunYomi ?? "—").trim() || "—";
  return `音: ${on} / 訓: ${kun}`;
}

/**
 * @param {ReturnType<typeof mergeKanjiMarks>} mergedItems
 * @param {{ jlpt: string, lessonNo: number }} opts
 */
export function getKanjiLessonItems(mergedItems, { jlpt, lessonNo }) {
  const j = String(jlpt || "").trim();
  const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
  const pool = j ? mergedItems.filter((x) => x.jlpt === j) : [...mergedItems];
  const start = (n - 1) * KANJI_LESSON_SIZE;
  return pool.slice(start, start + KANJI_LESSON_SIZE);
}

/**
 * Bài `lessonNo` mở khi bài trước (cùng JLPT) đã thuộc hết (mọi chữ learned).
 */
export function isKanjiLessonUnlocked(mergedItems, jlpt, lessonNo) {
  const n = Math.max(1, Math.floor(Number(lessonNo) || 1));
  if (n <= 1) return true;
  const j = String(jlpt || "").trim();
  const pool = mergedItems.filter((x) => x.jlpt === j);
  const prevStart = (n - 2) * KANJI_LESSON_SIZE;
  const prevSlice = pool.slice(prevStart, prevStart + KANJI_LESSON_SIZE);
  if (prevSlice.length === 0) return true;
  return prevSlice.length > 0 && prevSlice.every((x) => x.learned);
}

/** @deprecated Tiến độ lưu API — key localStorage cũ */
const KANJI_GROWTH_LS = "sketchpad_kanji_lesson_growth";

function kanjiGrowthKey(jlpt, lessonNo) {
  return `${String(jlpt || "").trim()}:${Math.max(1, Math.floor(Number(lessonNo) || 1))}`;
}

/** @deprecated Dùng kanjiProgressService + deckId */
export function getKanjiLessonGrowthStage(jlpt, lessonNo) {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(KANJI_GROWTH_LS);
    const o = raw ? JSON.parse(raw) : {};
    const n = Number(o[kanjiGrowthKey(jlpt, lessonNo)]);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(KANJI_LESSON_GROWTH_MAX, Math.floor(n)));
  } catch {
    return 0;
  }
}

/** @deprecated Dùng advanceKanjiDeckProgress(deckId) */
export function advanceKanjiLessonGrowthStage(jlpt, lessonNo) {
  const cur = getKanjiLessonGrowthStage(jlpt, lessonNo);
  if (cur >= KANJI_LESSON_GROWTH_MAX) return KANJI_LESSON_GROWTH_MAX;
  const next = cur + 1;
  if (typeof window === "undefined") return next;
  try {
    const raw = window.localStorage.getItem(KANJI_GROWTH_LS);
    const o = raw ? JSON.parse(raw) : {};
    o[kanjiGrowthKey(jlpt, lessonNo)] = next;
    window.localStorage.setItem(KANJI_GROWTH_LS, JSON.stringify(o));
  } catch {
    /* ignore */
  }
  return next;
}

/** % bài đã “hoa” trong gói JLPT */
export function getKanjiPackCompletionPercent(mergedItems, jlpt, lessonCount) {
  const j = String(jlpt || "").trim();
  const nLessons = Math.max(0, Math.floor(Number(lessonCount) || 0));
  if (!j || nLessons <= 0) return 0;
  let flower = 0;
  for (let n = 1; n <= nLessons; n++) {
    if (getKanjiLessonGrowthStage(j, n) >= KANJI_LESSON_GROWTH_MAX) flower += 1;
  }
  return Math.round((flower / nLessons) * 100);
}

/**
 * @param {ReturnType<typeof mergeKanjiMarks>} mergedItems
 * @param {ReturnType<typeof getKanjiLessonItems>} lessonItems
 * @param {{ lang?: string, count?: number }} opts
 */
export function buildKanjiLessonQuizQuestions(
  mergedItems,
  lessonItems,
  { lang, count = KANJI_QUIZ_PER_STAGE } = {},
) {
  const pool = lessonItems.filter(Boolean);
  if (pool.length === 0) return [];

  const jlpt = String(pool[0].jlpt || "");
  const distractorBank = mergedItems.filter(
    (x) => x.jlpt === jlpt && !pool.some((p) => p.id === x.id),
  );

  const pickUnique = (arr, need, exclude) => {
    const out = [];
    const seen = new Set();
    for (const x of shuffleKanji([...arr])) {
      if (exclude != null && exclude !== "" && x === exclude) continue;
      if (seen.has(x)) continue;
      seen.add(x);
      out.push(x);
      if (out.length >= need) break;
    }
    return out;
  };

  const padWrong = (firstWrong, correct, fallbacks) => {
    const out = [...firstWrong];
    for (const x of shuffleKanji([...fallbacks])) {
      if (out.length >= 3) break;
      if (x === correct) continue;
      if (out.includes(x)) continue;
      out.push(x);
    }
    return out.slice(0, 3);
  };

  const questions = [];
  const modes = ["char_from_meaning", "reading_from_char", "meaning_from_char"];

  for (let i = 0; i < count; i++) {
    const item = pool[Math.floor(Math.random() * pool.length)];
    const mode = modes[Math.floor(Math.random() * modes.length)];
    const readLine = kanjiReadingsDisplay(item);

    if (mode === "char_from_meaning") {
      const meaning = kanjiMeaningLine(item, lang);
      const wrongChars = padWrong(
        pickUnique(
          distractorBank.map((x) => x.char),
          3,
          item.char,
        ),
        item.char,
        [
          ...pool.filter((p) => p.id !== item.id).map((p) => p.char),
          ...distractorBank.map((x) => x.char),
        ],
      );
      const options = shuffleKanji([item.char, ...wrongChars]).slice(0, 4);
      const answerIndex = options.indexOf(item.char);
      questions.push({
        key: `k-${i}-${item.id}-c`,
        wordId: item.id,
        mode,
        prompt: meaning,
        promptLang: "vi",
        options,
        answerIndex,
      });
    } else if (mode === "reading_from_char") {
      const wrongRead = padWrong(
        pickUnique(
          distractorBank.map((x) => kanjiReadingsDisplay(x)),
          3,
          readLine,
        ),
        readLine,
        [
          ...pool.filter((p) => p.id !== item.id).map((p) => kanjiReadingsDisplay(p)),
          ...distractorBank.map((x) => kanjiReadingsDisplay(x)),
        ],
      );
      const options = shuffleKanji([readLine, ...wrongRead]).slice(0, 4);
      const answerIndex = options.indexOf(readLine);
      questions.push({
        key: `k-${i}-${item.id}-r`,
        wordId: item.id,
        mode,
        prompt: item.char,
        promptLang: "ja",
        options,
        answerIndex,
      });
    } else {
      const correctMean = kanjiMeaningLine(item, lang);
      const wrongMean = padWrong(
        pickUnique(
          distractorBank.map((x) => kanjiMeaningLine(x, lang)),
          3,
          correctMean,
        ),
        correctMean,
        [
          ...pool
            .filter((p) => p.id !== item.id)
            .map((p) => kanjiMeaningLine(p, lang)),
          ...distractorBank.map((x) => kanjiMeaningLine(x, lang)),
        ],
      );
      const options = shuffleKanji([correctMean, ...wrongMean]).slice(0, 4);
      const answerIndex = options.indexOf(correctMean);
      questions.push({
        key: `k-${i}-${item.id}-m`,
        wordId: item.id,
        mode,
        prompt: item.char,
        promptLang: "ja",
        options,
        answerIndex,
      });
    }
  }

  return questions;
}
