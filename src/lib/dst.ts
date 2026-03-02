import { getTimezoneOffset } from 'date-fns-tz';

export function getDSTInfo(timezone: string, date: Date) {
  const currentYear = date.getFullYear();
  
  let minOffset = Infinity;
  let maxOffset = -Infinity;
  
  // Check mid-month points to find standard and DST offsets
  for (let month = 0; month < 12; month++) {
    const d = new Date(currentYear, month, 15);
    const offset = getTimezoneOffset(timezone, d);
    if (offset < minOffset) minOffset = offset;
    if (offset > maxOffset) maxOffset = offset;
  }
  
  const observesDST = minOffset !== maxOffset;
  const currentOffset = getTimezoneOffset(timezone, date);
  const isDSTActive = observesDST && currentOffset === maxOffset;
  
  let daysUntilChange = -1;
  if (observesDST) {
    // Check next 14 days
    for (let i = 1; i <= 14; i++) {
      const futureDate = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);
      const futureOffset = getTimezoneOffset(timezone, futureDate);
      if (futureOffset !== currentOffset) {
        daysUntilChange = i;
        break;
      }
    }
  }
  
  return {
    observesDST,
    isDSTActive,
    daysUntilChange
  };
}
