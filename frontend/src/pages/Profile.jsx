import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth.jsx';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb, DateField } from '../components/common';
import {
  mockStreak,
  buildDemoProfile,
} from '../data/dashboardHomeMock.js';
import i18n from '../i18n.js';
import { EXAM_TYPE_ORDER, EXAM_LEVEL_KEYS_BY_TYPE, defaultLevelForType } from '../constants/profileExamGoals.js';
import {
  buildExamTargetDisplay,
  formatExamDateLong,
  resolveGoalExamFields,
} from '../utils/profileExamDisplay.js';
import './Profile.css';
import { loadOverrides, persistOverrides } from '../utils/profileStorage.js';

const MAX_AVATAR_CHARS = 900_000;

function IconPencil() {
  return (
    <svg
      className="profile-toolbar-icon"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 000-3l-1-1a2.1 2.1 0 00-3 0L4 16v4z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M13 7l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg
      className="profile-avatar-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 5v10M8 9l4-4 4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 19h14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconImageOff() {
  return (
    <svg
      className="profile-avatar-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="9" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M6 19c0-3.5 4-5 6-5s6 1.5 6 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M4 4l16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildDraftFromProfile(p) {
  const g = resolveGoalExamFields(p);
  return {
    displayName: p.displayName,
    readingName: p.readingName ?? '',
    title: p.title ?? '',
    email: p.email,
    location: p.location ?? '',
    timeZoneLabel: p.timeZoneLabel ?? '',
    bio: p.bio ?? '',
    examTypeKey: g.examTypeKey,
    examLevelKey: g.examLevelKey,
    examDateIso: g.examDateIso,
    examOtherNote: g.examOtherNote,
    examTarget: p.examTarget ?? '',
    examDateLabel: p.examDateLabel ?? '',
    avatarDataUrl: p.avatarDataUrl || null,
  };
}

const Profile = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [overrides, setOverrides] = useState(loadOverrides);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(() =>
    buildDraftFromProfile(buildDemoProfile((key) => i18n.t(key))),
  );
  const avatarInputRef = useRef(null);

  const demoProfile = useMemo(() => buildDemoProfile(t), [t, i18n.language]);

  const baseProfile = useMemo(
    () => ({
      ...demoProfile,
      displayName: user?.name?.trim() || demoProfile.displayName,
      email: user?.email?.trim() || demoProfile.email,
    }),
    [user, demoProfile],
  );

  const profile = useMemo(() => {
    const merged = { ...baseProfile, ...overrides };
    if (user?.email?.trim()) merged.email = user.email.trim();
    if (Object.prototype.hasOwnProperty.call(overrides, 'avatarDataUrl')) {
      merged.avatarDataUrl = overrides.avatarDataUrl || null;
    }
    return merged;
  }, [baseProfile, overrides, user]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(buildDraftFromProfile(profile));
    }
  }, [isEditing, profile]);

  const emailLocked = Boolean(user?.email);

  const initial = useMemo(() => {
    const nm = String(profile.displayName || '').trim();
    const ch = nm ? [...nm][0] : '?';
    return typeof ch === 'string' ? ch.toUpperCase() : '?';
  }, [profile.displayName]);

  const headerName =
    profile.displayName.split(/\s+/)[0] || profile.displayName;

  const startEdit = useCallback(() => {
    setDraft(buildDraftFromProfile(profile));
    setIsEditing(true);
  }, [profile]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setDraft(buildDraftFromProfile(profile));
  }, [profile]);

  const saveEdit = useCallback(() => {
    const typeKey = draft.examTypeKey || 'jlpt';
    const levelKeys = EXAM_LEVEL_KEYS_BY_TYPE[typeKey] || [];
    const levelKey =
      typeKey === 'other'
        ? ''
        : levelKeys.includes(draft.examLevelKey)
          ? draft.examLevelKey
          : defaultLevelForType(typeKey);
    const otherNote =
      typeKey === 'other' ? draft.examOtherNote.trim() : '';
    const dateIso = draft.examDateIso || '';

    const goalForText = {
      examTypeKey: typeKey,
      examLevelKey: levelKey,
      examOtherNote: otherNote,
    };
    const examTargetLine = buildExamTargetDisplay(t, goalForText);
    const examDateLine = dateIso
      ? formatExamDateLong(dateIso, i18n.language)
      : '';

    const next = {
      ...overrides,
      displayName: draft.displayName.trim() || baseProfile.displayName,
      readingName: draft.readingName.trim(),
      title: draft.title.trim(),
      location: draft.location.trim(),
      timeZoneLabel: draft.timeZoneLabel.trim(),
      bio: draft.bio.trim(),
      examTypeKey: typeKey,
      examLevelKey: levelKey,
      examDateIso: dateIso,
      examOtherNote: otherNote,
      examTarget: examTargetLine,
      examDateLabel: examDateLine,
      avatarDataUrl: draft.avatarDataUrl,
    };
    if (emailLocked) {
      delete next.email;
    } else {
      next.email = draft.email.trim() || baseProfile.email;
    }
    setOverrides(next);
    persistOverrides(next);
    setIsEditing(false);
  }, [
    overrides,
    draft,
    baseProfile.displayName,
    baseProfile.email,
    emailLocked,
    t,
    i18n.language,
  ]);

  const onAvatarFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      if (typeof dataUrl === 'string' && dataUrl.length > MAX_AVATAR_CHARS) {
        return;
      }
      setDraft((d) => ({ ...d, avatarDataUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, []);

  const clearAvatar = useCallback(() => {
    setDraft((d) => ({ ...d, avatarDataUrl: null }));
  }, []);

  const setField = useCallback((key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
  }, []);

  const showAvatar = isEditing ? draft.avatarDataUrl : profile.avatarDataUrl;

  const goalResolved = useMemo(
    () => resolveGoalExamFields(profile),
    [profile],
  );

  const goalTargetDisplay = useMemo(
    () => buildExamTargetDisplay(t, goalResolved),
    [t, goalResolved],
  );

  const goalDateDisplay = useMemo(() => {
    if (goalResolved.examDateIso) {
      return formatExamDateLong(goalResolved.examDateIso, i18n.language);
    }
    return profile.examDateLabel || '';
  }, [goalResolved.examDateIso, profile.examDateLabel, i18n.language]);

  const onExamTypeChange = useCallback((typeKey) => {
    setDraft((d) => ({
      ...d,
      examTypeKey: typeKey,
      examLevelKey:
        typeKey === 'other' ? '' : defaultLevelForType(typeKey),
      examOtherNote: typeKey === 'other' ? d.examOtherNote : '',
    }));
  }, []);

  return (
    <Layout
      userName={headerName}
      footerQuote={t('profileQuote')}
      streakDays={mockStreak.days}
      mainInnerClassName="profile-main"
    >
      <Breadcrumb
              items={[
                { label: t('breadcrumb.home'), to: '/', end: true },
                { label: t('breadcrumb.profile') },
              ]}
            />

            <div className="profile-toolbar">
              {!isEditing ? (
                <button
                  type="button"
                  className="profile-btn profile-btn--edit"
                  onClick={startEdit}
                >
                  <IconPencil />
                  {t('profile.edit')}
                </button>
              ) : (
                <div className="profile-toolbar-actions">
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost"
                    onClick={cancelEdit}
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn--save"
                    onClick={saveEdit}
                  >
                    {t('profile.save')}
                  </button>
                </div>
              )}
            </div>

            <div className="profile-layout">
              <article className="profile-card profile-card--hero">
                <span className="profile-card-tape" aria-hidden />
                <div className="profile-hero-grid">
                  <div className="profile-avatar-block">
                    <div className="profile-avatar-wrap">
                      {showAvatar ? (
                        <img
                          src={showAvatar}
                          alt=""
                          className="profile-avatar profile-avatar--img"
                          decoding="async"
                        />
                      ) : (
                        <span className="profile-avatar" aria-hidden="true">
                          {initial}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <div className="profile-avatar-actions">
                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          className="profile-upload-input"
                          onChange={onAvatarFile}
                          tabIndex={-1}
                          aria-hidden="true"
                        />
                        <button
                          type="button"
                          className="profile-btn profile-btn--avatar profile-btn--upload"
                          onClick={() => avatarInputRef.current?.click()}
                        >
                          <IconUpload />
                          <span className="profile-btn-label">{t('profile.changePhoto')}</span>
                        </button>
                        <button
                          type="button"
                          className="profile-btn profile-btn--avatar profile-btn--remove"
                          onClick={clearAvatar}
                          disabled={!draft.avatarDataUrl}
                          aria-disabled={!draft.avatarDataUrl}
                        >
                          <IconImageOff />
                          <span className="profile-btn-label">{t('profile.removePhoto')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="profile-hero-text">
                    {!isEditing ? (
                      <>
                        <h2 className="profile-name-vn">
                          {profile.displayName}
                        </h2>
                        {profile.readingName ? (
                          <p className="profile-name-reading">
                            {profile.readingName}
                          </p>
                        ) : null}
                        <p className="profile-title-line">{profile.title}</p>
                        <p className="profile-email-line">{profile.email}</p>
                      </>
                    ) : (
                      <div className="profile-form-stack">
                        <label className="profile-field">
                          <span className="profile-field-label">{t('profile.fullName')}</span>
                          <input
                            type="text"
                            className="profile-input"
                            value={draft.displayName}
                            onChange={(e) =>
                              setField('displayName', e.target.value)
                            }
                            autoComplete="name"
                          />
                        </label>
                        <label className="profile-field">
                          <span className="profile-field-label">
                            {t('profile.readingName')}
                          </span>
                          <input
                            type="text"
                            className="profile-input"
                            value={draft.readingName}
                            onChange={(e) =>
                              setField('readingName', e.target.value)
                            }
                          />
                        </label>
                        <label className="profile-field">
                          <span className="profile-field-label">
                            {t('profile.titleLine')}
                          </span>
                          <input
                            type="text"
                            className="profile-input"
                            value={draft.title}
                            onChange={(e) => setField('title', e.target.value)}
                          />
                        </label>
                        <label className="profile-field">
                          <span className="profile-field-label">{t('profile.email')}</span>
                          <input
                            type="email"
                            className="profile-input"
                            value={draft.email}
                            onChange={(e) => setField('email', e.target.value)}
                            disabled={emailLocked}
                            readOnly={emailLocked}
                            autoComplete="email"
                          />
                          {emailLocked ? (
                            <span className="profile-field-hint">
                              {t('profile.emailHint')}
                            </span>
                          ) : null}
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                {!isEditing ? (
                  <dl className="profile-meta-row">
                    <div className="profile-meta-pair">
                      <dt>{t('profile.region')}</dt>
                      <dd>{profile.location}</dd>
                    </div>
                    <div className="profile-meta-pair">
                      <dt>{t('profile.joined')}</dt>
                      <dd>{profile.joinedLabel}</dd>
                    </div>
                    <div className="profile-meta-pair profile-meta-pair--short">
                      <dt>{t('profile.timezone')}</dt>
                      <dd>{profile.timeZoneLabel}</dd>
                    </div>
                  </dl>
                ) : (
                  <div className="profile-form-row profile-meta-edit">
                    <label className="profile-field">
                      <span className="profile-field-label">{t('profile.region')}</span>
                      <input
                        type="text"
                        className="profile-input"
                        value={draft.location}
                        onChange={(e) => setField('location', e.target.value)}
                      />
                    </label>
                    <label className="profile-field">
                      <span className="profile-field-label">{t('profile.timezone')}</span>
                      <input
                        type="text"
                        className="profile-input"
                        value={draft.timeZoneLabel}
                        onChange={(e) =>
                          setField('timeZoneLabel', e.target.value)
                        }
                      />
                    </label>
                  </div>
                )}
              </article>

              <article className="profile-card profile-card--note">
                <span className="profile-card-tape" aria-hidden />
                <h3 className="profile-section-title">{t('profile.aboutTitle')}</h3>
                {!isEditing ? (
                  <p className="profile-bio">{profile.bio}</p>
                ) : (
                  <div className="profile-form-stack">
                    <label className="profile-field">
                      <span className="profile-field-label">{t('profile.aboutField')}</span>
                      <textarea
                        className="profile-textarea"
                        rows={5}
                        value={draft.bio}
                        onChange={(e) => setField('bio', e.target.value)}
                      />
                    </label>
                  </div>
                )}
              </article>

              <section
                className="profile-card profile-card--stats profile-stats"
                aria-label={t('profile.statsAria')}
              >
                <span className="profile-card-tape" aria-hidden />
                <h3 className="profile-section-title profile-section-title--flush">
                  {t('profile.statsTitle')}
                </h3>
                <ul className="profile-stat-grid">
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {profile.streakDays}
                    </span>
                    <span className="profile-stat-label">{t('profile.streak')}</span>
                  </li>
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {profile.totalXp.toLocaleString(
                        i18n.language === 'ja' ? 'ja-JP' : 'vi-VN',
                      )}
                    </span>
                    <span className="profile-stat-label">{t('profile.xp')}</span>
                  </li>
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {profile.weeklyStudyMin}
                    </span>
                    <span className="profile-stat-label">{t('profile.weeklyMin')}</span>
                  </li>
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value profile-stat-value--sm">
                      {profile.levelLabel}
                    </span>
                    <span className="profile-stat-label">{t('profile.level')}</span>
                  </li>
                </ul>
              </section>

              <div className="profile-split">
                <article className="profile-card profile-card--goal">
                  <span className="profile-card-tape" aria-hidden />
                  <h3 className="profile-section-title">{t('profile.goalTitle')}</h3>
                  {!isEditing ? (
                    <>
                      <p className="profile-goal-target">{goalTargetDisplay}</p>
                      {goalDateDisplay ? (
                        <p className="profile-goal-date">{goalDateDisplay}</p>
                      ) : null}
                    </>
                  ) : (
                    <div className="profile-form-stack profile-goal-edit">
                      <div className="profile-goal-row">
                        <label className="profile-field">
                          <span className="profile-field-label">
                            {t('profile.goalExamType')}
                          </span>
                          <select
                            className="profile-input profile-select"
                            value={draft.examTypeKey || 'jlpt'}
                            onChange={(e) => onExamTypeChange(e.target.value)}
                          >
                            {EXAM_TYPE_ORDER.map((id) => (
                              <option key={id} value={id}>
                                {t(`profile.examTypes.${id}`)}
                              </option>
                            ))}
                          </select>
                        </label>
                        {draft.examTypeKey && draft.examTypeKey !== 'other' ? (
                          <label className="profile-field">
                            <span className="profile-field-label">
                              {t('profile.goalExamLevel')}
                            </span>
                            <select
                              className="profile-input profile-select"
                              value={draft.examLevelKey || defaultLevelForType(draft.examTypeKey)}
                              onChange={(e) =>
                                setField('examLevelKey', e.target.value)
                              }
                            >
                              {(EXAM_LEVEL_KEYS_BY_TYPE[draft.examTypeKey] || []).map(
                                (id) => (
                                  <option key={id} value={id}>
                                    {t(
                                      `profile.examLevels.${draft.examTypeKey}.${id}`,
                                    )}
                                  </option>
                                ),
                              )}
                            </select>
                          </label>
                        ) : null}
                      </div>
                      {draft.examTypeKey === 'other' ? (
                        <label className="profile-field">
                          <span className="profile-field-label">
                            {t('profile.goalOtherDetail')}
                          </span>
                          <input
                            type="text"
                            className="profile-input"
                            value={draft.examOtherNote}
                            onChange={(e) =>
                              setField('examOtherNote', e.target.value)
                            }
                            placeholder={t('profile.goalOtherPlaceholder')}
                          />
                        </label>
                      ) : null}
                      <label className="profile-field">
                        <span className="profile-field-label">
                          {t('profile.goalExamDate')}
                        </span>
                        <DateField
                          id="profile-goal-exam-date"
                          value={draft.examDateIso || ''}
                          onChange={(iso) => setField('examDateIso', iso)}
                          min="2000-01-01"
                          max="2040-12-31"
                          className="profile-goal-date-field"
                        />
                      </label>
                    </div>
                  )}
                </article>

                <article className="profile-card profile-card--tags">
                  <span className="profile-card-tape profile-card-tape" aria-hidden />
                  <h3 className="profile-section-title">{t('profile.focusTitle')}</h3>
                  <ul className="profile-tag-list">
                    {profile.focusAreas.map((f) => (
                      <li key={f.label} className="profile-tag">
                        <span className="profile-tag-text">{f.label}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <section
                className="profile-card profile-card--badges profile-badges-block"
                aria-label={t('profile.badgesAria')}
              >
                <span className="profile-card-tape profile-card-tape" aria-hidden />
                <h3 className="profile-section-title">{t('profile.badgesTitle')}</h3>
                <ul className="profile-badge-row">
                  {profile.badges.map((b) => (
                    <li key={b.id} className="profile-badge-pill">
                      <span className="profile-badge-emoji" aria-hidden>
                        {b.emoji}
                      </span>
                      <span className="profile-badge-text">{b.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
    </Layout>
  );
};

export default Profile;
