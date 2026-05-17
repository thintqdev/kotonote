/**
 * Nội dung demo ngữ pháp — theo locale UI:
 * - Tiếng Nhật (ja): chỉ hiện tiếng Nhật.
 * - Tiếng Việt (vi): tiếng Nhật làm khối chính + tiếng Việt chỉ khi có trường `vi` (chú thích, không lặp mọi đoạn).
 * @typedef {{ ja: string, vi?: string }} GrammarLoc
 */

export {
	GRAMMAR_TAG_IDS,
	GRAMMAR_PAGE_SIZE,
} from '../constants/grammarFieldMeta.js';

const isViUILang = (lang) => String(lang || '').toLowerCase().startsWith('vi');

/** UI Việt (chỉ dùng khi muốn tách nhánh trong component). */
export function grammarIsViUI(lang) {
  return isViUILang(lang);
}

/**
 * Một khối nội dung: luôn có tiếng Nhật; tiếng Việt chỉ phụ (`secondary`) khi UI là VI và có `vi`.
 * @returns {{ primary: string, secondary: string | null }}
 */
export function grammarLine(loc, lang) {
  if (!loc) return { primary: '', secondary: null };
  if (typeof loc === 'string') return { primary: loc, secondary: null };
  const primary = loc.ja != null ? String(loc.ja) : '';
  const viTrim = loc.vi != null && String(loc.vi).trim() ? String(loc.vi).trim() : null;
  if (!isViUILang(lang)) return { primary, secondary: null };
  return { primary, secondary: viTrim };
}

/** Giữ tương thích: chỉ trả về phần chính (dùng khi chỉ cần một chuỗi, vd. ô tìm kiếm). */
export function grammarPick(loc, lang) {
  return grammarLine(loc, lang).primary;
}

/** Danh sách slug (thứ tự hiển thị list) */
export const GRAMMAR_SLUG_ORDER = [
  'ni-yoru-to',
  'rashii',
  'wake-dewa-nai',
  'tame-ni',
  'you-ni',
  'koto-ni-naru',
  'hazu-da',
  'mono-da',
];

const LIST_META = {
  'ni-yoru-to': {
    jlpt: 'N3',
    pattern: '～によると',
    tagIds: ['hearsay', 'formal'],
    teaser: {
      ja: 'ニュースや本など、客観的な情報の出所に使う伝聞表現。',
      vi: 'Nguồn khách quan (tin, sách…) — không phải điều mình chứng kiến trực tiếp.',
    },
    topicRibbon: { ja: '(情報の伝達・伝聞)', vi: '' },
  },
  rashii: {
    jlpt: 'N4',
    pattern: '～らしい',
    tagIds: ['conjecture'],
    teaser: {
      ja: '推測・伝聞・属性の伝え方に使う文末の「らしい」。',
      vi: '',
    },
    topicRibbon: { ja: '(推測・伝聞・典型)', vi: '' },
  },
  'wake-dewa-nai': {
    jlpt: 'N3',
    pattern: '～わけではない',
    tagIds: ['formal'],
    teaser: {
      ja: '部分否定。「必ずそうとは限らない」と言いたいとき。',
      vi: 'Nới nhẹ hoặc sửa hiểu lầm: “không hẳn lúc nào cũng…”',
    },
    topicRibbon: { ja: '(部分否定)', vi: '' },
  },
  'tame-ni': {
    jlpt: 'N4',
    pattern: '～ために',
    tagIds: ['purpose', 'formal'],
    teaser: {
      ja: '目的・理由をはっきり示す。名詞修飾「〜するための」も頻出。',
      vi: '',
    },
    topicRibbon: { ja: '(目的・理由)', vi: '' },
  },
  'you-ni': {
    jlpt: 'N4',
    pattern: '～ように',
    tagIds: ['goal', 'formal'],
    teaser: {
      ja: '目標・変化の様子・比喩など幅広い。無意志動詞には「ように」が入りやすい。',
      vi: 'Mục tiêu · cách thức · so sánh; dễ lẫn với 「ために」 khi chủ đích.',
    },
    topicRibbon: { ja: '(目標・様態・比喩)', vi: '' },
  },
  'koto-ni-naru': {
    jlpt: 'N3',
    pattern: '～ことになる',
    tagIds: ['change', 'formal'],
    teaser: {
      ja: '決定・結果・習わしを客観的に述べる。敬語ニュアンスにもつながる。',
      vi: '',
    },
    topicRibbon: { ja: '(決定・帰結・しきたり)', vi: '' },
  },
  'hazu-da': {
    jlpt: 'N3',
    pattern: '～はずだ',
    tagIds: ['conjecture', 'formal'],
    teaser: {
      ja: '論理・過去の常識からの「そうなるはず」の推量。',
      vi: '',
    },
    topicRibbon: { ja: '(推量)', vi: '' },
  },
  'mono-da': {
    jlpt: 'N3',
    pattern: '～ものだ',
    tagIds: ['formal'],
    teaser: {
      ja: '感嘆・一般論・昔の習慣。「ものではない」「ものか」など関連形も。',
      vi: '',
    },
    topicRibbon: { ja: '(感嘆・一般・習い)', vi: '' },
  },
};

