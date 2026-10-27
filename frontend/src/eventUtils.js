export function getEventDate(eventDate) {
  if (!eventDate) return null;

  const value = String(eventDate).trim();
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isPastEvent(eventOrDate, today = new Date()) {
  const eventDate =
    typeof eventOrDate === "object" && eventOrDate !== null
      ? eventOrDate.date
      : eventOrDate;
  const eventTime =
    typeof eventOrDate === "object" && eventOrDate !== null
      ? eventOrDate.time
      : "";
  const date = getEventDate(eventDate);
  if (!date) return false;

  if (/^\d{2}:\d{2}$/.test(eventTime || "")) {
    const [hours, minutes] = eventTime.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date < today;
  }

  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return date < todayStart;
}

export function formatEventDate(eventDate) {
  const date = getEventDate(eventDate);
  return date ? date.toLocaleDateString() : eventDate || "Date not specified";
}

export function getRemainingSeats(event) {
  const capacity = Number(event?.capacity);
  const registrations = Number(
    event?.registrationCount ?? event?.registrations?.length ?? 0
  );

  return Number.isFinite(capacity)
    ? Math.max(capacity - registrations, 0)
    : null;
}
