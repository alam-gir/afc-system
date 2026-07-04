export const CLASS_LOG_EDIT_WINDOW_HOURS = 24;

export function isWithinClassLogEditWindow(createdAt: Date, now: Date = new Date()) {
  const hoursSinceCreation = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursSinceCreation <= CLASS_LOG_EDIT_WINDOW_HOURS;
}
