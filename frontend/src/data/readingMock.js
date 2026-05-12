/**
 * Bài đọc demo — ảnh từ Unsplash (URL cố định, crop qua tham số).
 * @typedef {'not_started' | 'in_progress' | 'done'} ReadingStatus
 * @typedef {{
 *   id: string,
 *   jlpt: string,
 *   titleJa: string,
 *   snippetJa: string,
 *   wordCount: number,
 *   readingMinutes: number,
 *   rating: number,
 *   imageUrl: string,
 *   status: ReadingStatus,
 *   featured?: boolean
 * }} ReadingArticle
 */

export const READING_JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"];

/** Tiến độ tổng (demo): đã “đọc xong” / mục tiêu */
export const READING_PROGRESS_DEMO = { completed: 18, goal: 60 };

/** @type {ReadonlyArray<ReadingArticle>} */
export const READING_ITEMS = [
  {
    id: "r-seasons",
    jlpt: "N3",
    titleJa: "日本の四季",
    snippetJa: "春は桜、夏は祭り。日本では季節の移り変わりを大切にする文化がある……",
    wordCount: 620,
    readingMinutes: 6,
    rating: 4.8,
    imageUrl:
      "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=480&h=300&fit=crop&q=80",
    status: "in_progress",
    featured: true,
  },
  {
    id: "r-myday",
    jlpt: "N4",
    titleJa: "私の一日",
    snippetJa: "朝六時に起きて、顔を洗います。そのあとで朝ごはんを食べます……",
    wordCount: 410,
    readingMinutes: 5,
    rating: 4.6,
    imageUrl:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=480&h=300&fit=crop&q=80",
    status: "not_started",
  },
  {
    id: "r-cat",
    jlpt: "N2",
    titleJa: "猫と暮らす",
    snippetJa: "うちには猫が二匹います。一匹は白くて、もう一匹は三毛猫です……",
    wordCount: 890,
    readingMinutes: 9,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=480&h=300&fit=crop&q=80",
    status: "done",
  },
  {
    id: "r-train",
    jlpt: "N3",
    titleJa: "電車で通勤する",
    snippetJa: "毎朝、満員電車に乗って会社へ行きます。駅では多くの人が急いでいます……",
    wordCount: 540,
    readingMinutes: 6,
    rating: 4.5,
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=480&h=300&fit=crop&q=80",
    status: "not_started",
  },
  {
    id: "r-cafe",
    jlpt: "N5",
    titleJa: "カフェで注文する",
    snippetJa: "すみません、ホットコーヒーを一つお願いします。サイズはMで……",
    wordCount: 220,
    readingMinutes: 3,
    rating: 4.7,
    imageUrl:
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=480&h=300&fit=crop&q=80",
    status: "not_started",
  },
  {
    id: "r-onsen",
    jlpt: "N1",
    titleJa: "温泉文化について",
    snippetJa: "日本の温泉は単なる入浴施設ではなく、地域の歴史や自然と結びついた文化である……",
    wordCount: 1200,
    readingMinutes: 12,
    rating: 4.9,
    imageUrl:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=480&h=300&fit=crop&q=80",
    status: "in_progress",
  },
  {
    id: "r-library",
    jlpt: "N4",
    titleJa: "図書館の利用",
    snippetJa: "図書館では静かにしなければなりません。本を借りるときはカードが必要です……",
    wordCount: 380,
    readingMinutes: 4,
    rating: 4.4,
    imageUrl:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=480&h=300&fit=crop&q=80",
    status: "done",
    featured: true,
  },
];

/**
 * @param {string} jlpt — "" = tất cả
 * @param {'all' | 'suggested' | 'review'} mode
 */
