import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import StudyPageHeader from "../components/study/StudyPageHeader.jsx";
import { mockStreak } from "../data/dashboardHomeMock.js";
import KanaStrokeAnimation from "../components/alphabet/KanaStrokeAnimation.jsx";
import AlphaPracticePad from "../components/alphabet/AlphaPracticePad.jsx";
import {
  HIRAGANA_ROWS,
  KATAKANA_ROWS,
  HIRAGANA_FLAT,
  KATAKANA_FLAT,
  HIRAGANA_YOON_ROWS,
  KATAKANA_YOON_ROWS,
  HIRAGANA_YOON_FLAT,
  KATAKANA_YOON_FLAT,
  getMnemonic,
} from "../data/alphabetData.js";
import "./DashboardHome.css";
import "./VocabularyPages.css";
import "./ReadingListPage.css";
import "./AlphabetPage.css";

function getRowLabel(row, tableKind) {
  if (tableKind === "yoon") return row.lead;
  if (row.rowKey === "n") {
    const ch = row.cells[0]?.char;
    return ch ? `${ch}行` : "";
  }
  const first = row.cells.find((c) => c?.char)?.char;
  return first ? `${first}行` : "";
}

function firstSelection(script, tableKind) {
  if (tableKind === "yoon") {
    return script === "hiragana"
      ? { char: "きゃ", romaji: "kya" }
      : { char: "キャ", romaji: "kya" };
  }
  return script === "hiragana"
    ? { char: "あ", romaji: "a" }
    : { char: "ア", romaji: "a" };
}

