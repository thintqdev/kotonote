import PropTypes from "prop-types";
import { resolveAvatarUrl } from "../../utils/resolveAvatarUrl.js";

export default function LeaderboardUserCell({ entry, compact = false }) {
  const avatarSrc = resolveAvatarUrl(entry.avatar);
  const initial = (entry.displayName || "?").charAt(0).toUpperCase();
  const size = compact ? 28 : 36;

  return (
    <div
      className={`leaderboard-user${compact ? " leaderboard-user--compact" : ""}`}
    >
      {avatarSrc ? (
        <img
          className="leaderboard-avatar"
          src={avatarSrc}
          alt=""
          width={size}
          height={size}
          loading="lazy"
          decoding="async"
        />
      ) : (
        <span
          className="leaderboard-avatar leaderboard-avatar--placeholder"
          aria-hidden
        >
          {initial}
        </span>
      )}
      <span className="leaderboard-name">{entry.displayName}</span>
    </div>
  );
}

LeaderboardUserCell.propTypes = {
  compact: PropTypes.bool,
  entry: PropTypes.shape({
    avatar: PropTypes.string,
    displayName: PropTypes.string,
  }).isRequired,
};
