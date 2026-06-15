/** Số câu mỗi lần AI sinh đề luyện ngữ pháp. */
export const GRAMMAR_PRACTICE_COUNT_MIN = 1;
export const GRAMMAR_PRACTICE_COUNT_MAX = 25;
export const GRAMMAR_PRACTICE_DEFAULT_COUNT = 10;

/** Số mẫu ngữ pháp trong DB đưa vào prompt làm ngữ cảnh. */
export const GRAMMAR_PRACTICE_PATTERN_SAMPLE = 40;

/** Quy tắc độ khó theo JLPT — nhắc AI không hạ cấp. */
export const GRAMMAR_PRACTICE_LEVEL_RULES = {
	N5: `JLPT N5: です／ます、基本助詞（は・が・を・に・で・と・へ）、い／な形容詞、て形入門、ない形、基本の疑問・否定。禁止: N4+（ば形、受身、使役、敬語複合、抽象接続）。`,
	N4: `JLPT N4: て形・た形、ない形、辞書形＋と、可能形入門、受身入門、比較（より・ほうが）、意向形、と思う、ように／ために、授受（あげる・くれる）。禁止: N3未習の複文・書き言葉 N2。`,
	N3: `JLPT N3: ば形・条件（と・ば・たら・なら）、使役・使役受身、敬語基礎、形式名詞（こと・もの・わけ・はず）、接続（のに・ばかり・だけでなく）、書き言葉中級。禁止: N1級の文語・極めて硬い表現。`,
	N2: `JLPT N2: 複合助詞、接続詞・書き言葉、敬語運用、推量・伝聞（らしい・ようだ・そうだ）、逆接・譲歩、名詞修飾複雑、新聞調。禁止: N5–N4のみの単純穴埋め連発。`,
	N1: `JLPT N1: 文語残存、硬い接続（をもって・に際して）、微妙な助詞・副詞、複合述語、論説調、類義語の使い分け。禁止: N3以下の基礎練習のみ。`,
};
