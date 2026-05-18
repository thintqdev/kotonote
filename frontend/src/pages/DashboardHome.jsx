import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth.jsx";
import { useMergedProfile } from "../hooks/useMergedProfile.js";
import { useRandomQuoteLine } from "../hooks/useRandomQuoteLine.js";
import {
  useDashboardHome,
  buildMockDashboardHomePayload,
} from "../hooks/useDashboardHome.js";
import Layout from "../layouts/Layout.jsx";
import { Breadcrumb } from "../components/common";
import WelcomeBanner from "../components/dashboard/WelcomeBanner.jsx";
import GoalCard from "../components/dashboard/GoalCard.jsx";
import SubjectGrid from "../components/dashboard/SubjectGrid.jsx";
import DailyProgressCard from "../components/dashboard/DailyProgressCard.jsx";
import DailyNoteCard from "../components/dashboard/DailyNoteCard.jsx";
import { buildDemoProfile } from "../data/dashboardHomeMock.js";
import {
  formatExamDateLong,
  resolveGoalExamFields,
} from "../utils/profileExamDisplay.js";
import { calendarDaysFromToday } from "../utils/dateIso.js";
import { NAV_MENU_ICON_BY_ID } from "../constants/dashboardNav.js";
import "./DashboardHome.css";

const DashboardHome = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const profile = useMergedProfile();
  const {
    data: homeData,
    loading: homeLoading,
    error: homeError,
  } = useDashboardHome(Boolean(user));

  const displayName =
    (user?.name && String(user.name).trim().split(/\s+/)[0]) ||
    profile?.displayName?.trim()?.split(/\s+/)[0] ||
    user?.email?.split("@")[0] ||
    t("demoProfile.firstName");

  const goalResolved = useMemo(() => resolveGoalExamFields(profile), [profile]);

  const examShort = useMemo(() => {
    if (goalResolved.examTypeKey === "other") {
      const note = String(goalResolved.examOtherNote || "").trim();
      return note || t("profile.examTypes.other");
    }
    return t(`profile.examTypes.${goalResolved.examTypeKey}`);
  }, [goalResolved, t]);

  const levelBadge = useMemo(() => {
    if (goalResolved.examTypeKey === "other") {
      const note = String(goalResolved.examOtherNote || "").trim();
      if (!note) return "—";
      return note.length > 12 ? `${note.slice(0, 12)}…` : note;
    }
    return t(
      `profile.examLevels.${goalResolved.examTypeKey}.${goalResolved.examLevelKey}`,
    );
  }, [goalResolved, t]);

  const demoExamIso = useMemo(() => buildDemoProfile(t).examDateIso, [t]);
  const userExamIso = goalResolved.examDateIso;
  const hasUserExamIso =
    typeof userExamIso === "string" && /^\d{4}-\d{2}-\d{2}$/.test(userExamIso);

  const isoForCountdown = hasUserExamIso ? userExamIso : demoExamIso;

  const examDateText = useMemo(() => {
    if (hasUserExamIso) {
      return formatExamDateLong(userExamIso, i18n.language);
    }
    const legacy = profile.examDateLabel?.trim();
    if (legacy) return legacy;
    return formatExamDateLong(isoForCountdown, i18n.language);
  }, [
    hasUserExamIso,
    userExamIso,
    profile.examDateLabel,
    i18n.language,
    isoForCountdown,
  ]);

  const dayDelta = useMemo(
    () => calendarDaysFromToday(isoForCountdown),
    [isoForCountdown],
  );

  const homePayload = useMemo(() => {
    if (homeData) return homeData;
    if (!homeLoading && homeError) return buildMockDashboardHomePayload();
    if (!user && !homeLoading) return buildMockDashboardHomePayload();
    return null;
  }, [homeData, homeLoading, homeError, user]);

  const streakDays = homePayload?.streak?.days ?? 0;

  const subjects = useMemo(() => {
    const rows = homePayload?.subjects;
    if (!rows?.length) return [];
    return rows.map((s) => ({
      id: s.id,
      label: t(`subjects.${s.id}.label`),
      countLabel: t(`subjects.${s.id}.count`, { count: s.totalCount ?? 0 }),
      iconSrc: NAV_MENU_ICON_BY_ID[s.id] || NAV_MENU_ICON_BY_ID.grammar,
      progress: s.progress ?? 0,
      tint: s.tint,
      variant: s.variant,
      route: s.route,
    }));
  }, [homePayload, t]);

  const todayTasks = useMemo(() => {
    const rows = homePayload?.today?.tasks;
    if (!rows?.length) return [];
    return rows.map((task) => ({
      label: t(`subjects.${task.subjectId}.label`),
      detail:
        typeof task.target === "number" && typeof task.completed === "number"
          ? t(`today.tasks.${task.detailKey}`, {
              current: task.completed,
              target: task.target,
            })
          : t(`today.tasks.${task.detailKey}`),
    }));
  }, [homePayload, t]);

  const todayPercent = homePayload?.today?.percent ?? 0;

  const dailyNoteQuote = useRandomQuoteLine({
    fallbackI18nKey: "dashboard.quotes.note",
  });

  const showHomeSkeleton = Boolean(user) && homeLoading && !homePayload;

  return (
    <Layout
      userName={displayName}
      streakDays={streakDays}
      mainInnerClassName="dash-pin-board"
    >
      <Breadcrumb
        items={[{ label: t("breadcrumb.home"), to: "/", end: true }]}
      />

      {showHomeSkeleton ? (
        <p className="dash-home-loading" aria-live="polite">
          {t("common.loading")}
        </p>
      ) : null}

      <div className="dash-home" hidden={showHomeSkeleton}>
        <div className="dash-row-top">
          <div className="dash-float dash-float--tilt-a">
            <WelcomeBanner userName={displayName} />
          </div>
          <div className="dash-float dash-float--tilt-b">
            <GoalCard
              examShort={examShort}
              levelBadge={levelBadge}
              examDateText={examDateText}
              dayDelta={dayDelta}
            />
          </div>
        </div>

        {subjects.length > 0 ? (
          <div className="dash-float dash-float--section">
            <SubjectGrid subjects={subjects} pinnedCards />
          </div>
        ) : null}

        <div className="dash-daily">
          <div className="dash-daily-title-row">
            <div className="dash-daily-progress-title-wrap">
              <h2
                id="dash-daily-progress-title"
                className="dash-daily-section-title"
              >
                {t("today.title")}
              </h2>
              <Link className="dash-daily-goals-link" to="/settings">
                {t("dashboard.editDailyGoals")}
              </Link>
            </div>
            <div className="dash-daily-note-title-cell">
              <h2
                id="dash-daily-note-title"
                className="dash-daily-section-title"
              >
                {t("dailyNote.title")}
              </h2>
              <div
                id="dash-daily-note-toolbar-mount"
                className="dash-daily-note-toolbar-mount"
              />
            </div>
          </div>

          <div className="dash-daily-card-row">
            <div className="dash-daily-col dash-float dash-float--tilt-c">
              <DailyProgressCard
                showTitle={false}
                titleId="dash-daily-progress-title"
                percent={todayPercent}
                tasks={todayTasks}
              />
            </div>
            <div className="dash-daily-col dash-float dash-float--tilt-d">
              <DailyNoteCard
                showTitle={false}
                titleId="dash-daily-note-title"
                toolbarMountId="dash-daily-note-toolbar-mount"
                quote={dailyNoteQuote}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardHome;
