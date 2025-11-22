/**
 * Централизованная утилита для синхронизации активностей
 * между Dashboard, Calendar и другими компонентами
 */
export const triggerActivityUpdate = () => {
  // Диспатчим custom event для обновления всех подписанных компонентов
  window.dispatchEvent(new CustomEvent('activity-updated'));
};
