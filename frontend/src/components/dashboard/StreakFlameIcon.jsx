import PropTypes from "prop-types";
import { useId } from "react";
import "./StreakFlameIcon.css";

/**
 * Icon lửa streak — path một dòng, tỷ lệ 36×30 (rộng, không quá cao).
 * @param {"md" | "lg"} [size]
 */
function StreakFlameIcon({ className = "", size = "md" }) {
  const uid = useId().replace(/:/g, "");
  const gOuter = `streak-flame-outer-${uid}`;
  const gInner = `streak-flame-inner-${uid}`;

  const sizeClass =
    size === "lg" ? "streak-flame-svg--lg" : "streak-flame-svg--md";

  return (
    <svg
      className={`streak-flame-svg ${sizeClass} ${className}`.trim()}
      viewBox="0 0 36 30"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gOuter} x1="18" y1="28" x2="18" y2="2">
          <stop stopColor="#c44a28" />
          <stop offset="0.35" stopColor="#e07838" />
          <stop offset="0.65" stopColor="#f0a848" />
          <stop offset="1" stopColor="#ffe9a8" />
        </linearGradient>
        <radialGradient id={gInner} cx="18" cy="20" r="9">
          <stop stopColor="#fffef5" />
          <stop offset="0.55" stopColor="#ffe566" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb84a" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        fill={`url(#${gOuter})`}
        d="M18 3 C21 7 23 11 23 16 C23 21 21 25 18 26 C15 25 13 21 13 16 C13 11 15 7 18 3 Z"
      />
      <path
        fill={`url(#${gOuter})`}
        opacity="0.9"
        d="M12 12 C11 15 10 18 11 20 C12 22 13 22 13 20 C12 18 12 15 12 12 Z"
      />
      <path
        fill={`url(#${gOuter})`}
        opacity="0.85"
        d="M24 12 C25 15 26 18 25 20 C24 22 23 22 23 20 C24 18 24 15 24 12 Z"
      />
      <ellipse cx="18" cy="19" rx="5" ry="5.5" fill={`url(#${gInner})`} />
    </svg>
  );
}

StreakFlameIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(["md", "lg"]),
};

export default StreakFlameIcon;
