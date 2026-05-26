import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getAdminOverviewStatistics,
  getAdminSurveyStatistics,
} from "../../services/adminSurveyService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminOverviewPage.css";

const DAILY_I18N = {
  lt15: "lt15",
  "15-30": "m1530",
  "30-60": "m3060",
  gt60: "gt60",
};

const CHART_FILLS = [
  "#5d8578",
  "#6d8a6a",
  "#7a9e78",
  "#8ba888",
  "#87a0b8",
  "#c49a6c",
  "#a89ab8",
];

function labelForBucket(kind, key, t) {
  if (kind === "discovery" && key === "unspecified") {
    return t("adminSurvey.unspecified");
  }
  if (kind === "level") return t(`survey.levels.${key}`);
  if (kind === "goal") return t(`survey.goals.${key}`);
  if (kind === "daily") {
    const ik = DAILY_I18N[key] ?? key;
    return t(`survey.daily.${ik}`);
  }
  if (kind === "discovery") return t(`survey.discovery.${key}`);
  if (kind === "weak") return t(`survey.weak.${key}`);
  return key;
}

function buildChartRows(series, kind, t) {
  return series.map((row) => ({
    name: labelForBucket(kind, row.key, t),
    value: row.count ?? 0,
    key: row.key,
  }));
}

function ChartTooltip({ active, payload, countLabel }) {
  if (!active || !payload?.length) return null;
  const p0 = payload[0];
  const row = p0.payload ?? { name: p0.name, value: p0.value };
  const value = row.value ?? p0.value;
  return (
    <div className="admin-survey-tooltip">
      <div className="admin-survey-tooltip-name">{row.name}</div>
      <div className="admin-survey-tooltip-value">
        {countLabel}: <strong>{value}</strong>
      </div>
    </div>
  );
}

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  countLabel: PropTypes.string.isRequired,
};

