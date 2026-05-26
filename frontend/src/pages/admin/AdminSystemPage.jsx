import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAdminSystemHealth } from "../../services/adminSystemService.js";
import { getAxiosErrorMessage } from "../../utils/apiErrorMessage.js";
import "./AdminQuotesPage.css";
import "./AdminOverviewPage.css";
import "./AdminSystemPage.css";

const REFRESH_MS = 60_000;

function formatUptime(seconds, t) {
  const s = Math.max(0, Number(seconds) || 0);
  const days = Math.floor(s / 86400);
  const hours = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  const parts = [];
  if (days > 0) parts.push(t("adminSystem.uptimeDays", { count: days }));
  if (hours > 0 || days > 0) parts.push(t("adminSystem.uptimeHours", { count: hours }));
  parts.push(t("adminSystem.uptimeMinutes", { count: mins }));
  parts.push(t("adminSystem.uptimeSeconds", { count: secs }));
  return parts.join(" ");
}

function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function statusTone(status) {
  if (status === "ok" || status === "healthy") return "ok";
  if (status === "degraded") return "warn";
  return "bad";
}

function ServiceCard({ title, status, children }) {
  const tone = statusTone(status);
  return (
    <article className="admin-system-card">
      <header className="admin-system-card-head">
        <h2 className="admin-overview-panel-title">{title}</h2>
        <span className={`admin-system-pill admin-system-pill--${tone}`}>
          {status}
        </span>
      </header>
      <dl className="admin-system-dl">{children}</dl>
    </article>
  );
}

function DlRow({ label, value }) {
  return (
    <>
      <dt>{label}</dt>
      <dd>{value ?? "—"}</dd>
    </>
  );
}

