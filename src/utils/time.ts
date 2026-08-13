// display a 24h "HH:MM" slot value as a 12h label (e.g. 13:00 -> 1:00, 08:00 -> 8:00)
export const fmt12 = (slot: string) => {
  const [h, m] = slot.split(':');
  const hour = parseInt(h, 10);
  const displayHour = hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${m}`;
};
