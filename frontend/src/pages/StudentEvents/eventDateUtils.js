export function isPastEvent(event, now = new Date()) {
  const dateValue = String(event?.date || "").slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

  if (!match) return false;

  const eventDate = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3])
  );
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return eventDate < today;
}
