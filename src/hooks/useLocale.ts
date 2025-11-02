import { useTranslation } from 'react-i18next';

export const useLocale = () => {
  const { i18n } = useTranslation();

  const getLocalizedField = (obj: any, fieldName: string) => {
    const lang = i18n.language;
    // Try language-specific field first, then fall back to English
    return obj[`${fieldName}_${lang}`] || obj[`${fieldName}_en`] || obj[fieldName];
  };

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(i18n.language, options).format(dateObj);
  };

  const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(i18n.language, options).format(num);
  };

  return {
    locale: i18n.language,
    getLocalizedField,
    formatDate,
    formatNumber,
  };
};
