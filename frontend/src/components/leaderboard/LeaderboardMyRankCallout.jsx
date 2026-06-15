import PropTypes from "prop-types";

/**
 * Hiển thị hạng của bạn khi không nằm trong danh sách top đang render.
 */
export default function LeaderboardMyRankCallout({
  rankInfo,
  entries = [],
  myId = "",
  children,
  compact = false,
}) {
  if (!rankInfo?.rank || !myId) {
    return null;
  }

  const inList = entries.some((e) => e.userId === myId);
  if (inList) {
    return null;
  }

  return (
    <p
      className={`leaderboard-my-rank${compact ? " leaderboard-my-rank--compact" : ""}`}
      role="status"
    >
      {children(rankInfo)}
    </p>
  );
}

LeaderboardMyRankCallout.propTypes = {
  children: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      userId: PropTypes.string.isRequired,
    }),
  ),
  myId: PropTypes.string,
  rankInfo: PropTypes.shape({
    rank: PropTypes.number.isRequired,
  }),
};