/** @type {Record<string, object>} */
const DETAILS = {
  'ni-yoru-to': {
    jlpt: 'N3',
    pattern: '～によると',
    meta: LIST_META['ni-yoru-to'],
    connection: {
      ja: '普通形 ＋ によると／名詞 ＋ によると',
      vi: '',
    },
    meaning: {
      ja: '「〜という情報によると」を短く伝える言い方。ニュースや調査など、公的・客観的な出所につながりやすい。',
      vi: 'Nói gọn là “theo [nguồn thông tin]…”. Thường gắn với báo đài, báo cáo, nguồn khách quan.',
    },
    usage: {
      ja:
        '天気予報や統計、新聞の見出しのように、「話し手が直接見聞きした」のではなく、ある情報経路から得た内容を述べるときに使う。',
      vi:
        'Dùng khi truyền đạt nội dung lấy từ một kênh thông tin (dự báo thời tiết, thống kê, báo…) — không phải điều người nói chứng kiến trực tiếp.',
    },
    usageNote: {
      ja:
        '※ 自分が直接見た・聞いた体験をそのまま「〜によると」で説明すると不自然になりやすい。',
      vi:
        '※ Ít phù hợp để bọc trực tiếp trải nghiệm của bản thân (“tôi thấy/nghe…” rồi thêm 「によると」).',
    },
    pointBubble: {
      ja:
        '本文・フォーマルな説明では「〜そうです」より情報の出自が明快。「天気予報によると」のようにセットで覚えると強い。',
      vi:
        'Trong văn viết/ trang trọng, nguồn tin rõ hơn so với 「〜そうです」 một mình. Hay học các cố định kiểu “theo dự báo thời tiết…”.',
    },
    examples: [
      {
        ja: '① テレビのニュース<ruby>による<rt>よる</rt></ruby>と、明日は雪だそうです。',
        vi: '① Theo tin trên TV, ngày mai có vẻ sẽ tuyết.',
      },
      {
        ja: '② 調査によると、この地域の通勤時間は五年前よりも五分長くなっているそうです。',
        vi: '② Theo khảo sát, thời gian đi làm ở vùng này đã dài thêm khoảng 5 phút so với 5 năm trước.',
      },
      {
        ja: '③ 「先生の説明によると、来週のテストは範囲が広いとのことだった。」',
        vi: '③ “Thầy giải thích là kiểm tra tuần tới phạm vi sẽ rộng.”',
      },
    ],
    ng: {
      ja: [
        '私は昨日、駅で友だちが駅員に怒られているところを見た。→ × 駅員によると、彼は規則を破ったとのことだった。',
      ],
      vi: [
        'Tôi thấy tận mắt bạn đang bị nhân viên ga mắng → không nối cứng thành “theo nhân viên ga…” như kiểu trích báo được.',
      ],
    },
    ngNote: {
      ja: '自分の体感を「情報経路」のフレームに無理やり載せない。',
      vi: 'Không bọc kinh nghiệm trực tiếp vào khung “theo một nguồn báo được”.',
    },
    compare: {
      caption: {
        ja: '「によると」と「〜そうです」',
        vi: '',
      },
      colLabels: [
        { ja: 'によると', vi: '' },
        { ja: '〜そうです（伝聞）', vi: '' },
      ],
      rows: [
        {
          label: { ja: '出典の明示', vi: '' },
          cells: [
            { ja: '出しやすい（例：ニュースによると〜）', vi: '' },
            { ja: '前後で伝聞と分かれば短くしてもOK', vi: '' },
          ],
        },
        {
          label: { ja: '文体・トーン', vi: '' },
          cells: [
            { ja: '報道・説明文に近い', vi: '' },
            { ja: '会話でそのまま使いやすい', vi: '' },
          ],
        },
      ],
    },
    memo: {
      ja: '天気・アンケート・公式発表など「出所が言える情報」とセットで暗記リスト化する。',
      vi: 'Ghép vào chủ đề: thời tiết / khảo sát / thông báo chính thức — nơi nói rõ nguồn.',
    },
    practice: {
      items: [
        {
          ja: '「新聞に書いてあった」→ 「新聞＿＿＿＿＿、物価は上昇しているとのことだった。」を完成させる。',
          vi: '',
        },
        {
          ja: '天気予報・アプリ・先生の伝言などで「伝聞フレーズ」を一文つくろう。',
          vi: '',
        },
      ],
    },
  },

  rashii: {
    jlpt: 'N4',
    pattern: '～らしい',
    meta: LIST_META.rashii,
    connection: {
      ja: '普通形・イ形容词・ナ形容词語幹・名詞 ＋ らしい（典型は文末）',
      vi: '',
    },
    meaning: {
      ja: '(1)聞いた話、(2)推測、(3)〜らしい（典型）。同じ語形でも状況で読む。',
      vi: '(1) Nghe kể (2) Suy đoán (3) Đặc trưng “đúng chất〜” — đọc theo ngữ cảnh.',
    },
    usage: {
      ja: '(1)(2)(3)を区別するときは、根拠（誰から聞いたか／目に見える手がかり／共通イメージ）を意識する。',
      vi: 'Phân biệt bằng căn cứ: ai nói / dấu hiệu nhìn thấy / hình mẫu chung của thứ đó.',
    },
    usageNote: {
      ja: '※「らしい」を重ね過ぎるとたらい回しに聞こえるので文脈での一度だけが基本。',
      vi: '※ Không lạm dụng “nghe đồn là… nghe nó…” — thường một lần là đủ rõ.',
    },
    pointBubble: {
      ja: '伝聞「〜らしい」は直接の引用ではないので、ソースが重要なら「〜だそうだ」と言い分ける。',
      vi: '「らしい」 nghe kể không phải trích dẫn trực tiếp; nếu cần nguồn rõ hơn dùng 「〜だそうだ」.',
    },
    examples: [
      { ja: '① 田中さん、今日は休むらしい。（伝聞）', vi: '① Nghe nói hôm nay chị Tanaka nghỉ.' },
      { ja: '② 空が暗い。今夜は雨になるらしい。（推測）', vi: '② Trời tối — có vẻ tối sẽ mưa.' },
      { ja: '③ これは北海道らしいケーキですね。（典型）', vi: '③ Bánh “đúng kiểu Hokkaidō”.' },
    ],
    ng: {
      ja: ['断定して知っている事実に「らしい」→ × 彼は学生らしい（本人が名刺を出して紹介した直後）。'],
      vi: ['Với sự thật đã chắc chắn (vừa tự giới thiệu) mà thêm “nghe nói” → không hợp lý.'],
    },
    ngNote: { ja: '確定情報に不要な推量マーカーを付けない。', vi: 'Không gắn marker suy đoán vào thông tin đã chắc chắn.' },
    compare: {
      caption: { ja: '「らしい」と「そうだ（様態）」', vi: '' },
      colLabels: [{ ja: 'らしい', vi: '' }, { ja: 'そうだ（様態）', vi: '' }],
      rows: [
        {
          label: { ja: '根拠', vi: '' },
          cells: [
            { ja: '間接・属性イメージが強い', vi: '' },
            { ja: '五感・直近の印象', vi: '' },
          ],
        },
        {
          label: { ja: 'よくある誤り', vi: '' },
          cells: [
            { ja: '確定情報に付け過ぎ', vi: '' },
            { ja: '*そうじゃない ではなくない形に注意（授業参照）', vi: '' },
          ],
        },
      ],
    },
    memo: {
      ja: 'ノートには「伝聞・推測・典型」を三列で短文例を並べると復習が楽。',
      vi: 'Ghi sổ 3 cột: nghe kể | suy đoán | đặc trưng — mỗi cột một câu ngắn.',
    },
    practice: {
      items: [
        { ja: '(伝聞) 会議が延びた＿＿＿＿＿。', vi: '' },
        { ja: '(推測) 調子が悪そうだ。休んだほうがいい＿＿＿＿＿？', vi: '' },
      ],
    },
  },

  'wake-dewa-nai': {
    jlpt: 'N3',
    pattern: '～わけではない',
    meta: LIST_META['wake-dewa-nai'],
    connection: {
      ja: 'ナ形容詞語幹＋／名詞 の否定＋ （普通形など）わけではない',
      vi: '',
    },
    meaning: {
      ja: '全面否定ではなくニュアンスを弱める／誤解を防ぐ。',
      vi: 'Không phủ nhận toàn bộ, làm êm nhẹ hoặc tránh hiểu nhầm “hoàn toàn vậy”.',
    },
    usage: {
      ja: '相手が「すべてそう」と取り過ぎるのをほどくときに強い。',
      vi: 'Hay dùng khi đối phương hiểu quá tuyệt đối — mình cần nới lại.',
    },
    pointBubble: {
      ja: '「嫌いなわけではない」は“好き”を言っていない。返答の空気を読む。',
      vi: '「Ghét thì không」 ≠ “thích”. Cần đọc không khí câu trả lời.',
    },
    examples: [
      {
        ja: '① 日本語ができるわけではないが、日常的な会話には困らない。',
        vi: '① Không phải giỏi tiếng Nhật, nhưng hội thoại hàng ngày ổn.',
      },
      {
        ja: '② 嫌いなわけじゃなくて、その日は用事があっただけだよ。',
        vi: '② Không phải ghét — hôm đó chỉ bận thôi.',
      },
      {
        ja: '③ 簡単なわけではないが、チャレンジする価値はある。',
        vi: '③ Không hề dễ, nhưng vẫn đáng thử.',
      },
    ],
    ng: {
      ja: ['「わけではない」のあと続く肯定が論理的に繋がらない段落 → 一文で論点を揃える。'],
      vi: ['Phần khẳng định sau không khớp lập luận — nên giữ một mạch chủ đề trong cùng nhịp.' ],
    },
    ngNote: { ja: '前後で肯定・否定が矛盾しないように。', vi: 'Tránh mâu thuẫn giữa vế khẳng định / phủ định.' },
    compare: {
      caption: { ja: '「わけではない」と「〜とは限らない」', vi: '' },
      colLabels: [
        { ja: '〜わけではない', vi: '' },
        { ja: '〜とは限らない', vi: '' },
      ],
      rows: [
        {
          label: { ja: 'ニュアンス', vi: '' },
          cells: [
            { ja: '部分否定／誤解の修正', vi: '' },
            { ja: '一般化に対して「例外あり」', vi: '' },
          ],
        },
      ],
    },
    memo: {
      ja: '口語では「〜わけじゃない」をリズム調整によく挟む。',
      vi: 'Khẩu ngữ 「わけじゃない」 giúp câu tự nhiên hơn.',
    },
    practice: {
      items: [
        { ja: '「すべてが無理とは言わないが、準備不足なわけでもない。」→自分の一文に書き換えろ。', vi: '' },
        { ja: '友だちとの約束キャンセル —「嫌いだからではない」を丁寧形で。', vi: '' },
      ],
    },
  },

  'tame-ni': {
    jlpt: 'N4',
    pattern: '～ために',
    meta: LIST_META['tame-ni'],
    connection: {
      ja: '動詞意向形／动词ない形＋ ために（目的／理由） 名詞＋ の＋ために',
      vi: '',
    },
    meaning: {
      ja: '（目的）〜しようという目的 （理由）〜が原因。',
      vi: '(Mục đích) để… (Lý do) vì / do…',
    },
    usage: {
      ja: '目的の「ために」の主語は実行する側と目標が揃っているかチェック。',
      vi: 'Với chủ đích, kiểm tra chủ ngữ của mệnh đề trước có khớp người thực hiện hành động không.',
    },
    pointBubble: {
      ja: '「見るために映画館に行く」は自然。「見られるために映画館に行く」はニュアンスが変わる。',
      vi: '「Đi rạp để xem」 tự nhiên; 「để được xem （phim）」 có thể đổi nghĩa — cần chọn chủ thể chủ động/ bị động cẩn thận.',
    },
    examples: [
      { ja: '① 試験に合格するために、毎日二時間勉強している。', vi: '① Để đỗ kỳ thi tôi học 2 giờ mỗi ngày.' },
      { ja: '② 交通渋滞のために、約束に遅れてしまった。', vi: '② Vì kẹt xe tôi đến muộn hẹn.' },
      { ja: '③ 健康のために、野菜を増やしました。', vi: '③ Vì sức khỏe tôi tăng rau trong bữa.' },
    ],
    memo: { ja: '目的と理由では「ので」と置き換えやすさが違う — 自分用に例対を作る。', vi: '' },
    practice: {
      items: [
        { ja: '自分のJLPT準備について「ために」を二文（目的・理由）ずつ書く。', vi: '' },
      ],
    },
  },

  'you-ni': {
    jlpt: 'N4',
    pattern: '～ように',
    meta: LIST_META['you-ni'],
    connection: {
      ja: '辞書形／动词ない形／可能形＋ ように（様子・目的） 名詞＋ の＋ように',
      vi: '',
    },
    meaning: {
      ja: '目標達成への努力／変化の様相／比喻「まるで〜ように」。',
      vi: 'Hướng tới đạt được (mục tiêu) / cách thức biến đổi / so sánh “như〜”.',
    },
    usage: {
      ja: '無意志動詞（見える／分かる）は「ために」より「ように」になりやすい。',
      vi: 'Động từ không chủ đích (見える…): thường dùng 「ように」 chứ không phải 「ために」.',
    },
    examples: [
      { ja: '① 医者になるように頑張ります。', vi: '① Tôi cố để trở thành bác sĩ.' },
      { ja: '② この薬を飲むように、医者に言われました。', vi: '② Bác sĩ dặn uống thuốc này (như là…).' },
      { ja: '③ 鏡に映った自分まるで別人のように見えた。', vi: '③ Trong gương mình như một người khác.' },
    ],
    ng: {
      ja: ['目的を言うのに「見えるように」を誤って使う（× がんばって見えるように勉強している）。'],
      vi: ['Lộn 「見える」(nhìn thấy) với 「見える」(thể hiện nỗ lực) — ví dụ câu lỗi trên không tự nhiên.' ],
    },
    ngNote: { ja: '「ように」の前が「意志を持ちにくい述語」かどうか確認。', vi: 'Kiểm tra vế trước có phải vế “không tự chủ ý” không.' },
    memo: {
      ja: '比喩用法は「〜のような／みたいに」と言い換え練習。',
      vi: '',
    },
    practice: {
      items: [{ ja: '今週の目標について「〜ように」前文節つき一文。', vi: '' }],
    },
  },

  'koto-ni-naru': {
    jlpt: 'N3',
    pattern: '～ことになる',
    meta: LIST_META['koto-ni-naru'],
    connection: {
      ja: '动词辞書形／ない形／名詞 の＋ ことになる',
      vi: '',
    },
    meaning: {
      ja: '自分以外の決定・自然の帰結・ルールでの決まり。',
      vi: 'Quyết định (thường không phải bản thân kẻ nói) / quy củ / kết cục khách quan.',
    },
    usage: {
      ja: '受身と組みやすく、敬語文でも頻出（お〜することになります）。',
      vi: 'Hay ghép với bị động; trong kính ngữ: 「お〜することになります」.',
    },
    pointBubble: {
      ja: '「することにした」（自分決定）と対で覚えると混ざらない。',
      vi: 'Học cặp với 「ことにした」（tự quyết）để không lẫn.',
    },
    examples: [
      { ja: '① 来年から大阪支社に異動になることになりました。', vi: '① Từ năm sau tôi được điều chuyển chi nhánh Ōsaka (đã định).' },
      { ja: '② 台風の影響で試合は中止になることとなった。', vi: '② Do bão trận đấu đã được quyết định huỷ.' },
      { ja: '③ 館内では飲食禁止のことになっています。', vi: '③ Theo quy định trong tòa nhà không được ăn uống.' },
    ],
    compare: {
      caption: {
        ja: '「ことになる」と「ことにする」',
        vi: '',
      },
      colLabels: [{ ja: 'ことになる', vi: '' }, { ja: 'ことにする', vi: '' }],
      rows: [
        {
          label: { ja: '決定の主体', vi: '' },
          cells: [
            { ja: '環境／上司／規則など外部的', vi: '' },
            { ja: '話し手（自分の意思）', vi: '' },
          ],
        },
      ],
    },
    memo: {
      ja: '会社・学校での告知文に出たらチェックリストに入れる。',
      vi: '',
    },
    practice: {
      items: [{ ja: '自分の試験スケジュールを「〜ことになりました」で書いてみる（仮でも可）。', vi: '' }],
    },
  },

  'hazu-da': {
    jlpt: 'N3',
    pattern: '～はずだ',
    meta: LIST_META['hazu-da'],
    connection: { ja: '普通形／名詞＋の＋ はずだ', vi: '' },
    meaning: {
      ja: '論理・経験則からの強い見込み。反実仮想と相性がよい。',
      vi: 'Kỳ vọng có căn cứ logic/quy luật; hay đi với giả định ngược.',
    },
    usage: {
      ja: 'ニュースソースが曖昧なときは断定し過ぎない。',
      vi: 'Tin không rõ nguồn thì không dùng quá cứng.',
    },
    examples: [
      { ja: '① メールはもう届いているはずです。受信箱を確認してください。', vi: '① Mail lẽ đã đến — kiểm tra hộp thư nhé.' },
      { ja: '② 彼は準備していたはずだ。なのに遅れた。', vi: '② Anh ấy lẽ đã chuẩn bị — vậy mà vẫn muộn.' },
      { ja: '③ 駅の目の前のはずだったのに、地図を見間違えた。', vi: '③ Tưởng là trước ga — nhưng xem nhầm bản đồ.' },
    ],
    ng: {
      ja: ['初対面の相手の内面に「〜はずだ」を重ねる → 失礼に聞こえることがある。'],
      vi: ['Đoán nội tâm người lạ bằng 「はずだ」 nhiều lần — dễ thô lỗ.' ],
    },
    ngNote: { ja: '相手の感情に直接当てない。', vi: 'Tránh áp suy đoán lên cảm xúc người khác.' },
    memo: {
      ja: '「はずがない」とセットで音読練習。',
      vi: '',
    },
    practice: {
      items: [{ ja: '昨日予習した単元は簡単なはずだ、と一文。', vi: '' }],
    },
  },

  'mono-da': {
    jlpt: 'N3',
    pattern: '～ものだ',
    meta: LIST_META['mono-da'],
    connection: { ja: '普通形／名詞＋な＋ ものだ', vi: '' },
    meaning: {
      ja: '感嘆・一般真理・昔の習慣。「ものではない」は禁止・助言。',
      vi: 'Cảm thán, lẽ thường, thói xưa; 「ものではない」= không nên…',
    },
    usage: {
      ja: '話し手の人生経験をにじませる表現なので、レポートでは控えめ。',
      vi: 'Mang màu trải nghiệm — khi viết báo cáo nên dùng vừa phải.',
    },
    examples: [
      { ja: '① 若いころはよく徹夜したものだ。（昔の習い）', vi: '① Hồi trẻ hay thức đêm là thường.' },
      { ja: '② 時が経つのは早いものだ。（感嘆）', vi: '② Thời gian trôi nhanh thật.' },
      { ja: '③ 人の悪口を言うものではない。（助言／一般）', vi: '③ Không nên nói xấu người khác.' },
    ],
    compare: {
      caption: { ja: '「ものだ」と「べきだ」', vi: '' },
      colLabels: [{ ja: 'ものだ', vi: '' }, { ja: 'べきだ', vi: '' }],
      rows: [
        {
          label: { ja: 'ニュアンス', vi: '' },
          cells: [
            { ja: '一般論・感嘆・習い', vi: '' },
            { ja: '義務・強い規範', vi: '' },
          ],
        },
      ],
    },
    memo: {
      ja: '短文イディオムとして「愛するものだ」などは別義に注意。',
      vi: '',
    },
    practice: {
      items: [{ ja: '子どものころによくしていた習い慣えを「〜ものだ」で一文。', vi: '' }],
    },
  },
};

