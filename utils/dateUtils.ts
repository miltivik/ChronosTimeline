
import { differenceInDays, addDays, format } from 'date-fns';

/**
 * Calculates the percentage position of a date within a range.
 */
export const dateToPosition = (date: Date, start: Date, end: Date): number => {
  const totalDays = differenceInDays(end, start);
  const daysFromStart = differenceInDays(date, start);
  return (daysFromStart / totalDays) * 100;
};

/**
 * Converts a percentage position back to a Date.
 */
export const positionToDate = (percent: number, start: Date, end: Date): Date => {
  const totalDays = differenceInDays(end, start);
  const daysToAdd = Math.round((percent / 100) * totalDays);
  return addDays(start, daysToAdd);
};

/**
 * Gets a width percentage based on start and end dates.
 */
export const dateRangeToWidth = (startDate: Date, endDate: Date, totalStart: Date, totalEnd: Date): number => {
  const totalDays = differenceInDays(totalEnd, totalStart);
  const eventDays = differenceInDays(endDate, startDate);
  return (eventDays / totalDays) * 100;
};

/**
 * Generates axis labels (Months or Years) based on zoom.
 */
export const getTimelineTicks = (start: Date, end: Date, zoomLevel: number) => {
  const ticks = [];
  const totalDays = differenceInDays(end, start);
  
  // Logic to determine interval based on zoomLevel
  // 1: Quarters, 2: Months, 3: Weeks, 4: Days
  let interval = 30; // Default monthly
  if (zoomLevel === 1) interval = 90;
  if (zoomLevel >= 3) interval = 7;
  if (zoomLevel >= 4) interval = 1;

  for (let i = 0; i <= totalDays; i += interval) {
    const tickDate = addDays(start, i);
    ticks.push({
      date: tickDate,
      label: zoomLevel >= 3 ? format(tickDate, 'MMM d') : format(tickDate, 'MMM yyyy'),
      position: (i / totalDays) * 100
    });
  }
  return ticks;
};
