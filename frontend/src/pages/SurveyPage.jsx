import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import AuthLayout from "../components/auth/AuthLayout.jsx";
import { useSurveyCompletion } from "../context/SurveyCompletionContext.jsx";
import { submitUserSurvey } from "../services/surveyUserService.js";
import { getAxiosErrorMessage } from "../utils/apiErrorMessage.js";
import "./SurveyPage.css";

const LEVEL_OPTIONS = ["begin", "n5", "n4", "n3", "n2up"];
const GOAL_OPTIONS = ["jlpt", "travel", "work", "school", "hobby"];
const DAILY_OPTIONS = [
  { v: "lt15", i18nKey: "lt15" },
  { v: "15-30", i18nKey: "m1530" },
  { v: "30-60", i18nKey: "m3060" },
  { v: "gt60", i18nKey: "gt60" },
];
const WEAK_IDS = ["grammar", "vocab", "kanji", "listen", "read"];
const DISCOVERY_OPTIONS = ["friend", "sns", "search", "other"];

const STEP_COUNT = 6;

const SurveyPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refresh } = useSurveyCompletion();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [dailyTime, setDailyTime] = useState("");
  const [weakAreas, setWeakAreas] = useState([]);
  const [discovery, setDiscovery] = useState("");
  const [discoveryNote, setDiscoveryNote] = useState("");
  const [freeNote, setFreeNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canGoNext = useMemo(() => {
    switch (step) {
      case 0:
        return Boolean(level);
      case 1:
        return Boolean(goal);
      case 2:
        return Boolean(dailyTime);
      case 3:
        return weakAreas.length > 0;
      case 4:
        return Boolean(discovery);
      default:
        return true;
    }
  }, [step, level, goal, dailyTime, weakAreas, discovery]);

  const toggleWeak = (id) => {
    setWeakAreas((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const goNext = () => {
    if (!canGoNext) return;
    setStep((s) => Math.min(STEP_COUNT - 1, s + 1));
  };

  const goBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitUserSurvey({
        level,
        goal,
        dailyTime,
        weakAreas,
        discovery: discovery || undefined,
        discoveryNote:
          discovery === "other" ? discoveryNote.trim() : undefined,
        freeNote: freeNote.trim() || undefined,
      });
      await refresh();
      setSubmitted(true);
      toast.success(t("survey.successToast"));
    } catch (err) {
      const msg = getAxiosErrorMessage(err);
      toast.error(t("survey.errors.submitFailed"), { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isLastStep = step === STEP_COUNT - 1;

  if (submitted) {
    return (
      <AuthLayout formLayout="survey">
        <div className="auth-form-section survey-done">
          <div className="form-title-wrap form-title-wrap--center survey-done-title">
            <p className="survey-done-heading">{t("survey.doneHeading")}</p>
            <p className="survey-done-note auth-caption-sm">
              {t("survey.doneNote")}
            </p>
          </div>
          <p className="survey-done-next">{t("survey.doneNext")}</p>
          <div className="survey-done-actions">
            <button
              type="button"
              className="btn-primary btn-login btn-primary--stack survey-done-link"
              onClick={() => navigate("/", { replace: true })}
            >
              <span className="btn-primary-line1">
                <span className="btn-primary-main">{t("survey.homeCta")}</span>
                <span className="btn-arrow">→</span>
              </span>
            </button>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout formLayout="survey">
      <div className="auth-form-section survey-page">
        <div className="form-title-wrap form-title-wrap--center">
          <h2 className="form-title-main survey-main-title">
            {t("survey.title")}
          </h2>
          <p className="survey-lead auth-caption-sm">{t("survey.lead")}</p>
        </div>

        <div className="survey-wizard-head" aria-live="polite">
          <p className="survey-step-label auth-caption-sm">
            {t("survey.stepProgress", { current: step + 1, total: STEP_COUNT })}
          </p>
          <div
            className="survey-progress"
            role="progressbar"
            aria-valuenow={step + 1}
            aria-valuemin={1}
            aria-valuemax={STEP_COUNT}
            aria-label={t("survey.stepProgress", {
              current: step + 1,
              total: STEP_COUNT,
            })}
          >
            {Array.from({ length: STEP_COUNT }, (_, i) => (
              <span
                key={i}
                className={`survey-progress-seg${i <= step ? " survey-progress-seg--fill" : ""}${i === step ? " survey-progress-seg--current" : ""}`}
              />
            ))}
          </div>
        </div>

        <form
          className="auth-form survey-form survey-form--wizard"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="survey-step-panel">
            {step === 0 && (
              <fieldset className="survey-fieldset">
                <legend className="survey-legend">
                  <span className="auth-label-text">
                    {t("survey.legendLevel")}
                  </span>
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
            )}

            {step === 1 && (
              <fieldset className="survey-fieldset">
                <legend className="survey-legend">
                  <span className="auth-label-text">
                    {t("survey.legendGoal")}
                  </span>
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
            )}

            {step === 2 && (
              <fieldset className="survey-fieldset">
                <legend className="survey-legend">
                  <span className="auth-label-text">
                    {t("survey.legendDaily")}
                  </span>
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
            )}

            {step === 3 && (
              <fieldset className="survey-fieldset">
                <legend className="survey-legend">
                  <span className="auth-label-text">
                    {t("survey.legendWeak")}
                  </span>
                </legend>
                <div className="survey-check-grid">
                  {WEAK_IDS.map((id) => (
                    <label key={id} className="survey-check">
                      <input
                        type="checkbox"
                        checked={weakAreas.includes(id)}
                        onChange={() => toggleWeak(id)}
                      />
                      <span className="auth-label-text">
                        {t(`survey.weak.${id}`)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 4 && (
              <fieldset className="survey-fieldset">
                <legend className="survey-legend">
                  <span className="auth-label-text">
                    {t("survey.legendDiscovery")}
                  </span>
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
                {discovery === "other" && (
                  <div className="survey-note-field">
                    <label className="field-label" htmlFor="discovery-note">
                      <span className="auth-label-text">
                        {t("survey.discoveryNote")}
                      </span>
                    </label>
                    <textarea
                      id="discovery-note"
                      className="sketch-input survey-textarea"
                      rows={2}
                      placeholder={t("survey.discoveryNotePh")}
                      value={discoveryNote}
                      onChange={(e) => setDiscoveryNote(e.target.value)}
                    />
                  </div>
                )}
              </fieldset>
            )}

            {step === 5 && (
              <div className="field-group survey-note-field survey-fieldset-like">
                <label
                  className="field-label survey-legend-like"
                  htmlFor="free-note"
                >
                  <span className="auth-label-text">
                    {t("survey.freeNote")}
                  </span>
                </label>
                <textarea
                  id="free-note"
                  className="sketch-input survey-textarea"
                  rows={4}
                  placeholder={t("survey.freeNotePh")}
                  value={freeNote}
                  onChange={(e) => setFreeNote(e.target.value)}
                />
                <p className="survey-privacy auth-caption-sm">
                  {t("survey.privacy")}
                </p>
              </div>
            )}
          </div>

          <div className="survey-nav">
            <button
              type="button"
              className="survey-nav-btn survey-nav-btn--ghost"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
            >
              {t("survey.back")}
            </button>
            {!isLastStep ? (
              <button
                type="button"
                className="btn-primary btn-login btn-primary--stack survey-nav-next"
                disabled={!canGoNext || isSubmitting}
                onClick={goNext}
              >
                <span className="btn-primary-line1">
                  <span className="btn-primary-main">{t("survey.next")}</span>
                  <span className="btn-arrow">→</span>
                </span>
              </button>
            ) : (
              <button
                type="submit"
                className="btn-primary btn-login btn-primary--stack survey-nav-next survey-submit"
                disabled={isSubmitting}
              >
                <span className="btn-primary-line1">
                  <span className="btn-primary-main">
                    {isSubmitting ? "..." : t("survey.submit")}
                  </span>
                  {!isSubmitting ? <span className="btn-arrow">→</span> : null}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SurveyPage;