export function getGrammarListMeta() {
  return GRAMMAR_SLUG_ORDER.map((slug) => ({ slug, ...LIST_META[slug] }));
}

const JLPT_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'];

/** Các cấp JLPT có trong dữ liệu (thứ tự N5→N1) */
export function getDistinctJlptLevels() {
  const seen = new Set(getGrammarListMeta().map((item) => item.jlpt));
  return JLPT_ORDER.filter((lv) => seen.has(lv));
}

/** @param {{ jlpt?: string, tag?: string, q?: string, lang?: string }} filters */
export function filterGrammarItems(items, filters) {
  const jlpt = String(filters.jlpt || '').trim();
  const tag = String(filters.tag || '').trim();
  const qRaw = String(filters.q || '').trim().toLowerCase();
  const lang = filters.lang || 'ja';

  return items.filter((item) => {
    if (jlpt && item.jlpt !== jlpt) return false;
    if (tag && !(item.tagIds || []).includes(tag)) return false;
    if (!qRaw) return true;
    const pattern = String(item.pattern || '').toLowerCase();
    if (pattern.includes(qRaw)) return true;
    if (item.teaser) {
      const tj = String(item.teaser.ja || '').toLowerCase();
      const tv = String(item.teaser.vi || '').toLowerCase();
      if (tj.includes(qRaw) || tv.includes(qRaw)) return true;
    }
    return false;
  });
}

