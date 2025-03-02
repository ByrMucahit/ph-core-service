export function getWeekRange() {
  const dayOfWeek = new Date().getDay();

  const firstDay: Date = new Date();
  firstDay.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  firstDay.setHours(0, 0, 0, 0);

  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);
  return { start_date: firstDay, end_date: lastDay };
}
