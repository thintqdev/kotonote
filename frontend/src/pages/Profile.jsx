import {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import * as authService from '../services/authService.js';
import {
  buildProfileSliceFromUser,
  stripServerSyncedProfileOverrides,
} from '../utils/mapUserProfile.js';
import Layout from '../layouts/Layout.jsx';
import { Breadcrumb, DateField } from '../components/common';
import {
  mockStreak,
  buildDemoProfile,
} from '../data/dashboardHomeMock.js';
import i18n from '../i18n.js';
import { getApiErrorMessage } from '../utils/apiErrorMessage.js';
import { EXAM_TYPE_ORDER, EXAM_LEVEL_KEYS_BY_TYPE, defaultLevelForType } from '../constants/profileExamGoals.js';
import {
  buildExamTargetDisplay,
  formatExamDateLong,
  resolveGoalExamFields,
} from '../utils/profileExamDisplay.js';
import './Profile.css';
import { loadOverrides, persistOverrides } from '../utils/profileStorage.js';
import { getMyLearningSummary } from '../services/learningSummaryService.js';
import {
  getMyFocusAreas,
  updateMyFocusAreas,
} from '../services/focusAreaService.js';
import {
  FOCUS_AREA_KEYS,
  FOCUS_AREA_MAX,
  FOCUS_AREA_ROUTES,
} from '../constants/profileFocusAreas.js';
import {
  PROFILE_REGION_KEYS,
  PROFILE_TIMEZONES,
  DEFAULT_TIMEZONE_BY_REGION,
  normalizeProfileRegionKey,
  normalizeProfileTimeZoneKey,
  profileRegionLabel,
  profileTimeZoneLabel,
} from '../constants/profileLocale.js';

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

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

function formatExamStatValue(exam, t) {
  if (!exam?.hasGoal || exam.daysUntilExam == null) return null;
  const d = exam.daysUntilExam;
  if (d === 0) return t('profile.examToday');
  if (d > 0) return t('profile.examDaysLeft', { n: d });
  return t('profile.examDaysPast', { n: Math.abs(d) });
}

function libraryContentTotal(library) {
  if (!library) return 0;
  return (
    (library.vocabularyDecksActive ?? 0) +
    (library.kanjiDecksActive ?? 0) +
    (library.grammarLessonsPublished ?? 0)
  );
}

function buildDraftFromProfile(p) {
  const g = resolveGoalExamFields(p);
  return {
    displayName: p.displayName,
    readingName: p.readingName ?? '',
    title: p.title ?? '',
    email: p.email,
    location: normalizeProfileRegionKey(p.location) || 'vn',
    timeZoneLabel:
      normalizeProfileTimeZoneKey(p.timeZoneLabel, p.location) || 'gmt+7',
    bio: p.bio ?? '',
    examTypeKey: g.examTypeKey,
    examLevelKey: g.examLevelKey,
    examDateIso: g.examDateIso,
    examOtherNote: g.examOtherNote,
    examTarget: p.examTarget ?? '',
    examDateLabel: p.examDateLabel ?? '',
    avatarDataUrl: p.avatarDataUrl || null,
    focusAreaKeys: Array.isArray(p.focusAreaKeys) ? [...p.focusAreaKeys] : [],
  };
}

const Profile = () => {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { user, setUser, refreshUser } = useAuth();
  const [overrides, setOverrides] = useState(loadOverrides);
  const [badgeHighlightKey, setBadgeHighlightKey] = useState('');
  const [learningSummary, setLearningSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [focusData, setFocusData] = useState(null);
  const [focusLoading, setFocusLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [avatarRemoved, setAvatarRemoved] = useState(false);
  const [hasPendingAvatar, setHasPendingAvatar] = useState(false);
  const [draft, setDraft] = useState(() =>
    buildDraftFromProfile(buildDemoProfile((key) => i18n.t(key))),
  );
  const avatarInputRef = useRef(null);
  const pendingAvatarFileRef = useRef(null);
  const pendingBlobUrlRef = useRef(null);

  const demoProfile = useMemo(() => buildDemoProfile(t), [t, i18n.language]);

  const profile = useMemo(() => {
    const localOnly = stripServerSyncedProfileOverrides(overrides);
    const serverSlice = buildProfileSliceFromUser(
      user,
      demoProfile,
      t,
      i18n.language,
    );
    return { ...demoProfile, ...localOnly, ...serverSlice };
  }, [demoProfile, overrides, user, t, i18n.language]);

  const focusAreas = useMemo(() => {
    if (user && focusData?.selectedKeys) {
      return focusData.selectedKeys.map((key) => ({
        key,
        label: t(`profile.focusOptions.${key}`),
        route:
          focusData.options?.find((o) => o.key === key)?.route ||
          FOCUS_AREA_ROUTES[key] ||
          '/',
      }));
    }
    if (!user) {
      return (demoProfile.focusAreas ?? []).map((f, i) => ({
        key: FOCUS_AREA_KEYS[i] || `demo-${i}`,
        label: f.label,
        route: FOCUS_AREA_ROUTES[FOCUS_AREA_KEYS[i]] || '/',
      }));
    }
    return [];
  }, [user, focusData, demoProfile.focusAreas, t]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(
        buildDraftFromProfile({
          ...profile,
          focusAreaKeys: focusData?.selectedKeys ?? [],
        }),
      );
    }
  }, [isEditing, profile, focusData]);

  useEffect(
    () => () => {
      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
        pendingBlobUrlRef.current = null;
      }
    },
    [],
  );

  const highlightBadgeParam = (
    searchParams.get('highlightBadge') || ''
  ).trim().toLowerCase();

  const refreshLearningSummary = useCallback(async () => {
    if (!user) return;
    setSummaryLoading(true);
    try {
      const summary = await getMyLearningSummary();
      setLearningSummary(summary);
    } catch {
      setLearningSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setLearningSummary(null);
      setSummaryLoading(false);
      return;
    }
    void refreshLearningSummary();
  }, [user, refreshLearningSummary]);

  const refreshFocusAreas = useCallback(async () => {
    if (!user) return;
    setFocusLoading(true);
    try {
      const focus = await getMyFocusAreas();
      setFocusData(focus);
    } catch {
      setFocusData(null);
    } finally {
      setFocusLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setFocusData(null);
      setFocusLoading(false);
      return;
    }
    void refreshFocusAreas();
  }, [user, refreshFocusAreas]);

  const toggleFocusAreaKey = useCallback((key) => {
    setDraft((prev) => {
      const set = new Set(prev.focusAreaKeys);
      if (set.has(key)) {
        set.delete(key);
      } else if (set.size >= FOCUS_AREA_MAX) {
        return prev;
      } else {
        set.add(key);
      }
      return { ...prev, focusAreaKeys: [...set] };
    });
  }, []);

  const statsDisplay = useMemo(() => {
    const isJa = i18n.language === 'ja';
    const dash = summaryLoading ? '…' : '—';
    if (!learningSummary && !summaryLoading) {
      return {
        streak: dash,
        streakHint: '',
        weekly: dash,
        badges: dash,
        badgeHint: '',
        fourthValue: dash,
        fourthLabel: t('profile.examCountdown'),
        fourthHint: '',
      };
    }
    const s = learningSummary;
    const streakCurrent = s?.streak?.current ?? 0;
    const streakLongest = s?.streak?.longest ?? 0;
    const weeklyN = s?.streak?.checkedThisWeek ?? 0;
    const badgeCount = s?.badges?.unlockedCount ?? 0;
    const latest = s?.badges?.latest;
    const latestName = latest
      ? (isJa ? latest.nameJa : latest.nameVi) || latest.key
      : '';
    const examVal = formatExamStatValue(s?.exam, t);
    const hasExamGoal = Boolean(s?.exam?.hasGoal && examVal != null);
    const libTotal = libraryContentTotal(s?.library);

    return {
      streak: summaryLoading ? '…' : String(streakCurrent),
      streakHint:
        !summaryLoading && streakLongest > 0
          ? t('profile.streakLongest', { n: streakLongest })
          : '',
      weekly: summaryLoading
        ? '…'
        : t('profile.weeklyCheckInValue', { n: weeklyN }),
      badges: summaryLoading ? '…' : String(badgeCount),
      badgeHint:
        !summaryLoading && latestName
          ? t('profile.badgeLatest', { name: latestName })
          : '',
      fourthValue: summaryLoading
        ? '…'
        : hasExamGoal
          ? examVal
          : t('profile.libraryTotalValue', { n: libTotal }),
      fourthLabel: hasExamGoal
        ? t('profile.examCountdown')
        : t('profile.libraryTotal'),
      fourthHint: '',
    };
  }, [learningSummary, summaryLoading, t, i18n.language]);

  useEffect(() => {
    if (location.pathname !== '/profile') return undefined;
    const hash = location.hash.replace(/^#/, '').toLowerCase();
    const wantsSection = hash === 'badges' || Boolean(highlightBadgeParam);
    if (!wantsSection) return undefined;

    const raf = requestAnimationFrame(() => {
      document
        .getElementById('profile-badges')
        ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });

    if (highlightBadgeParam) setBadgeHighlightKey(highlightBadgeParam);
    const tmr = setTimeout(() => setBadgeHighlightKey(''), 4500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tmr);
    };
  }, [location.pathname, location.hash, highlightBadgeParam]);

  const runTestBadgeUnlock = useCallback(
    async (badgeKey) => {
      setSaveError('');
      try {
        const data = await authService.testUnlockBadge({ badgeKey });
        if (data?.user) setUser(data.user);
        else await refreshUser();
        void refreshLearningSummary();
      } catch (err) {
        setSaveError(getApiErrorMessage(err, t));
      }
    },
    [setUser, refreshUser, refreshLearningSummary, t],
  );

  const emailLocked = Boolean(user?.email);

  const initial = useMemo(() => {
    const nm = String(profile.displayName || '').trim();
    const ch = nm ? [...nm][0] : '?';
    return typeof ch === 'string' ? ch.toUpperCase() : '?';
  }, [profile.displayName]);

  const headerName =
    profile.displayName.split(/\s+/)[0] || profile.displayName;

  const localeDisplay = useMemo(
    () => ({
      region: profileRegionLabel(t, profile.location),
      timeZone: profileTimeZoneLabel(t, profile.timeZoneLabel),
    }),
    [profile.location, profile.timeZoneLabel, t],
  );

  const draftRegionKey = normalizeProfileRegionKey(draft.location);
  const draftTimeZoneOptions = useMemo(
    () =>
      PROFILE_TIMEZONES.filter(
        (tz) => !draftRegionKey || tz.region === draftRegionKey,
      ),
    [draftRegionKey],
  );

  const handleRegionChange = useCallback((e) => {
    const region = e.target.value;
    setDraft((prev) => ({
      ...prev,
      location: region,
      timeZoneLabel:
        DEFAULT_TIMEZONE_BY_REGION[region] || prev.timeZoneLabel,
    }));
  }, []);

  const startEdit = useCallback(() => {
    setSaveError('');
    if (pendingBlobUrlRef.current) {
      URL.revokeObjectURL(pendingBlobUrlRef.current);
      pendingBlobUrlRef.current = null;
    }
    pendingAvatarFileRef.current = null;
    setHasPendingAvatar(false);
    setAvatarRemoved(false);
    setDraft(
      buildDraftFromProfile({
        ...profile,
        focusAreaKeys: focusData?.selectedKeys ?? [],
      }),
    );
    setIsEditing(true);
  }, [profile, focusData]);

  const cancelEdit = useCallback(() => {
    if (pendingBlobUrlRef.current) {
      URL.revokeObjectURL(pendingBlobUrlRef.current);
      pendingBlobUrlRef.current = null;
    }
    pendingAvatarFileRef.current = null;
    setHasPendingAvatar(false);
    setAvatarRemoved(false);
    setIsEditing(false);
    setSaveError('');
    setDraft(buildDraftFromProfile(profile));
  }, [profile]);

  const saveEdit = useCallback(async () => {
    const name = draft.displayName.trim();
    if (name.length < 2) {
      setSaveError(t('profile.nameTooShort'));
      return;
    }

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

    setSaveError('');
    setIsSaving(true);
    try {
      if (pendingAvatarFileRef.current) {
        const { user: afterAvatar } = await authService.uploadMyAvatar(
          pendingAvatarFileRef.current,
        );
        pendingAvatarFileRef.current = null;
        if (pendingBlobUrlRef.current) {
          URL.revokeObjectURL(pendingBlobUrlRef.current);
          pendingBlobUrlRef.current = null;
        }
        setHasPendingAvatar(false);
        setUser(afterAvatar);
      }

      const putBody = {
        name,
        profile: {
          readingName: draft.readingName.trim(),
          title: draft.title.trim(),
          location:
            normalizeProfileRegionKey(draft.location) || 'vn',
          timeZoneLabel:
            normalizeProfileTimeZoneKey(
              draft.timeZoneLabel,
              draft.location,
            ) || DEFAULT_TIMEZONE_BY_REGION.vn,
          bio: draft.bio.trim(),
          examTypeKey: typeKey,
          examLevelKey: levelKey,
          examDateIso: dateIso,
          examOtherNote: otherNote,
        },
      };
      if (avatarRemoved) {
        putBody.avatar = null;
      }

      const { user: nextUser } = await authService.updateCurrentUser(putBody);
      setUser(nextUser);
      await updateMyFocusAreas(draft.focusAreaKeys);
      void refreshFocusAreas();
      const cleaned = stripServerSyncedProfileOverrides(overrides);
      persistOverrides(cleaned);
      setOverrides(cleaned);
      setAvatarRemoved(false);
      setIsEditing(false);
      void refreshLearningSummary();
    } catch (err) {
      setSaveError(getApiErrorMessage(err, t));
    } finally {
      setIsSaving(false);
    }
  }, [
    draft,
    overrides,
    setUser,
    t,
    avatarRemoved,
    refreshLearningSummary,
    refreshFocusAreas,
  ]);

  const onAvatarFile = useCallback(
    (e) => {
      const file = e.target.files?.[0];
      if (!file || !file.type.startsWith('image/')) return;
      if (file.size > MAX_AVATAR_BYTES) {
        setSaveError(t('profile.avatarTooLarge'));
        return;
      }
      setSaveError('');
      setAvatarRemoved(false);
      if (pendingBlobUrlRef.current) {
        URL.revokeObjectURL(pendingBlobUrlRef.current);
        pendingBlobUrlRef.current = null;
      }
      pendingAvatarFileRef.current = file;
      const url = URL.createObjectURL(file);
      pendingBlobUrlRef.current = url;
      setHasPendingAvatar(true);
      setDraft((d) => ({ ...d, avatarDataUrl: url }));
      e.target.value = '';
    },
    [t],
  );

  const clearAvatar = useCallback(() => {
    if (pendingBlobUrlRef.current) {
      URL.revokeObjectURL(pendingBlobUrlRef.current);
      pendingBlobUrlRef.current = null;
    }
    pendingAvatarFileRef.current = null;
    setHasPendingAvatar(false);
    setAvatarRemoved(true);
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
                  {saveError ? (
                    <p className="profile-save-error" role="alert">
                      {saveError}
                    </p>
                  ) : null}
                  <button
                    type="button"
                    className="profile-btn profile-btn--ghost"
                    onClick={cancelEdit}
                    disabled={isSaving}
                  >
                    {t('profile.cancel')}
                  </button>
                  <button
                    type="button"
                    className="profile-btn profile-btn--save"
                    onClick={saveEdit}
                    disabled={isSaving}
                  >
                    {isSaving ? t('profile.saving') : t('profile.save')}
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
                          disabled={
                            !draft.avatarDataUrl &&
                            !user?.avatar &&
                            !hasPendingAvatar
                          }
                          aria-disabled={
                            !draft.avatarDataUrl &&
                            !user?.avatar &&
                            !hasPendingAvatar
                          }
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
                      <dd>{localeDisplay.region}</dd>
                    </div>
                    <div className="profile-meta-pair">
                      <dt>{t('profile.joined')}</dt>
                      <dd>{profile.joinedLabel}</dd>
                    </div>
                    <div className="profile-meta-pair profile-meta-pair--short">
                      <dt>{t('profile.timezone')}</dt>
                      <dd>{localeDisplay.timeZone}</dd>
                    </div>
                  </dl>
                ) : (
                  <div className="profile-form-row profile-meta-edit">
                    <label className="profile-field">
                      <span className="profile-field-label">{t('profile.region')}</span>
                      <select
                        className="profile-input profile-select"
                        value={draftRegionKey}
                        onChange={handleRegionChange}
                      >
                        <option value="">{t('profile.regionPlaceholder')}</option>
                        {PROFILE_REGION_KEYS.map((key) => (
                          <option key={key} value={key}>
                            {t(`profile.regions.${key}`)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="profile-field">
                      <span className="profile-field-label">{t('profile.timezone')}</span>
                      <select
                        className="profile-input profile-select"
                        value={normalizeProfileTimeZoneKey(
                          draft.timeZoneLabel,
                          draft.location,
                        )}
                        onChange={(e) =>
                          setField('timeZoneLabel', e.target.value)
                        }
                        disabled={!draftRegionKey}
                      >
                        <option value="">{t('profile.timezonePlaceholder')}</option>
                        {draftTimeZoneOptions.map((tz) => (
                          <option key={tz.key} value={tz.key}>
                            {t(`profile.timezones.${tz.key}`)}
                          </option>
                        ))}
                      </select>
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
                <ul
                  className={`profile-stat-grid${summaryLoading ? ' profile-stat-grid--loading' : ''}`}
                  aria-busy={summaryLoading}
                >
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {statsDisplay.streak}
                    </span>
                    <span className="profile-stat-label">{t('profile.streak')}</span>
                    {statsDisplay.streakHint ? (
                      <span className="profile-stat-hint">
                        {statsDisplay.streakHint}
                      </span>
                    ) : null}
                  </li>
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {statsDisplay.weekly}
                    </span>
                    <span className="profile-stat-label">
                      {t('profile.weeklyCheckIn')}
                    </span>
                  </li>
                  <li className="profile-stat-chip">
                    <span className="profile-stat-value">
                      {statsDisplay.badges}
                    </span>
                    <span className="profile-stat-label">
                      {t('profile.badgesUnlocked')}
                    </span>
                    {statsDisplay.badgeHint ? (
                      <span className="profile-stat-hint profile-stat-hint--truncate">
                        {statsDisplay.badgeHint}
                      </span>
                    ) : null}
                  </li>
                  <li className="profile-stat-chip">
                    <span
                      className={`profile-stat-value${statsDisplay.fourthValue.length > 6 ? ' profile-stat-value--sm' : ''}`}
                    >
                      {statsDisplay.fourthValue}
                    </span>
                    <span className="profile-stat-label">
                      {statsDisplay.fourthLabel}
                    </span>
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

                <article
                  className="profile-card profile-card--tags"
                  aria-labelledby="profile-focus-title"
                >
                  <span className="profile-card-tape profile-card-tape" aria-hidden />
                  <h3
                    id="profile-focus-title"
                    className="profile-section-title"
                  >
                    {t('profile.focusTitle')}
                  </h3>
                  {isEditing ? (
                    <>
                      <p className="profile-focus-hint">
                        {t('profile.focusHint', { max: FOCUS_AREA_MAX })}
                      </p>
                      <ul
                        className="profile-focus-picker"
                        role="group"
                        aria-label={t('profile.focusTitle')}
                      >
                        {FOCUS_AREA_KEYS.map((key) => {
                          const selected = draft.focusAreaKeys.includes(key);
                          const atMax =
                            draft.focusAreaKeys.length >= FOCUS_AREA_MAX &&
                            !selected;
                          return (
                            <li key={key}>
                              <button
                                type="button"
                                className={`profile-focus-chip${selected ? ' is-selected' : ''}`}
                                aria-pressed={selected}
                                disabled={atMax}
                                title={
                                  atMax
                                    ? t('profile.focusMaxReached', {
                                        max: FOCUS_AREA_MAX,
                                      })
                                    : undefined
                                }
                                onClick={() => toggleFocusAreaKey(key)}
                              >
                                {t(`profile.focusOptions.${key}`)}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    </>
                  ) : focusLoading && user ? (
                    <p className="profile-focus-empty" aria-busy="true">
                      {t('profile.statsLoading')}
                    </p>
                  ) : focusAreas.length === 0 ? (
                    <p className="profile-focus-empty">{t('profile.focusEmpty')}</p>
                  ) : (
                    <ul className="profile-tag-list">
                      {focusAreas.map((f) => (
                        <li key={f.key}>
                          <Link
                            to={f.route}
                            className="profile-tag profile-tag--link"
                          >
                            <span className="profile-tag-text">{f.label}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </div>

              <section
                id="profile-badges"
                className="profile-card profile-card--badges profile-badges-block"
                aria-label={t('profile.badgesAria')}
              >
                <span className="profile-card-tape profile-card-tape" aria-hidden />
                <h3 className="profile-section-title">{t('profile.badgesTitle')}</h3>
                {import.meta.env.DEV ? (
                  <div className="profile-dev-badge-row">
                    <button
                      type="button"
                      className="profile-dev-badge-btn"
                      onClick={() => void runTestBadgeUnlock('streak_7')}
                    >
                      {t('profile.badgesDevTest')}
                    </button>
                  </div>
                ) : null}
                {profile.badges.length === 0 ? (
                  <p className="profile-badges-empty">{t('profile.badgesEmpty')}</p>
                ) : (
                  <ul className="profile-badge-row">
                    {profile.badges.map((b) => {
                      const keyNorm = String(b.badgeKey || b.id || '')
                        .trim()
                        .toLowerCase();
                      const isHi =
                        badgeHighlightKey &&
                        keyNorm &&
                        keyNorm === badgeHighlightKey;
                      return (
                        <li key={b.id}>
                          <div
                            className={`profile-badge-pill${
                              isHi ? ' profile-badge-pill--highlight' : ''
                            }`}
                          >
                            {b.iconUrl ? (
                              <img
                                className="profile-badge-icon"
                                src={b.iconUrl}
                                alt=""
                                width={22}
                                height={22}
                              />
                            ) : (
                              <span className="profile-badge-emoji" aria-hidden>
                                {b.emoji}
                              </span>
                            )}
                            <span className="profile-badge-text">{b.label}</span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </section>
            </div>
    </Layout>
  );
};

export default Profile;
