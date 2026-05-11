/**
 * Bảng gojūon (hiragana / katakana) + nhãn hàng cho UI.
 * Nét viết tải động qua `kanaStrokeLoader.js` (jsDelivr): medians làm mượt Catmull→Bézier, fallback strokes.
 */

const H = (cells) => cells.map(([char, romaji]) => ({ char, romaji }));

export const HIRAGANA_ROWS = [
  { rowKey: "a", cells: H([["あ", "a"], ["い", "i"], ["う", "u"], ["え", "e"], ["お", "o"]]) },
  { rowKey: "ka", cells: H([["か", "ka"], ["き", "ki"], ["く", "ku"], ["け", "ke"], ["こ", "ko"]]) },
  { rowKey: "sa", cells: H([["さ", "sa"], ["し", "shi"], ["す", "su"], ["せ", "se"], ["そ", "so"]]) },
  { rowKey: "ta", cells: H([["た", "ta"], ["ち", "chi"], ["つ", "tsu"], ["て", "te"], ["と", "to"]]) },
  { rowKey: "na", cells: H([["な", "na"], ["に", "ni"], ["ぬ", "nu"], ["ね", "ne"], ["の", "no"]]) },
  { rowKey: "ha", cells: H([["は", "ha"], ["ひ", "hi"], ["ふ", "fu"], ["へ", "he"], ["ほ", "ho"]]) },
  { rowKey: "ma", cells: H([["ま", "ma"], ["み", "mi"], ["む", "mu"], ["め", "me"], ["も", "mo"]]) },
  {
    rowKey: "ya",
    cells: [
      { char: "や", romaji: "ya" },
      { char: null, romaji: null },
      { char: "ゆ", romaji: "yu" },
      { char: null, romaji: null },
      { char: "よ", romaji: "yo" },
    ],
  },
  { rowKey: "ra", cells: H([["ら", "ra"], ["り", "ri"], ["る", "ru"], ["れ", "re"], ["ろ", "ro"]]) },
  {
    rowKey: "wa",
    cells: [
      { char: "わ", romaji: "wa" },
      { char: null, romaji: null },
      { char: null, romaji: null },
      { char: null, romaji: null },
      { char: "を", romaji: "wo" },
    ],
  },
  { rowKey: "n", cells: [{ char: "ん", romaji: "n" }, null, null, null, null] },
];

export const KATAKANA_ROWS = [
  { rowKey: "a", cells: H([["ア", "a"], ["イ", "i"], ["ウ", "u"], ["エ", "e"], ["オ", "o"]]) },
  { rowKey: "ka", cells: H([["カ", "ka"], ["キ", "ki"], ["ク", "ku"], ["ケ", "ke"], ["コ", "ko"]]) },
  { rowKey: "sa", cells: H([["サ", "sa"], ["シ", "shi"], ["ス", "su"], ["セ", "se"], ["ソ", "so"]]) },
  { rowKey: "ta", cells: H([["タ", "ta"], ["チ", "chi"], ["ツ", "tsu"], ["テ", "te"], ["ト", "to"]]) },
  { rowKey: "na", cells: H([["ナ", "na"], ["ニ", "ni"], ["ヌ", "nu"], ["ネ", "ne"], ["ノ", "no"]]) },
  { rowKey: "ha", cells: H([["ハ", "ha"], ["ヒ", "hi"], ["フ", "fu"], ["ヘ", "he"], ["ホ", "ho"]]) },
  { rowKey: "ma", cells: H([["マ", "ma"], ["ミ", "mi"], ["ム", "mu"], ["メ", "me"], ["モ", "mo"]]) },
  {
    rowKey: "ya",
    cells: [
      { char: "ヤ", romaji: "ya" },
      { char: null, romaji: null },
      { char: "ユ", romaji: "yu" },
      { char: null, romaji: null },
      { char: "ヨ", romaji: "yo" },
    ],
  },
  { rowKey: "ra", cells: H([["ラ", "ra"], ["リ", "ri"], ["ル", "ru"], ["レ", "re"], ["ロ", "ro"]]) },
  {
    rowKey: "wa",
    cells: [
      { char: "ワ", romaji: "wa" },
      { char: null, romaji: null },
      { char: null, romaji: null },
      { char: null, romaji: null },
      { char: "ヲ", romaji: "wo" },
    ],
  },
  { rowKey: "n", cells: [{ char: "ン", romaji: "n" }, null, null, null, null] },
];

/** Gợi ý ghi nhớ (tùy chọn). Không có → dùng chuỗi i18n mặc định. */
export const KANA_MNEMONICS = {
  あ: {
    vi: "Chữ あ trông như miệng há to khi phát âm “a”.",
    ja: "「あ」は口を大きく開けて「あ」と言う形に見えるよ。",
  },
  い: {
    vi: "Hai nét đứng như hai người đứng cạnh nhau — “i” như “team”.",
    ja: "縦線が二つ並んでいるね。",
  },
  う: {
    vi: "Nét cong mềm như sóng — âm “u” tròn.",
    ja: "なめらかな曲線が特徴。",
  },
};

