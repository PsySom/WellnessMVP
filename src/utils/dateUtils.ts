import { format } from 'date-fns';

/**
 * Возвращает локальную дату в формате YYYY-MM-DD
 * Используем везде, где нужен "сегодня" или дата без времени,
 * чтобы избежать ошибок из-за часовых поясов.
 */
export const getLocalDateString = (date: Date = new Date()): string => {
  return format(date, 'yyyy-MM-dd');
};