export function getReadingListFiltered(jlpt, mode = "all") {
  let list = [...READING_ITEMS];
  const j = String(jlpt || "").trim();
  if (j && READING_JLPT_LEVELS.includes(j)) {
    list = list.filter((x) => x.jlpt === j);
  }
  if (mode === "suggested") {
    list = list.filter((x) => x.featured);
  }
  if (mode === "review") {
    list = list.filter(
      (x) => x.status === "in_progress" || x.status === "done",
    );
  }
  return list;
}

/** @typedef {{ vi?: string, ja?: string }} ReadingGloss */
/**
 * @typedef {{
 *   paragraphsJa: string[],
 *   vocabulary: ReadonlyArray<{ termJa: string, gloss?: ReadingGloss }>,
 *   questions: ReadonlyArray<{
 *     questionJa: string,
 *     choicesJa: string[],
 *     answerIndex: number,
 *     explainPerChoice: { ja: string[], vi: string[] },
 *   }>,
 * }} ReadingDetailExtra
 */

/**
 * @param {ReadingDetailExtra['questions'][number]} q
 */
function normalizeReadingQuestion(q) {
  const n = q.choicesJa.length;
  const ex = q.explainPerChoice;
  const jaOk = ex?.ja?.length === n;
  const viOk = ex?.vi?.length === n;
  return {
    ...q,
    explainPerChoice: {
      ja: jaOk
        ? ex.ja
        : q.choicesJa.map(
            (_, i) => ex?.ja?.[i] ?? "（この選択肢の解説は準備中です。）",
          ),
      vi: viOk
        ? ex.vi
        : q.choicesJa.map(
            (_, i) => ex?.vi?.[i] ?? "(Giải thích lựa chọn này đang được bổ sung.)",
          ),
    },
  };
}

