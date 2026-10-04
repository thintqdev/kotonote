import PropTypes from "prop-types";
import ExamPassageText from "../exam/ExamPassageText.jsx";

/** Bài `contentFormat: "markup"` mới diễn giải cú pháp; bài plain hiển thị nguyên văn. */
export default function ReadingRichText({ text, lang = "ja", markup = false }) {
  if (!markup) return text ?? "";
  return (
    <ExamPassageText
      text={text ?? ""}
      as="span"
      lang={lang}
      className="exam-passage-inline"
    />
  );
}

ReadingRichText.propTypes = {
  text: PropTypes.string,
  lang: PropTypes.string,
  markup: PropTypes.bool,
};