export default function AdminSystemPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminSystemHealth();
      setHealth(data);
    } catch (err) {
      setError(getAxiosErrorMessage(err, t("adminSystem.error")));
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

  const overallLabel = useMemo(() => {
    const s = health?.status;
    if (s === "healthy") return t("adminSystem.statusHealthy");
    if (s === "degraded") return t("adminSystem.statusDegraded");
    if (s === "unhealthy") return t("adminSystem.statusUnhealthy");
    return s || "—";
  }, [health?.status, t]);

  const mem = health?.runtime?.memory;
  const overallTone = statusTone(health?.status);

  return (
    <div className="admin-stub-main admin-system">
      <h1 className="admin-quotes-title">{t("adminSystem.title")}</h1>
      <p className="admin-quotes-lead">{t("adminSystem.lead")}</p>

      <div className="admin-quotes-toolbar admin-system-toolbar">
        <p className="admin-system-toolbar-note">
          {health?.checkedAt
            ? t("adminSystem.checkedAt", {
                time: new Date(health.checkedAt).toLocaleString(),
              })
            : "\u00a0"}
        </p>
        <div className="admin-quotes-actions">
          <button
            type="button"
            className="admin-quotes-btn admin-quotes-btn--ghost"
            onClick={load}
            disabled={loading}
          >
            {loading ? t("adminSystem.loading") : t("adminSystem.refresh")}
          </button>
        </div>
      </div>

      {loading && !health && !error ? (
        <p className="admin-overview-status">{t("adminSystem.loading")}</p>
      ) : null}

      {error ? (
        <div className="admin-overview-error">
          <p className="admin-overview-status admin-overview-status--error">
            {t("adminSystem.error")}{" "}
            <span className="admin-overview-error-detail">{error}</span>
          </p>
          <button
            type="button"
            className="admin-overview-retry"
            onClick={load}
          >
            {t("adminSystem.retry")}
          </button>
        </div>
      ) : null}

      {health ? (
        <>
          <div
            className={`admin-overview-panel admin-system-banner admin-system-banner--${overallTone}`}
            role="status"
          >
            <p className="admin-overview-todo-sub">{t("adminSystem.overall")}</p>
            <p className="admin-system-banner-value">{overallLabel}</p>
          </div>

          <div className="admin-system-grid">
            <ServiceCard title={t("adminSystem.services.api")} status="ok">
              <DlRow label={t("adminSystem.fields.status")} value="ok" />
            </ServiceCard>

            <ServiceCard
              title={t("adminSystem.services.mongodb")}
              status={health.services?.mongodb?.status}
            >
              <DlRow
                label={t("adminSystem.fields.state")}
                value={health.services?.mongodb?.stateLabel}
              />
              <DlRow
                label={t("adminSystem.fields.latency")}
                value={
                  health.services?.mongodb?.latencyMs != null
                    ? `${health.services.mongodb.latencyMs} ms`
                    : "—"
                }
              />
              <DlRow
                label={t("adminSystem.fields.host")}
                value={health.services?.mongodb?.host}
              />
              <DlRow
                label={t("adminSystem.fields.database")}
                value={health.services?.mongodb?.name}
              />
            </ServiceCard>

            <ServiceCard
              title={t("adminSystem.services.storage")}
              status={health.services?.storage?.status}
            >
              <DlRow
                label={t("adminSystem.fields.driver")}
                value={health.services?.storage?.driver}
              />
              {health.services?.storage?.driver === "minio" ? (
                <>
                  <DlRow
                    label={t("adminSystem.fields.endpoint")}
                    value={health.services?.storage?.endpoint}
                  />
                  <DlRow
                    label={t("adminSystem.fields.bucket")}
                    value={health.services?.storage?.bucket}
                  />
                  <DlRow
                    label={t("adminSystem.fields.latency")}
                    value={
                      health.services?.storage?.latencyMs != null
                        ? `${health.services.storage.latencyMs} ms`
                        : "—"
                    }
                  />
                </>
              ) : (
                <DlRow
                  label={t("adminSystem.fields.path")}
                  value={health.services?.storage?.root}
                />
              )}
            </ServiceCard>
          </div>

          <section
            className="admin-overview-panel"
            aria-labelledby="runtime-heading"
          >
            <h2 id="runtime-heading" className="admin-overview-panel-title">
              {t("adminSystem.runtime.title")}
            </h2>
            <div className="admin-overview-kpi-grid admin-system-kpi-grid">
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value admin-system-kpi-value--text">
                  {formatUptime(health.uptimeSeconds, t)}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.runtime.uptime")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.runtime?.env}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.runtime.env")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value admin-system-kpi-value--text">
                  {health.runtime?.nodeVersion}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.runtime.node")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.runtime?.notificationQueuePending ?? 0}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.runtime.queue")}
                </span>
              </div>
            </div>
            {mem ? (
              <ul className="admin-system-memory">
                <li>
                  <span>RSS</span>
                  <strong>{formatBytes(mem.rss)}</strong>
                </li>
                <li>
                  <span>Heap used</span>
                  <strong>{formatBytes(mem.heapUsed)}</strong>
                </li>
                <li>
                  <span>Heap total</span>
                  <strong>{formatBytes(mem.heapTotal)}</strong>
                </li>
              </ul>
            ) : null}
          </section>

          <section
            className="admin-overview-panel"
            aria-labelledby="collections-heading"
          >
            <h2 id="collections-heading" className="admin-overview-panel-title">
              {t("adminSystem.collections.title")}
            </h2>
            <div className="admin-overview-kpi-grid admin-system-kpi-grid">
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.collections?.users?.toLocaleString() ?? 0}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.collections.users")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.collections?.surveys?.toLocaleString() ?? 0}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.collections.surveys")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.collections?.feedbacks?.toLocaleString() ?? 0}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.collections.feedbacks")}
                </span>
              </div>
              <div className="admin-overview-kpi admin-overview-kpi--compact">
                <span className="admin-overview-kpi-value">
                  {health.collections?.checkouts?.toLocaleString() ?? 0}
                </span>
                <span className="admin-overview-kpi-label">
                  {t("adminSystem.collections.checkouts")}
                </span>
              </div>
            </div>
          </section>
        </>
      ) : !loading && !error ? (
        <p className="admin-overview-status">{t("adminSystem.empty")}</p>
      ) : null}
    </div>
  );
}
