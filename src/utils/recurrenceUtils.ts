import { addDays, addWeeks, addMonths, addYears, format } from 'date-fns';

export interface RecurrenceSettings {
  recurrence_type: string;
  recurrence_count?: number;
  custom_interval?: number;
  custom_unit?: string;
  custom_end_type?: string;
  custom_end_date?: string;
  custom_end_count?: number;
}

/**
 * Generate array of dates based on recurrence settings
 * @param startDate - The starting date for recurrence
 * @param settings - Recurrence configuration
 * @returns Array of date strings in 'yyyy-MM-dd' format
 */
export function generateRecurrenceDates(
  startDate: Date,
  settings: RecurrenceSettings
): string[] {
  const { recurrence_type, recurrence_count = 7 } = settings;
  const dates: string[] = [];
  
  // No recurrence - just the start date
  if (recurrence_type === 'none' || !recurrence_type) {
    return [format(startDate, 'yyyy-MM-dd')];
  }
  
  // Daily recurrence
  if (recurrence_type === 'daily') {
    for (let i = 0; i < recurrence_count; i++) {
      const date = addDays(startDate, i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  }
  
  // Weekly recurrence
  if (recurrence_type === 'weekly') {
    for (let i = 0; i < recurrence_count; i++) {
      const date = addWeeks(startDate, i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  }
  
  // Monthly recurrence
  if (recurrence_type === 'monthly') {
    for (let i = 0; i < recurrence_count; i++) {
      const date = addMonths(startDate, i);
      dates.push(format(date, 'yyyy-MM-dd'));
    }
    return dates;
  }
  
  // Custom recurrence
  if (recurrence_type === 'custom') {
    const { 
      custom_interval = 1, 
      custom_unit = 'day',
      custom_end_type = 'never',
      custom_end_date,
      custom_end_count = 30
    } = settings;
    
    let addFn: (date: Date, amount: number) => Date;
    switch (custom_unit) {
      case 'week':
        addFn = addWeeks;
        break;
      case 'month':
        addFn = addMonths;
        break;
      case 'year':
        addFn = addYears;
        break;
      default:
        addFn = addDays;
    }
    
    const maxIterations = 365; // Safety limit
    let count = 0;
    let currentDate = startDate;
    const endDate = custom_end_date ? new Date(custom_end_date) : null;
    
    while (count < maxIterations) {
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      // Check end conditions
      if (custom_end_type === 'date' && endDate && currentDate > endDate) {
        break;
      }
      if (custom_end_type === 'count' && dates.length >= custom_end_count) {
        break;
      }
      if (custom_end_type === 'never' && dates.length >= 365) {
        break; // Safety limit for 'never' - max 1 year
      }
      
      dates.push(dateStr);
      currentDate = addFn(currentDate, custom_interval);
      count++;
    }
    
    return dates;
  }
  
  // Fallback - just the start date
  return [format(startDate, 'yyyy-MM-dd')];
}

/**
 * Calculate activation end date based on recurrence settings
 */
export function calculateActivationEndDate(
  startDate: Date,
  settings: RecurrenceSettings
): string {
  const dates = generateRecurrenceDates(startDate, settings);
  return dates[dates.length - 1] || format(startDate, 'yyyy-MM-dd');
}
