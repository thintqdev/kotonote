/**
 * Chuẩn hoá document API → UI (Header / trang danh sách).
 * @param {object} doc — lean từ Mongo (có _id, title, message, type, isRead, createdAt)
 */
export function mapNotificationToUi(doc) {
  if (!doc || doc._id == null) return null;
  const actionData =
    doc.actionData != null && typeof doc.actionData === "object"
      ? { ...doc.actionData }
      : null;
  return {
    id: String(doc._id),
    type: doc.type || "info",
    title: String(doc.title ?? ""),
    message: String(doc.message ?? ""),
    timestamp: doc.createdAt ? new Date(doc.createdAt) : new Date(),
    read: Boolean(doc.isRead),
    actionType: typeof doc.actionType === "string" ? doc.actionType : "none",
    actionData,
  };
}
