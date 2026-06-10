import { memo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import './DailyProgressCard.css';

const DailyProgressCard = ({ percent, tasks, showTitle = true, titleId = 'daily-progress-heading' }) => {
  const { t } = useTranslation();
  const donutAria = t('today.donutAria', { pct: percent });

  return (
    <section
      className={`daily-progress${showTitle ? '' : ' daily-progress--embedded'}`}
      aria-labelledby={titleId}
    >
      {showTitle ? (
      <h2 id={titleId} className="daily-progress-title">
        {t('today.title')}
      </h2>
      ) : null}
      <div className="daily-progress-body">
        <div
          className="daily-progress-donut"
          style={{ '--progress-pct': String(percent) }}
          role="img"
          aria-label={donutAria}
        >
          <div className="daily-progress-donut-inner">
            <span className="daily-progress-donut-pct">{percent}%</span>
            <span className="daily-progress-donut-label">
              {t('today.donutLabel')}
            </span>
          </div>
        </div>
        <ul className="daily-progress-list">
          {tasks.map((t) => (
            <li key={`${t.label}-${t.detail}`} className="daily-progress-item">
              <span className="daily-progress-check" aria-hidden="true">
                ✓
              </span>
              <span className="daily-progress-task-lines">
                <span className="daily-progress-task-line">
                  <strong>{t.label}</strong>: {t.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="daily-progress-foot">
        <span aria-hidden="true">♡</span> {t('today.foot')}
      </p>
    </section>
  );
};

DailyProgressCard.propTypes = {
  showTitle: PropTypes.bool,
  titleId: PropTypes.string,
  percent: PropTypes.number.isRequired,
  tasks: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      detail: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default memo(DailyProgressCard);