function SurveyDonutCard({ title, series, kind, innerRadius = "48%" }) {
  const { t } = useTranslation();
  const chartData = useMemo(
    () => buildChartRows(series, kind, t),
    [series, kind, t],
  );
  const countLabel = t("adminSurvey.countLabel");
  const total = chartData.reduce((s, d) => s + d.value, 0) || 1;

  return (
    <section
      className="admin-survey-chart admin-survey-chart--pie"
      aria-label={title}
    >
      <h2 className="admin-survey-chart-title">{title}</h2>
      <div className="admin-survey-chart-viz admin-survey-chart-viz--pie">
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={innerRadius}
              outerRadius="72%"
              paddingAngle={2}
              stroke="rgba(255,252,246,0.95)"
              strokeWidth={2}
              label={({ percent }) =>
                percent >= 0.06 ? `${Math.round(percent * 100)}%` : ""
              }
              labelLine={{ stroke: "rgba(58,54,48,0.25)" }}
              isAnimationActive
              animationDuration={700}
            >
              {chartData.map((row, i) => (
                <Cell
                  key={row.key}
                  fill={CHART_FILLS[i % CHART_FILLS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  countLabel={countLabel}
                />
              )}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              wrapperStyle={{ fontSize: "11px" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <p className="admin-survey-pie-total" aria-hidden>
          {t("adminSurvey.pieFoot", { total })}
        </p>
      </div>
    </section>
  );
}

SurveyDonutCard.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
  kind: PropTypes.oneOf(["level", "discovery"]).isRequired,
  innerRadius: PropTypes.string,
};

function SurveyRadarCard({ title, series }) {
  const { t } = useTranslation();
  const kind = "goal";
  const chartData = useMemo(() => buildChartRows(series, kind, t), [series, t]);
  const countLabel = t("adminSurvey.countLabel");
  const maxVal = Math.max(1, ...chartData.map((d) => d.value));
  const radarData = useMemo(
    () =>
      chartData.map((d, i) => ({
        subject: d.name,
        value: d.value,
        fill: CHART_FILLS[i % CHART_FILLS.length],
      })),
    [chartData],
  );

  return (
    <section
      className="admin-survey-chart admin-survey-chart--radar"
      aria-label={title}
    >
      <h2 className="admin-survey-chart-title">{title}</h2>
      <div className="admin-survey-chart-viz admin-survey-chart-viz--radar">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="52%" outerRadius="68%" data={radarData}>
            <PolarGrid stroke="rgba(90, 107, 56, 0.2)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "rgba(58, 54, 48, 0.82)" }}
            />
            <PolarRadiusAxis
              angle={45}
              domain={[0, maxVal]}
              tick={{ fontSize: 10, fill: "rgba(58, 54, 48, 0.55)" }}
              tickCount={4}
            />
            <Radar
              name={countLabel}
              dataKey="value"
              stroke="#5d8578"
              strokeWidth={2}
              fill="#6d8a6a"
              fillOpacity={0.35}
              isAnimationActive
              animationDuration={650}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const row = payload[0].payload;
                return (
                  <div className="admin-survey-tooltip">
                    <div className="admin-survey-tooltip-name">
                      {row.subject}
                    </div>
                    <div className="admin-survey-tooltip-value">
                      {countLabel}: <strong>{row.value}</strong>
                    </div>
                  </div>
                );
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

SurveyRadarCard.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

function SurveyColumnBarCard({ title, series }) {
  const { t } = useTranslation();
  const kind = "daily";
  const chartData = useMemo(() => buildChartRows(series, kind, t), [series, t]);
  const countLabel = t("adminSurvey.countLabel");

  return (
    <section
      className="admin-survey-chart admin-survey-chart--column admin-survey-chart--wide"
      aria-label={title}
    >
      <h2 className="admin-survey-chart-title">{title}</h2>
      <div className="admin-survey-chart-viz admin-survey-chart-viz--column">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 16, right: 16, left: 4, bottom: 56 }}
            barCategoryGap="18%"
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(90, 107, 56, 0.14)"
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: "rgba(58, 54, 48, 0.78)" }}
              interval={0}
              angle={-22}
              textAnchor="end"
              height={68}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "rgba(58, 54, 48, 0.65)" }}
              axisLine={{ stroke: "rgba(90, 107, 56, 0.22)" }}
              tickLine={false}
            />
            <Tooltip
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  countLabel={countLabel}
                />
              )}
            />
            <Bar
              dataKey="value"
              radius={[10, 10, 0, 0]}
              maxBarSize={56}
              isAnimationActive
              animationDuration={600}
            >
              {chartData.map((row, i) => (
                <Cell
                  key={row.key}
                  fill={CHART_FILLS[i % CHART_FILLS.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="top"
                offset={6}
                style={{
                  fill: "#3a3630",
                  fontSize: 12,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

SurveyColumnBarCard.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
};

function SurveyHorizontalBarCard({ title, series, layout = "full" }) {
  const { t } = useTranslation();
  const kind = "weak";
  const chartData = useMemo(() => buildChartRows(series, kind, t), [series, t]);
  const countLabel = t("adminSurvey.countLabel");
  const height = Math.min(400, Math.max(200, 44 + chartData.length * 36));
  const isSplit = layout === "split";
  const yAxisWidth = isSplit ? 118 : 148;

  return (
    <section
      className={`admin-survey-chart admin-survey-chart--hbar${isSplit ? " admin-survey-chart--split-cell" : " admin-survey-chart--wide"}`}
      aria-label={title}
    >
      <h2 className="admin-survey-chart-title">{title}</h2>
      <div className="admin-survey-chart-viz">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 8, right: 36, left: 4, bottom: 8 }}
            barCategoryGap={10}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              stroke="rgba(90, 107, 56, 0.16)"
              horizontal={false}
            />
            <XAxis
              type="number"
              allowDecimals={false}
              tick={{ fontSize: 11, fill: "rgba(58, 54, 48, 0.65)" }}
              axisLine={{ stroke: "rgba(90, 107, 56, 0.28)" }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={yAxisWidth}
              tick={{
                fontSize: isSplit ? 10 : 11,
                fill: "rgba(58, 54, 48, 0.88)",
              }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <Tooltip
              cursor={{ fill: "rgba(107, 126, 95, 0.08)" }}
              content={({ active, payload }) => (
                <ChartTooltip
                  active={active}
                  payload={payload}
                  countLabel={countLabel}
                />
              )}
            />
            <Bar
              dataKey="value"
              radius={[0, 10, 10, 0]}
              maxBarSize={28}
              isAnimationActive
              animationDuration={550}
              animationEasing="ease-out"
            >
              {chartData.map((row, i) => (
                <Cell
                  key={row.key}
                  fill={CHART_FILLS[i % CHART_FILLS.length]}
                />
              ))}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                style={{
                  fill: "#3a3630",
                  fontSize: 12,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

SurveyHorizontalBarCard.propTypes = {
  title: PropTypes.string.isRequired,
  series: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    }),
  ).isRequired,
  layout: PropTypes.oneOf(["full", "split"]),
};

export default function AdminOverviewPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [surveyData, overviewData] = await Promise.all([
        getAdminSurveyStatistics(),
        getAdminOverviewStatistics(),
      ]);
      setStats(surveyData.stats ?? null);
      setOverview(overviewData.overview ?? null);
    } catch (e) {
      setStats(null);
      setOverview(null);
      setError(getAxiosErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const weakAreaLabel = useCallback(
    (key) => labelForBucket("weak", key, t),
    [t],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="admin-stub-main admin-overview">
      <h1 className="admin-overview-title">{t("adminSurvey.title")}</h1>

      {loading ? (
        <p className="admin-overview-status">{t("adminSurvey.loading")}</p>
      ) : error ? (
        <div className="admin-overview-error">
          <p className="admin-overview-status admin-overview-status--error">
            {t("adminSurvey.error")}{" "}
            <span className="admin-overview-error-detail">{error}</span>
          </p>
          <button
            type="button"
            className="admin-overview-retry"
            onClick={() => void load()}
          >
            {t("adminSurvey.retry")}
          </button>
        </div>
      ) : !stats || (stats.totalSurveys ?? 0) === 0 ? (
        <p className="admin-overview-status">{t("adminSurvey.empty")}</p>
      ) : (
        <>
          <div className="admin-overview-kpi-grid">
            <div className="admin-overview-kpi">
              <span className="admin-overview-kpi-value">
                {stats.totalSurveys}
              </span>
              <span className="admin-overview-kpi-label">
                {t("adminSurvey.kpiLabel")}
              </span>
            </div>
            <div className="admin-overview-kpi admin-overview-kpi--compact">
              <span className="admin-overview-kpi-value">
                {overview?.kpis?.feedbackOpen ?? 0}
              </span>
              <span className="admin-overview-kpi-label">
                {t("adminSurvey.kpis.feedbackOpen")}
              </span>
            </div>
            <div className="admin-overview-kpi admin-overview-kpi--compact">
              <span className="admin-overview-kpi-value">
                {overview?.kpis?.activeUsers ?? 0}
              </span>
              <span className="admin-overview-kpi-label">
                {t("adminSurvey.kpis.activeUsers")}
              </span>
            </div>
            <div className="admin-overview-kpi admin-overview-kpi--compact">
              <span className="admin-overview-kpi-value">
                {overview?.kpis?.conversion7d ?? 0}%
              </span>
              <span className="admin-overview-kpi-label">
                {t("adminSurvey.kpis.checkoutConv7d")}
              </span>
            </div>
          </div>

          <section className="admin-overview-panel">
            <h2 className="admin-overview-panel-title">
              {t("adminSurvey.overviewTrend.title")}
            </h2>
            <div className="admin-overview-panel-chart">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart
                  data={overview?.trends7d ?? []}
                  margin={{ top: 12, right: 18, left: 4, bottom: 8 }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="rgba(90, 107, 56, 0.14)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: "rgba(58, 54, 48, 0.75)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: "rgba(58, 54, 48, 0.65)" }}
                    axisLine={{ stroke: "rgba(90, 107, 56, 0.22)" }}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="surveys"
                    name={t("adminSurvey.overviewTrend.series.surveys")}
                    stroke="#5d8578"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="feedbacks"
                    name={t("adminSurvey.overviewTrend.series.feedbacks")}
                    stroke="#c49a6c"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="checkouts"
                    name={t("adminSurvey.overviewTrend.series.checkouts")}
                    stroke="#7a9e78"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="paid"
                    name={t("adminSurvey.overviewTrend.series.paid")}
                    stroke="#87a0b8"
                    strokeWidth={2}
                    dot={{ r: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="admin-overview-panel admin-overview-panel--todo">
            <h2 className="admin-overview-panel-title">
              {t("adminSurvey.todo.title")}
            </h2>
            <div className="admin-overview-todo-grid">
              <div>
                <h3 className="admin-overview-todo-sub">
                  {t("adminSurvey.todo.openFeedback")}
                </h3>
                {(overview?.todo?.recentOpenFeedbacks?.length ?? 0) === 0 ? (
                  <p className="admin-overview-status">
                    {t("adminSurvey.todo.empty")}
                  </p>
                ) : (
                  <ul className="admin-overview-todo-list">
                    {(overview?.todo?.recentOpenFeedbacks ?? []).map((row) => (
                      <li key={row._id} className="admin-overview-todo-item">
                        <div className="admin-overview-todo-line">
                          <strong>{row.user?.name || row.user?.email || "—"}</strong>
                          <span>{new Date(row.createdAt).toLocaleString("vi-VN")}</span>
                        </div>
                        <p>{row.message}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 className="admin-overview-todo-sub">
                  {t("adminSurvey.todo.topWeak")}
                </h3>
                {(overview?.todo?.topWeakAreas?.length ?? 0) === 0 ? (
                  <p className="admin-overview-status">
                    {t("adminSurvey.todo.empty")}
                  </p>
                ) : (
                  <ul className="admin-overview-weak-list">
                    {(overview?.todo?.topWeakAreas ?? []).map((row) => (
                      <li key={row.key}>
                        <span>{weakAreaLabel(row.key)}</span>
                        <strong>{row.count}</strong>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </section>

          <div className="admin-overview-grid">
            <SurveyDonutCard
              title={t("adminSurvey.sections.level")}
              series={stats.byLevel}
              kind="level"
              innerRadius="46%"
            />
            <SurveyRadarCard
              title={t("adminSurvey.sections.goal")}
              series={stats.byGoal}
            />
            <SurveyColumnBarCard
              title={t("adminSurvey.sections.daily")}
              series={stats.byDailyTime}
            />
            <div className="admin-overview-row-dw">
              <SurveyDonutCard
                title={t("adminSurvey.sections.discovery")}
                series={stats.byDiscovery}
                kind="discovery"
                innerRadius="34%"
              />
              <SurveyHorizontalBarCard
                title={t("adminSurvey.sections.weak")}
                series={stats.byWeakArea}
                layout="split"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