/**
 * @param {number} pageRequested 1-origin
 * @param {object} [filters] jlpt, tag, q, lang
 */
export function getGrammarListPaged(
  pageRequested,
  pageSize = GRAMMAR_PAGE_SIZE,
  filters = {},
) {
  const list = filterGrammarItems(getGrammarListMeta(), filters);
  const total = list.length;
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
  const items = list.slice(start, start + pageSize);
  const fromIndex = start + 1;
  const toIndex = Math.min(start + pageSize, total);
  return { items, page, pageSize, total, totalPages, fromIndex, toIndex };
}

export function getGrammarDetail(slug) {
  return DETAILS[slug] || null;
}

export function grammarSlugExists(slug) {
  return Boolean(DETAILS[slug]);
}

/** Dùng với `setSearchParams` của react-router */
export function grammarListSearchParams({ page = 1, jlpt = '', tag = '', q = '' } = {}) {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  const j = String(jlpt || '').trim();
  if (j && getDistinctJlptLevels().includes(j)) params.set('jlpt', j);
  const tg = String(tag || '').trim();
  if (tg && GRAMMAR_TAG_IDS.includes(tg)) params.set('tag', tg);
  const qt = String(q || '').trim();
  if (qt) params.set('q', qt);
  return params;
}

/** @param {{ page?: number, jlpt?: string, tag?: string, q?: string }} filters */
export function grammarListHref(filters = {}) {
  const qs = grammarListSearchParams(filters).toString();
  return qs ? `/grammar?${qs}` : '/grammar';
}
