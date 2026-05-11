import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../components/auth/AuthLayout.jsx';
import './SurveyPage.css';

const LEVEL_OPTIONS = ['begin', 'n5', 'n4', 'n3', 'n2up'];
const GOAL_OPTIONS = ['jlpt', 'travel', 'work', 'school', 'hobby'];
const DAILY_OPTIONS = [
  { v: 'lt15', i18nKey: 'lt15' },
  { v: '15-30', i18nKey: 'm1530' },
  { v: '30-60', i18nKey: 'm3060' },
  { v: 'gt60', i18nKey: 'gt60' },
];
const WEAK_IDS = ['grammar', 'vocab', 'kanji', 'listen', 'read'];
const DISCOVERY_OPTIONS = ['friend', 'sns', 'search', 'other'];

const SurveyPage = () => {
  const { t } = useTranslation();
  const [level, setLevel] = useState('');
  const [goal, setGoal] = useState('');
  const [dailyTime, setDailyTime] = useState('');
  const [weakAreas, setWeakAreas] = useState([]);
  const [discovery, setDiscovery] = useState('');
  const [discoveryNote, setDiscoveryNote] = useState('');
  const [freeNote, setFreeNote] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleWeak = (id) => {
    setWeakAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout formLayout="survey">
        <div className="auth-form-section survey-done">
          <div className="form-title-wrap form-title-wrap--center survey-done-title">
            <p className="survey-done-heading">{t('survey.doneHeading')}</p>
            <p className="survey-done-note auth-caption-sm">
              {t('survey.doneNote')}
            </p>
          </div>
          <p className="survey-done-next">
            {t('survey.doneNext')}
          </p>
          <div className="survey-done-actions">
            <Link
              to="/"
              className="btn-primary btn-login btn-primary--stack survey-done-link"
            >
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t('survey.homeCta')}</span>
                <span className="btn-arrow">→</span>
              </span>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout formLayout="survey">
      <div className="auth-form-section survey-page">
        <div className="form-title-wrap form-title-wrap--center">
          <h2 className="form-title-main survey-main-title">{t('survey.title')}</h2>
          <p className="survey-lead auth-caption-sm">{t('survey.lead')}</p>
        </div>

        <form className="auth-form survey-form" onSubmit={handleSubmit} noValidate>
          <fieldset className="survey-fieldset">
            <legend className="survey-legend">
              <span className="auth-label-text">{t('survey.legendLevel')}</span>
            </legend>
            <div className="survey-options">
              {LEVEL_OPTIONS.map((v) => (
                <label key={v} className="survey-option">
                  <input
                    type="radio"
                    name="level"
                    value={v}
                    checked={level === v}
                    onChange={() => setLevel(v)}
                  />
                  <span className="survey-option-label auth-label-text">
                    {t(`survey.levels.${v}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="survey-fieldset">
            <legend className="survey-legend">
              <span className="auth-label-text">{t('survey.legendGoal')}</span>
            </legend>
            <div className="survey-options">
              {GOAL_OPTIONS.map((v) => (
                <label key={v} className="survey-option">
                  <input
                    type="radio"
                    name="goal"
                    value={v}
                    checked={goal === v}
                    onChange={() => setGoal(v)}
                  />
                  <span className="survey-option-label auth-label-text">
                    {t(`survey.goals.${v}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="survey-fieldset">
            <legend className="survey-legend">
              <span className="auth-label-text">{t('survey.legendDaily')}</span>
            </legend>
            <div className="survey-options">
              {DAILY_OPTIONS.map(({ v, i18nKey }) => (
                <label key={v} className="survey-option">
                  <input
                    type="radio"
                    name="dailyTime"
                    value={v}
                    checked={dailyTime === v}
                    onChange={() => setDailyTime(v)}
                  />
                  <span className="survey-option-label auth-label-text">
                    {t(`survey.daily.${i18nKey}`)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="survey-fieldset">
            <legend className="survey-legend">
              <span className="auth-label-text">{t('survey.legendWeak')}</span>
            </legend>
            <div className="survey-check-grid">
              {WEAK_IDS.map((id) => (
                <label key={id} className="survey-check">
                  <input
                    type="checkbox"
                    checked={weakAreas.includes(id)}
                    onChange={() => toggleWeak(id)}
                  />
                  <span className="auth-label-text">{t(`survey.weak.${id}`)}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="survey-fieldset">
            <legend className="survey-legend">
              <span className="auth-label-text">{t('survey.legendDiscovery')}</span>
            </legend>
            <div className="survey-options">
              {DISCOVERY_OPTIONS.map((v) => (
                <label key={v} className="survey-option">
                  <input
                    type="radio"
                    name="discovery"
                    value={v}
                    checked={discovery === v}
                    onChange={() => setDiscovery(v)}
                  />
                  <span className="survey-option-label auth-label-text">
                    {t(`survey.discovery.${v}`)}
                  </span>
                </label>
              ))}
            </div>
            {discovery === 'other' && (
              <div className="survey-note-field">
                <label className="field-label" htmlFor="discovery-note">
                  <span className="auth-label-text">{t('survey.discoveryNote')}</span>
                </label>
                <textarea
                  id="discovery-note"
                  className="sketch-input survey-textarea"
                  rows={2}
                  placeholder={t('survey.discoveryNotePh')}
                  value={discoveryNote}
                  onChange={(e) => setDiscoveryNote(e.target.value)}
                />
              </div>
            )}
          </fieldset>

          <div className="field-group survey-note-field">
            <label className="field-label" htmlFor="free-note">
              <span className="auth-label-text">{t('survey.freeNote')}</span>
            </label>
            <textarea
              id="free-note"
              className="sketch-input survey-textarea"
              rows={3}
              placeholder={t('survey.freeNotePh')}
              value={freeNote}
              onChange={(e) => setFreeNote(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-primary btn-login btn-primary--stack survey-submit"
          >
            <span className="btn-primary-line1">
              <span className="btn-primary-main">{t('survey.submit')}</span>
              <span className="btn-arrow">→</span>
            </span>
          </button>

          <p className="survey-privacy auth-caption-sm">
            {t('survey.privacy')}
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SurveyPage;