export const KATA_MNEMONICS = {
  ア: {
    vi: "Katakana ア giống chữ A viết hoa nhưng không có thanh ngang giữa.",
    ja: "大文字の「A」に少し似ているね。",
  },
  イ: {
    vi: "イ như chữ “i” in nghiêng hai nét.",
    ja: "「イ」は棒が二つで「い」と対応。",
  },
};

export function getMnemonic(char, lang) {
  const pack = { ...KANA_MNEMONICS, ...KATA_MNEMONICS }[char];
  if (!pack) return null;
  return lang === "ja" ? pack.ja : pack.vi;
}

export function flattenGojuon(rows) {
  const out = [];
  for (const row of rows) {
    for (const cell of row.cells) {
      if (cell && cell.char) out.push(cell);
    }
  }
  return out;
}

export const HIRAGANA_FLAT = flattenGojuon(HIRAGANA_ROWS);
export const KATAKANA_FLAT = flattenGojuon(KATAKANA_ROWS);

/**
 * 拗音: chữ cái + ゃ / ゅ / ょ (hiragana).
 * Mỗi hàng: `lead` = phụ âm gốc, 3 ô kya kyu kyo (romaji Hepburn quen dùng).
 */
export const HIRAGANA_YOON_ROWS = [
  { rowKey: "ki_y", lead: "き", cells: H([["きゃ", "kya"], ["きゅ", "kyu"], ["きょ", "kyo"]]) },
  { rowKey: "shi_y", lead: "し", cells: H([["しゃ", "sha"], ["しゅ", "shu"], ["しょ", "sho"]]) },
  { rowKey: "chi_y", lead: "ち", cells: H([["ちゃ", "cha"], ["ちゅ", "chu"], ["ちょ", "cho"]]) },
  { rowKey: "ni_y", lead: "に", cells: H([["にゃ", "nya"], ["にゅ", "nyu"], ["にょ", "nyo"]]) },
  { rowKey: "hi_y", lead: "ひ", cells: H([["ひゃ", "hya"], ["ひゅ", "hyu"], ["ひょ", "hyo"]]) },
  { rowKey: "mi_y", lead: "み", cells: H([["みゃ", "mya"], ["みゅ", "myu"], ["みょ", "myo"]]) },
  { rowKey: "ri_y", lead: "り", cells: H([["りゃ", "rya"], ["りゅ", "ryu"], ["りょ", "ryo"]]) },
  { rowKey: "gi_y", lead: "ぎ", cells: H([["ぎゃ", "gya"], ["ぎゅ", "gyu"], ["ぎょ", "gyo"]]) },
  { rowKey: "ji_y", lead: "じ", cells: H([["じゃ", "ja"], ["じゅ", "ju"], ["じょ", "jo"]]) },
  { rowKey: "bi_y", lead: "び", cells: H([["びゃ", "bya"], ["びゅ", "byu"], ["びょ", "byo"]]) },
  { rowKey: "pi_y", lead: "ぴ", cells: H([["ぴゃ", "pya"], ["ぴゅ", "pyu"], ["ぴょ", "pyo"]]) },
];

export const KATAKANA_YOON_ROWS = [
  { rowKey: "ki_y", lead: "キ", cells: H([["キャ", "kya"], ["キュ", "kyu"], ["キョ", "kyo"]]) },
  { rowKey: "shi_y", lead: "シ", cells: H([["シャ", "sha"], ["シュ", "shu"], ["ショ", "sho"]]) },
  { rowKey: "chi_y", lead: "チ", cells: H([["チャ", "cha"], ["チュ", "chu"], ["チョ", "cho"]]) },
  { rowKey: "ni_y", lead: "ニ", cells: H([["ニャ", "nya"], ["ニュ", "nyu"], ["ニョ", "nyo"]]) },
  { rowKey: "hi_y", lead: "ヒ", cells: H([["ヒャ", "hya"], ["ヒュ", "hyu"], ["ヒョ", "hyo"]]) },
  { rowKey: "mi_y", lead: "ミ", cells: H([["ミャ", "mya"], ["ミュ", "myu"], ["ミョ", "myo"]]) },
  { rowKey: "ri_y", lead: "リ", cells: H([["リャ", "rya"], ["リュ", "ryu"], ["リョ", "ryo"]]) },
  { rowKey: "gi_y", lead: "ギ", cells: H([["ギャ", "gya"], ["ギュ", "gyu"], ["ギョ", "gyo"]]) },
  { rowKey: "ji_y", lead: "ジ", cells: H([["ジャ", "ja"], ["ジュ", "ju"], ["ジョ", "jo"]]) },
  { rowKey: "bi_y", lead: "ビ", cells: H([["ビャ", "bya"], ["ビュ", "byu"], ["ビョ", "byo"]]) },
  { rowKey: "pi_y", lead: "ピ", cells: H([["ピャ", "pya"], ["ピュ", "pyu"], ["ピョ", "pyo"]]) },
];

export const HIRAGANA_YOON_FLAT = flattenGojuon(HIRAGANA_YOON_ROWS);
export const KATAKANA_YOON_FLAT = flattenGojuon(KATAKANA_YOON_ROWS);
