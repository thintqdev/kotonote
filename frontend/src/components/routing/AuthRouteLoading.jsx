import { useTranslation } from "react-i18next";

export default function AuthRouteLoading() {
  const { t } = useTranslation();
  return (
    <div
      className="auth-route-loading"
      role="status"
      aria-live="polite"
      style={{
        minHeight: "40vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-ui, system-ui)",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#5c5248",
      }}
    >
      {t("common.loading")}
    </div>
  );
}