export default function AlphabetPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const rawLang = i18n.language || "ja";
  const mnemonicLang = rawLang.startsWith("ja") ? "ja" : "vi";

  const [script, setScript] = useState("hiragana");
  const [tableKind, setTableKind] = useState("gojuon");
  const [selected, setSelected] = useState({ char: "あ", romaji: "a" });
  const [showRomaji, setShowRomaji] = useState(true);
  const [replayTick, setReplayTick] = useState(0);
  const [practiceClearTick, setPracticeClearTick] = useState(0);

  const rows = useMemo(() => {
    if (tableKind === "yoon") {
      return script === "hiragana" ? HIRAGANA_YOON_ROWS : KATAKANA_YOON_ROWS;
    }
    return script === "hiragana" ? HIRAGANA_ROWS : KATAKANA_ROWS;
  }, [script, tableKind]);

  const flat = useMemo(() => {
    if (tableKind === "yoon") {
      return script === "hiragana" ? HIRAGANA_YOON_FLAT : KATAKANA_YOON_FLAT;
    }
    return script === "hiragana" ? HIRAGANA_FLAT : KATAKANA_FLAT;
  }, [script, tableKind]);

  const selectedSegments = useMemo(
    () => Array.from(selected.char),
    [selected.char],
  );
  const isCompound = selectedSegments.length > 1;

  const selectedIndex = useMemo(
    () => flat.findIndex((c) => c.char === selected.char),
    [flat, selected.char],
  );

  const goPrev = useCallback(() => {
    if (selectedIndex <= 0) return;
    setSelected(flat[selectedIndex - 1]);
  }, [flat, selectedIndex]);

  const goNext = useCallback(() => {
    if (selectedIndex < 0 || selectedIndex >= flat.length - 1) return;
    setSelected(flat[selectedIndex + 1]);
  }, [flat, selectedIndex]);

  const mnemonic = getMnemonic(selected.char, mnemonicLang);
  const mnemonicText =
    mnemonic ||
    t("alphabetPage.mnemonicFallback", {
      char: selected.char,
      romaji: selected.romaji,
    });

  const headerName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const videoHref = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${selected.char} 書き方 筆順`,
  )}`;

  if (!user) {
    return (
      <Layout
        userName={headerName}
        streakDays={mockStreak.days}
        pageClassName="vocab-dash"
      >
        <p className="vocab-empty">{t("common.loading")}</p>
      </Layout>
    );
  }

  const yoonColYa =
    script === "hiragana"
      ? t("alphabetPage.yoonColYa")
      : t("alphabetPage.yoonColYaKata");
  const yoonColYu =
    script === "hiragana"
      ? t("alphabetPage.yoonColYu")
      : t("alphabetPage.yoonColYuKata");
  const yoonColYo =
    script === "hiragana"
      ? t("alphabetPage.yoonColYo")
      : t("alphabetPage.yoonColYoKata");

  return (
    <Layout
      userName={headerName}
      streakDays={mockStreak.days}
      pageClassName="vocab-dash"
    >
      <Breadcrumb
        items={[
          { label: t("breadcrumb.home"), to: "/", end: true },
          { label: t("breadcrumb.alphabet") },
        ]}
      />
      <article
        className="vocab-sheet vocab-scope vocab-notebook vocab-lesson-scope alphabet-sheet alphabet-scope"
        aria-labelledby="alpha-title"
      >
        <StudyPageHeader
          titleId="alpha-title"
          title={t("alphabetPage.title")}
          subtitle={
            <>
              <span className="reading-sub-kicker" lang="ja">
                {t("alphabetPage.kickerJa")}
              </span>
              <span className="reading-sub-sep"> · </span>
              <span>{t("alphabetPage.kicker")}</span>
              <span className="reading-sub-sep"> — </span>
              {t("alphabetPage.subtitle")}
            </>
          }
          aside={
            <label className="vocab-lesson-goal-box alpha-head-romaji">
              <input
                type="checkbox"
                checked={showRomaji}
                onChange={(e) => setShowRomaji(e.target.checked)}
              />
              <span className="vocab-lesson-goal-label">
                {t("alphabetPage.showRomaji")}
              </span>
            </label>
          }
        />

        <div className="alpha-toolbar">
          <div
            className="alpha-tabs vocab-tabs vocab-tabs--scroll-mobile"
            role="tablist"
            aria-label={t("alphabetPage.tabListAria")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={script === "hiragana"}
              className={`alpha-tab alpha-tab--hira${script === "hiragana" ? " alpha-tab--active" : ""}`}
              onClick={() => {
                setScript("hiragana");
                setSelected(firstSelection("hiragana", tableKind));
              }}
            >
              {t("alphabetPage.tabHiragana")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={script === "katakana"}
              className={`alpha-tab alpha-tab--kata${script === "katakana" ? " alpha-tab--active" : ""}`}
              onClick={() => {
                setScript("katakana");
                setSelected(firstSelection("katakana", tableKind));
              }}
            >
              {t("alphabetPage.tabKatakana")}
            </button>
          </div>
        </div>

        <div className="alpha-mode-toolbar">
          <div
            className="alpha-mode-tabs vocab-tabs vocab-tabs--scroll-mobile"
            role="tablist"
            aria-label={t("alphabetPage.modeTabListAria")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={tableKind === "gojuon"}
              className={`alpha-mode-tab${tableKind === "gojuon" ? " alpha-mode-tab--active" : ""}`}
              onClick={() => {
                setTableKind("gojuon");
                setSelected(firstSelection(script, "gojuon"));
              }}
            >
              {t("alphabetPage.modeGojuon")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tableKind === "yoon"}
              className={`alpha-mode-tab${tableKind === "yoon" ? " alpha-mode-tab--active" : ""}`}
              onClick={() => {
                setTableKind("yoon");
                setSelected(firstSelection(script, "yoon"));
              }}
            >
              {t("alphabetPage.modeYoon")}
            </button>
          </div>
        </div>

        <div
          className={`alpha-grid-wrap alpha-grid-wrap--${script === "hiragana" ? "hira" : "kata"}`}
          role="grid"
          aria-label={
            tableKind === "yoon"
              ? t("alphabetPage.yoonGridAria")
              : t("alphabetPage.gridAria")
          }
        >
          {tableKind === "yoon" ? (
            <table className="alpha-table alpha-table--yoon">
              <thead>
                <tr>
                  <th className="alpha-yoon-corner" aria-hidden="true" />
                  <th scope="col" className="alpha-yoon-colhead">
                    {yoonColYa}
                  </th>
                  <th scope="col" className="alpha-yoon-colhead">
                    {yoonColYu}
                  </th>
                  <th scope="col" className="alpha-yoon-colhead">
                    {yoonColYo}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowKey}>
                    <th
                      scope="row"
                      className="alpha-row-label alpha-row-label--yoon"
                    >
                      {getRowLabel(row, tableKind)}
                    </th>
                    {row.cells.map((cell, ci) => (
                      <td
                        key={`${row.rowKey}-${ci}`}
                        className="alpha-cell-wrap"
                      >
                        {cell?.char ? (
                          <button
                            type="button"
                            role="gridcell"
                            className={`alpha-cell alpha-cell--yoon${
                              selected.char === cell.char
                                ? " alpha-cell--selected"
                                : ""
                            }`}
                            onClick={() =>
                              setSelected({
                                char: cell.char,
                                romaji: cell.romaji,
                              })
                            }
                            aria-pressed={selected.char === cell.char}
                          >
                            <span className="alpha-cell-kana" lang="ja">
                              {cell.char}
                            </span>
                            {showRomaji ? (
                              <span className="alpha-cell-romaji">
                                {cell.romaji}
                              </span>
                            ) : null}
                          </button>
                        ) : (
                          <span
                            className="alpha-cell-empty"
                            aria-hidden="true"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="alpha-table">
              <tbody>
                {rows.map((row) => (
                  <tr key={row.rowKey}>
                    <th scope="row" className="alpha-row-label">
                      {getRowLabel(row, tableKind)}
                    </th>
                    {row.cells.map((cell, ci) => (
                      <td
                        key={`${row.rowKey}-${ci}`}
                        className="alpha-cell-wrap"
                      >
                        {cell?.char ? (
                          <button
                            type="button"
                            role="gridcell"
                            className={`alpha-cell${selected.char === cell.char ? " alpha-cell--selected" : ""}`}
                            onClick={() =>
                              setSelected({
                                char: cell.char,
                                romaji: cell.romaji,
                              })
                            }
                            aria-pressed={selected.char === cell.char}
                          >
                            <span className="alpha-cell-kana" lang="ja">
                              {cell.char}
                            </span>
                            {showRomaji ? (
                              <span className="alpha-cell-romaji">
                                {cell.romaji}
                              </span>
                            ) : null}
                          </button>
                        ) : (
                          <span
                            className="alpha-cell-empty"
                            aria-hidden="true"
                          />
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="alpha-detail-grid">
          <article className="alpha-card alpha-card--stroke">
            <h3 className="alpha-card-title">
              {t("alphabetPage.strokeTitle")}
            </h3>
            <div
              className={`alpha-stroke-stage${isCompound ? " alpha-stroke-stage--compound" : ""}`}
            >
              {isCompound ? (
                <div className="alpha-compound-strokes">
                  {selectedSegments.map((seg, i) => (
                    <div
                      key={`${selected.char}-${i}`}
                      className="alpha-compound-part"
                    >
                      <div className="alpha-compound-step">
                        {t("alphabetPage.compoundPart", {
                          n: i + 1,
                          kana: seg,
                        })}
                      </div>
                      <KanaStrokeAnimation
                        script={script}
                        char={seg}
                        replayTick={replayTick}
                        fallbackHint={t("alphabetPage.strokeFallback")}
                        className="alpha-stroke-svg--compound"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <KanaStrokeAnimation
                  script={script}
                  char={selected.char}
                  replayTick={replayTick}
                  fallbackHint={t("alphabetPage.strokeFallback")}
                />
              )}
            </div>
            <div className="alpha-card-actions">
              <button
                type="button"
                className="alpha-btn alpha-btn--ghost"
                onClick={() => setReplayTick((x) => x + 1)}
              >
                {t("alphabetPage.replayStroke")}
              </button>
              <a
                className="alpha-btn alpha-btn--video"
                href={videoHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("alphabetPage.watchVideo")}
              </a>
            </div>
          </article>

          <article className="alpha-card alpha-card--practice">
            <h3 className="alpha-card-title">
              {t("alphabetPage.practiceTitle")}
            </h3>
            <p className="alpha-practice-hint">
              {t("alphabetPage.practiceTouchHint")}
            </p>
            <div className="alpha-practice-toolbar">
              <button
                type="button"
                className="alpha-btn alpha-btn--ghost alpha-btn--small"
                onClick={() => setPracticeClearTick((n) => n + 1)}
              >
                {t("alphabetPage.clearPractice")}
              </button>
            </div>
            <div
              className={`alpha-practice-layout${isCompound ? " alpha-practice-layout--compound" : ""}`}
            >
              <div className="alpha-practice-sample-wrap">
                <span
                  className="alpha-practice-sample"
                  lang="ja"
                  aria-label={t("alphabetPage.practiceSampleAria", {
                    char: selected.char,
                  })}
                >
                  {selected.char}
                </span>
              </div>
              {[0, 1, 2, 3].map((i) => (
                <AlphaPracticePad
                  key={`${selected.char}-${i}`}
                  guideText={selected.char}
                  variant={i === 0 ? "bold" : "trace"}
                  clearTick={practiceClearTick}
                  padIndex={i}
                  showGuide
                />
              ))}
            </div>
          </article>

          <article className="alpha-card alpha-card--tip">
            <h3 className="alpha-card-title">
              <span className="alpha-tip-icon" aria-hidden="true">
                💡
              </span>
              {t("alphabetPage.tipTitle")}
            </h3>
            <p className="alpha-tip-body">{mnemonicText}</p>
          </article>
        </div>

        <nav
          className="alpha-footer-nav"
          aria-label={t("alphabetPage.footerNavAria")}
        >
          <button
            type="button"
            className="alpha-nav-btn"
            onClick={goPrev}
            disabled={selectedIndex <= 0}
          >
            <span aria-hidden="true">←</span> {t("alphabetPage.prevChar")}
          </button>
          <button
            type="button"
            className="alpha-nav-btn"
            onClick={goNext}
            disabled={selectedIndex < 0 || selectedIndex >= flat.length - 1}
          >
            {t("alphabetPage.nextChar")} <span aria-hidden="true">→</span>
          </button>
        </nav>
      </article>
    </Layout>
  );
}
