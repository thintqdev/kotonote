import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import SubjectCard from './SubjectCard.jsx';
import './SubjectGrid.css';

const SubjectGrid = ({ subjects, pinnedCards = false }) => {
  const { t } = useTranslation();
  return (
  <section className="subject-grid-section" aria-labelledby="subject-grid-heading">
    <h2 id="subject-grid-heading" className="subject-heading">
      {t('subjectsSection.heading')}
    </h2>
    <div className={`subject-grid${pinnedCards ? ' subject-grid--pinned' : ''}`}>
      {subjects.map((s) => (
        <SubjectCard
          key={s.id}
          subjectId={s.id}
          label={s.label}
          countLabel={s.countLabel}
          iconSrc={s.iconSrc}
          progress={s.progress}
          tint={s.tint}
          variant={s.variant}
          showPin={pinnedCards}
        />
      ))}
    </div>
  </section>
  );
};

SubjectGrid.propTypes = {
  pinnedCards: PropTypes.bool,
  subjects: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      countLabel: PropTypes.string.isRequired,
      iconSrc: PropTypes.string.isRequired,
      progress: PropTypes.number.isRequired,
      tint: PropTypes.string.isRequired,
      variant: PropTypes.string,
    })
  ).isRequired,
};

export default SubjectGrid;
