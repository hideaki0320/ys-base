export type DayType = "weekday" | "weekend";

interface PriceSlot {
  hour: number;
  prices: Record<number, number | null>; // day of week (0=Sun, 1=Mon...) -> price
}

const WEEKDAY_PRICES: Record<number, Record<number, number | null>> = {
  // hour -> dayOfWeek (1=Mon..5=Fri) -> price (null = unavailable)
  9: { 1: null, 2: null, 3: null, 4: null, 5: null },
  10: { 1: null, 2: null, 3: null, 4: null, 5: null },
  11: { 1: null, 2: null, 3: null, 4: null, 5: null },
  12: { 1: null, 2: null, 3: null, 4: null, 5: null },
  13: { 1: null, 2: null, 3: null, 4: null, 5: null },
  14: { 1: 8800, 2: 8800, 3: 8800, 4: 8800, 5: 8800 },
  15: { 1: 8800, 2: 8800, 3: 8800, 4: 8800, 5: 8800 },
  16: { 1: 5500, 2: 8800, 3: 8800, 4: 8800, 5: 5500 },
  17: { 1: null, 2: 8800, 3: 8800, 4: 8800, 5: null },
  18: { 1: 16500, 2: 16500, 3: 16500, 4: 16500, 5: 16500 },
  19: { 1: 16500, 2: 16500, 3: 16500, 4: 16500, 5: 16500 },
  20: { 1: 16500, 2: 16500, 3: 16500, 4: 16500, 5: 16500 },
};

const WEEKEND_PRICES: Record<number, number> = {
  9: 13200,
  10: 13200,
  11: 13200,
  12: 13200,
  13: 13200,
  14: 13200,
  15: 13200,
  16: 13200,
  17: 13200,
  18: 16500,
  19: 16500,
  20: 16500,
};

export function getPrice(date: Date, hour: number): number | null {
  const dayOfWeek = date.getDay();
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return WEEKEND_PRICES[hour] ?? null;
  }

  return WEEKDAY_PRICES[hour]?.[dayOfWeek] ?? null;
}

export function getAvailableSlots(date: Date): { hour: number; price: number }[] {
  const slots: { hour: number; price: number }[] = [];
  for (let h = 9; h <= 20; h++) {
    const price = getPrice(date, h);
    if (price !== null) {
      slots.push({ hour: h, price });
    }
  }
  return slots;
}

export function formatPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

export function formatTimeSlot(hour: number): string {
  return `${hour}:00〜${hour + 1}:00`;
}