/** Nội dung đọc đầy đủ theo `id` (bổ sung trường từ READING_ITEMS). */
const READING_CONTENT = /** @type {Readonly<Record<string, ReadingDetailExtra>>} */ ({
  "r-seasons": {
    paragraphsJa: [
      "日本にははっきりした四季がある。春になると、桜の開花がニュースになり、多くの人がお花見に出かける。公園や川べりは、花びらの下で弁当を広げる人たちでにぎわう。",
      "夏は各地で祭りが行われ、夜空には大きな花火が打ち上げられる。秋は山や庭が紅葉で染まり、冬は静かな雪景色が心を落ち着かせる。",
      "こうした季節の移り変わりは、食べ物や年中行事にも深く関わっている。だからこそ、日本人は四季を大切にしてきたのだろう。",
    ],
    vocabulary: [
      { termJa: "四季（しき）", gloss: { vi: "bốn mùa", ja: "春夏秋冬のこと" } },
      { termJa: "花見（はなみ）", gloss: { vi: "ngắm hoa anh đào, dã ngoại mùa xuân" } },
      { termJa: "紅葉（こうよう）", gloss: { vi: "lá đỏ mùa thu" } },
      { termJa: "年中行事（ねんちゅうぎょうじ）", gloss: { vi: "lễ tết trong năm" } },
    ],
    questions: [
      {
        questionJa: "筆者が最も強調しているのはどのようなことか。",
        choicesJa: [
          "花火大会の規模について述べている。",
          "四季の変化が文化や生活と結びついていること。",
          "ニュースで桜の開花が報じられる仕組みについて。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "花火は夏の例として触れられているが、筆者の主張の中心はそこではない。",
            "正解。食べ物や年中行事との関わりまで書き、四季が暮らしや文化と結びついていると述べている。",
            "桜のニュースは春の導入の一例にすぎず、全文の主張を要約したものではない。",
          ],
          vi: [
            "Pháo hoa chỉ là ví dụ mùa hè, không phải luận điểm trung tâm.",
            "Đúng. Bài nối bốn mùa với ẩm thực, lễ hội và đời sống.",
            "Tin anh đào chỉ là ví dụ mở bài, không tóm tắt luận điểm chính.",
          ],
        },
      },
      {
        questionJa: "「心を落ち着かせる」とあるが、どの季節の様子について書かれているか。",
        choicesJa: ["春の桜。", "夏の祭り。", "冬の雪景色。"],
        answerIndex: 2,
        explainPerChoice: {
          ja: [
            "春の桜は花見の場面で触れられているが、「心を落ち着かせる」と結びついているのは冬の描写だ。",
            "夏の祭りや花火はにぎやかなイメージで、落ち着きとは対照的である。",
            "正解。冬の静かな雪景色の文脈で、心が落ち着くと書かれている。",
          ],
          vi: [
            "Hoa anh đào mùa xuân không được gắn với cụm “an tâm”.",
            "Lễ hè/pháo hoa mang sắc náo nhiệt, không khớp “yên tĩnh”.",
            "Đúng. Câu về tuyết mùa đông đi kèm ý tĩnh tâm.",
          ],
        },
      },
    ],
  },
  "r-myday": {
    paragraphsJa: [
      "私は毎朝六時ごろに起きる。まず顔を洗って、軽くストレッチをする。そのあとでキッチンへ行き、トーストとコーヒーで簡単な朝ごはんを食べる。",
      "八時前には家を出て、バス停へ向かう。バスに乗れば、車窓から街の景色が流れていく。会社に着く頃には、すでに多くの人が仕事を始めている。",
      "夕方は買い物をして帰り、夜は本を読んだりテレビを見たりして過ごす。規則正しい生活が、私には合っているようだ。",
    ],
    vocabulary: [
      { termJa: "朝ごはん（あさごはん）", gloss: { vi: "bữa sáng" } },
      { termJa: "車窓（しゃそう）", gloss: { vi: "cửa sổ xe (cảnh nhìn từ xe)" } },
      { termJa: "規則正しい（きそくただしい）", gloss: { vi: "đều đặn, đúng giờ" } },
    ],
    questions: [
      {
        questionJa: "筆者が最初にすることとして正しいのはどれか。",
        choicesJa: [
          "すぐにバス停へ行く。",
          "顔を洗ってから軽くストレッチをする。",
          "会社で朝ごはんを食べる。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "バス停へ行くのは朝ごはんのあとで、最初の行動ではない。",
            "正解。起床のあと「顔を洗い」「ストレッチ」と続けて書かれている。",
            "朝ごはんは自宅のキッチンで食べている。",
          ],
          vi: [
            "Đi bến xe buýt là bước sau, không phải việc đầu tiên.",
            "Đúng. Rửa mặt rồi giãn cơ ngay sau khi dậy.",
            "Bữa sáng ăn ở nhà, không phải tại công ty.",
          ],
        },
      },
      {
        questionJa: "夜の過ごし方として文中に書かれているのはどれか。",
        choicesJa: [
          "友だちと外で食事をする。",
          "本を読んだりテレビを見たりする。",
          "ジムで運動する。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "外食や友だちとの食事については書かれていない。",
            "正解。夜の過ごし方として明示されている。",
            "ジムでの運動には触れていない。",
          ],
          vi: [
            "Bài không nhắc ăn tối bạn bè bên ngoài.",
            "Đúng. Tối đọc sách hoặc xem TV như trong bài.",
            "Không có phòng gym.",
          ],
        },
      },
    ],
  },
  "r-cat": {
    paragraphsJa: [
      "うちには猫が二匹いる。一匹は真っ白で、もう一匹は三毛猫だ。性格も違い、白い猫はおとなしく、三毛のほうはやんちゃだ。",
      "朝になると、ごはんの時間を知らせるように鳴く。仕事から帰ると、玄関で待っていて、すりすりと足に寄ってくる。小さな家族のような存在だ。",
      "世話は大変だが、ふとした瞬間の仕草がかわいくて、つい写真を撮ってしまう。猫と暮らす日々は、静かな幸せに満ちている。",
    ],
    vocabulary: [
      { termJa: "三毛猫（みけねこ）", gloss: { vi: "mèo tam thể" } },
      { termJa: "やんちゃ", gloss: { vi: "nghịch ngợm, hiếu động" } },
      { termJa: "すりすり", gloss: { vi: "cọ cọ (tình cảm)" } },
    ],
    questions: [
      {
        questionJa: "家の猫について、正しい組み合わせはどれか。",
        choicesJa: [
          "二匹とも三毛猫である。",
          "白い猫はおとなしく、三毛はやんちゃだ。",
          "三毛の猫は白い猫より小さい。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "一匹は白、もう一匹は三毛と対比して書かれている。",
            "正解。性格の違いがそのまま述べられている。",
            "大きさの比較は文中にない。",
          ],
          vi: [
            "Hai con không đều tam thể; có một con trắng.",
            "Đúng. Mèo trắng hiền, mèo tam thể tinh nghịch.",
            "Bài không so sánh kích cỡ.",
          ],
        },
      },
      {
        questionJa: "「小さな家族のような存在」とあるが、何を指しているか。",
        choicesJa: ["近所の人。", "猫。", "仕事仲間。"],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "近所の人についての表現ではない。",
            "正解。猫の描写の直後に置かれた比喩である。",
            "仕事仲間とは文脈が合わない。",
          ],
          vi: [
            "Không nói về hàng xóm.",
            "Đúng. So sánh ngay sau đoạn về mèo.",
            "Không liên quan đồng nghiệp.",
          ],
        },
      },
    ],
  },
  "r-train": {
    paragraphsJa: [
      "毎朝、私は満員電車に揺られて会社へ向かう。駅のホームには、次の列車を待つ人の列ができている。ドアが開くと、静かに乗り込む。",
      "車内ではスマートフォンを見る人、閉じた目でうたた寝する人、それぞれだ。つり革につかまりながら、揺れに合わせて体のバランスを取るのも朝の習慣だ。",
      "混雑は苦手だが、この時間にだけは多くの人と同じリズムで動いていると感じる。都市の朝は、電車の中から始まっているのかもしれない。",
    ],
    vocabulary: [
      { termJa: "満員電車（まんいんでんしゃ）", gloss: { vi: "tàu giờ cao điểm, chật người" } },
      { termJa: "つり革（つりかわ）", gloss: { vi: "dây tay vịn trên tàu" } },
      { termJa: "うたた寝", gloss: { vi: "chợp mắt, ngủ gà ngủ gật" } },
    ],
    questions: [
      {
        questionJa: "筆者が車内でしていることに近いのはどれか。",
        choicesJa: [
          "いつも座って新聞を読む。",
          "つり革につかまり揺れに合わせる。",
          "駅で買い物をする。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "座って新聞を読むとは書かれておらず、満員の描写とも合いにくい。",
            "正解。つり革とバランスについて明記されている。",
            "駅での買い物には触れていない。",
          ],
          vi: [
            "Bài không nói ngồi đọc báo.",
            "Đúng. Nắm dây tay vịn và giữ thăng bằng khi tàu lắc.",
            "Không nhắc mua sắm ở ga.",
          ],
        },
      },
      {
        questionJa: "筆者の考えとして適切なのはどれか。",
        choicesJa: [
          "混雑が好きで電車に乗る。",
          "都市の朝は電車の中から始まっているように感じる。",
          "電車よりバスのほうが便利だ。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "混雑は苦手だと書かれている。",
            "正解。最後の文で都市の朝と電車内のリズムが結ばれている。",
            "バスとの比較は出てこない。",
          ],
          vi: [
            "Tác giả nói không thích chen chúc.",
            "Đúng. Câu cuối liên tưởng buổi sáng thành phố với nhịp trên tàu.",
            "Không so sánh với xe buýt.",
          ],
        },
      },
    ],
  },
  "r-cafe": {
    paragraphsJa: [
      "カフェに入ると、店員さんが「いらっしゃいませ」と声をかけてくれる。カウンターで注文すると、名前を聞かれることがある。",
      "「ホットコーヒーを一つ、サイズはMでお願いします」と伝える。支払いはカードでも現金でもよい。しばらくすると、番号が呼ばれて商品が渡される。",
      "窓際の席に座り、一口飲む。苦みのあとにほんのり甘さが広がる。忙しい一日の中でも、ここだけは時間がゆっくり流れる気がする。",
    ],
    vocabulary: [
      { termJa: "いらっしゃいませ", gloss: { vi: "mời vào (lời chào cửa hàng)" } },
      { termJa: "カウンター", gloss: { vi: "quầy (thanh toán)" } },
      { termJa: "支払い（しはらい）", gloss: { vi: "thanh toán" } },
    ],
    questions: [
      {
        questionJa: "注文の内容として文中にあるのはどれか。",
        choicesJa: [
          "アイスティーLサイズ。",
          "ホットコーヒーMサイズ。",
          "ホットミルクSサイズ。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "アイスティーには触れていない。",
            "正解。セリフとしてそのまま引用されている。",
            "ホットミルクではなくコーヒーである。",
          ],
          vi: [
            "Không gọi trà đá size L.",
            "Đúng. Trích thoại cà phê nóng size M.",
            "Không phải sữa nóng size S.",
          ],
        },
      },
      {
        questionJa: "筆者が感じていることとして適切なのはどれか。",
        choicesJa: [
          "カフェはいつもにぎやかで落ち着かない。",
          "カフェだけは時間がゆっくり流れる気がする。",
          "店員の声がうるさい。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "にぎやかで落ち着かないとは逆のニュアンスが書かれている。",
            "正解。苦みと甘さのあとに、時間がゆっくり流れるとある。",
            "店員の声がうるさいという否定的描写はない。",
          ],
          vi: [
            "Bài không nói quán luôn ồn ào khó chịu.",
            "Đúng. Cảm giác thời gian chậm lại trong quán.",
            "Không phàn nàn giọng nhân viên.",
          ],
        },
      },
    ],
  },
  "r-onsen": {
    paragraphsJa: [
      "日本の温泉は、単なる入浴施設ではない。地域の歴史や自然、人々の暮らしと深く結びついた文化だ。湯治場として発展した土地も多い。",
      "泉質はさまざまで、にごり湯や硫黄の香りがする湯など、それぞれに特徴がある。浴衣を着て館内を歩くのも、旅館ならではの楽しみだ。",
      "現代人にとって、温泉は心と体を休める貴重な場所になっている。自然の恵みをありがたく味わいたい。",
    ],
    vocabulary: [
      { termJa: "湯治（とうじ）", gloss: { vi: "tắm khoáng chữa bệnh" } },
      { termJa: "泉質（せんしつ）", gloss: { vi: "thành phần/thể loại nước khoáng" } },
      { termJa: "にごり湯", gloss: { vi: "nước khoáng đục (nhiều khoáng)" } },
    ],
    questions: [
      {
        questionJa: "筆者が述べている温泉の位置づけとして最も近いのはどれか。",
        choicesJa: [
          "スポーツジムのような施設。",
          "地域の歴史や自然と結びついた文化。",
          "ショッピングモールの一角。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "ジムのような運動施設とは対比されている。",
            "正解。入浴施設にとどまらず文化だと明言している。",
            "ショッピングモールとの類比はない。",
          ],
          vi: [
            "Bài phủ nhận kiểu “chỉ là phòng gym”.",
            "Đúng. Onsen là văn hóa gắn lịch sử, thiên nhiên, đời sống.",
            "Không ví với trung tâm thương mại.",
          ],
        },
      },
      {
        questionJa: "「旅館ならではの楽しみ」として挙げられているのはどれか。",
        choicesJa: [
          "浴衣を着て館内を歩くこと。",
          "硫黄の香りを嗅ぐことだけ。",
          "スマートフォンで写真を撮ること。",
        ],
        answerIndex: 0,
        explainPerChoice: {
          ja: [
            "正解。浴衣で館内を歩くことが、旅館特有の楽しみとして挙げられている。",
            "硫黄の香りは泉質の説明の一部で、「だけ」と限定はされていない。",
            "スマートフォンでの撮影には触れていない。",
          ],
          vi: [
            "Đúng. Mặc yukata đi trong nhà trọ được nêu là thú riêng ryokan.",
            "Mùi lưu huỳnh chỉ là ví dụ về loại nước, không phải thú vui duy nhất.",
            "Không nhắc chụp ảnh điện thoại.",
          ],
        },
      },
    ],
  },
  "r-library": {
    paragraphsJa: [
      "図書館では、みんなが集中できるよう静かに過ごすことが求められる。席では小声で話し、携帯電話の着信音はマナーモードにするのが普通だ。",
      "本を借りるには、利用カードが必要なことが多い。返却期限を守り、大切に扱うことがルールとして定められている。",
      "児童コーナーでは絵本が並び、読書の楽しさを子どもたちが体験できる。図書館は、学びと余白を両方提供してくれる場所だ。",
    ],
    vocabulary: [
      { termJa: "利用カード（りようカード）", gloss: { vi: "thẻ mượn sách" } },
      { termJa: "返却期限（へんきゃくきげん）", gloss: { vi: "hạn trả sách" } },
      { termJa: "児童コーナー（じどうコーナー）", gloss: { vi: "khu thiếu nhi" } },
    ],
    questions: [
      {
        questionJa: "図書館でのマナーとして文中に書かれているのはどれか。",
        choicesJa: [
          "携帯電話をいつでも話してよい。",
          "着信音はマナーモードにするのが普通。",
          "大声で話してもよい。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "静かに過ごすことが求められており、自由に通話できるとは書かれていない。",
            "正解。着信音はマナーモードにするのが普通だとある。",
            "大声で話してよいとは逆である。",
          ],
          vi: [
            "Bài yêu cần yên tĩnh, không cho gọi thoải mái.",
            "Đúng. Chuông điện thoại nên im (chế độ lịch sự).",
            "Không khuyến khích nói to.",
          ],
        },
      },
      {
        questionJa: "筆者が図書館について最後に述べているのはどのようなことか。",
        choicesJa: [
          "本を売る場所である。",
          "学びと余白を両方提供してくれる場所だ。",
          "遊び場としてだけ使われている。",
        ],
        answerIndex: 1,
        explainPerChoice: {
          ja: [
            "販売の話はなく、貸出のルールが中心である。",
            "正解。最終段落で学びと余白の両方と評している。",
            "児童コーナーはあるが、遊び場だけとは言っていない。",
          ],
          vi: [
            "Thư viện không được mô tả là nơi bán sách.",
            "Đúng. Câu kết: vừa học vừa có khoảng trống (余白).",
            "Có khu thiếu nhi nhưng không nói chỉ là sân chơi.",
          ],
        },
      },
    ],
  },
});

/**
 * @param {string} id
 * @returns {(ReadingArticle & ReadingDetailExtra) | null}
 */
export function getReadingDetail(id) {
  const base = READING_ITEMS.find((x) => x.id === id);
  if (!base) return null;
  const extra = READING_CONTENT[id];
  if (!extra) {
    return {
      ...base,
      paragraphsJa: [
        `${base.snippetJa}`,
        "（この教材の詳細データは準備中です。）",
      ],
      vocabulary: [],
      questions: [],
    };
  }
  return { ...base, ...extra, questions: extra.questions.map(normalizeReadingQuestion) };
}

/** 正解記号（三択） */
export function readingChoiceLetterJa(index) {
  const letters = ["ア", "イ", "ウ"];
  return letters[index] ?? String(index + 1);
}
