export type TimeSlot = 'early_morning' | 'late_morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'anytime';

export interface TimeSlotConfig {
  key: TimeSlot;
  startHour: number;
  endHour: number;
  emoji: string;
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: 'early_morning', startHour: 5, endHour: 9, emoji: '🌅' },
  { key: 'late_morning', startHour: 9, endHour: 12, emoji: '☕' },
  { key: 'midday', startHour: 12, endHour: 15, emoji: '☀️' },
  { key: 'afternoon', startHour: 15, endHour: 18, emoji: '🌤️' },
  { key: 'evening', startHour: 18, endHour: 22, emoji: '🌆' },
  { key: 'night', startHour: 22, endHour: 5, emoji: '🌙' },
];

export const getTimeSlotForTime = (time: string | null): TimeSlot => {
  if (!time) return 'anytime';
  
  const [hours] = time.split(':').map(Number);
  
  for (const slot of TIME_SLOTS) {
    if (slot.key === 'night') {
      // Night spans across midnight (22:00 - 5:00)
      if (hours >= slot.startHour || hours < slot.endHour) {
        return slot.key;
      }
    } else {
      if (hours >= slot.startHour && hours < slot.endHour) {
        return slot.key;
      }
    }
  }
  
  return 'anytime';
};

export const getDefaultTimeForSlot = (slot: TimeSlot): string | null => {
  if (slot === 'anytime') return null;
  
  const config = TIME_SLOTS.find(s => s.key === slot);
  if (!config) return null;
  
  return `${String(config.startHour).padStart(2, '0')}:00`;
};

export const filterActivitiesBySlot = (activities: any[], slot: TimeSlot) => {
  if (slot === 'anytime') {
    return activities.filter(a => !a.start_time);
  }
  
  return activities.filter(a => {
    if (!a.start_time) return false;
    return getTimeSlotForTime(a.start_time) === slot;
  });
};
