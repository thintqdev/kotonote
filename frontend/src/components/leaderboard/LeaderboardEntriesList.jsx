import PropTypes from "prop-types";
import LeaderboardRankBadge from "./LeaderboardRankBadge.jsx";
import LeaderboardUserCell from "./LeaderboardUserCell.jsx";

export default function LeaderboardEntriesList({
  entries,
  myId = "",
  renderValue,
  compact = false,
  loading = false,
  loadingMessage,
  emptyMessage,
}) {
  if (loading) {
    return (
      <p className="vocab-empty" aria-live="polite">
        {loadingMessage}
      </p>
    );
  }

  if (!entries?.length) {
    return (
      <p className="vocab-empty" role="status">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ol
      className={`leaderboard-table${compact ? " leaderboard-table--compact" : ""}`}
    >
      {entries.map((entry) => (
        <li
          key={entry.userId}
          className={`leaderboard-row${compact ? " leaderboard-row--compact" : ""}${myId && entry.userId === myId ? " leaderboard-row--me" : ""}`}
        >
          <LeaderboardRankBadge rank={entry.rank} />
          <LeaderboardUserCell entry={entry} compact={compact} />
          <div className="leaderboard-value">{renderValue(entry)}</div>
        </li>
      ))}
    </ol>
  );
}

LeaderboardEntriesList.propTypes = {
  compact: PropTypes.bool,
  emptyMessage: PropTypes.string.isRequired,
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      rank: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
    }),
  ),
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string.isRequired,
  myId: PropTypes.string,
  renderValue: PropTypes.func.isRequired,
};
