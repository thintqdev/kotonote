import PropTypes from "prop-types";

export default function LeaderboardRankBadge({ rank }) {
  const cls =
    rank === 1
      ? "leaderboard-rank leaderboard-rank--1"
      : rank === 2
        ? "leaderboard-rank leaderboard-rank--2"
        : rank === 3
          ? "leaderboard-rank leaderboard-rank--3"
          : "leaderboard-rank";
  return <span className={cls}>{rank}</span>;
}

LeaderboardRankBadge.propTypes = {
  rank: PropTypes.number.isRequired,
};
