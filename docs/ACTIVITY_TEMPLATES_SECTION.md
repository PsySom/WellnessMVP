# Раздел Activity Templates (/activity-templates)

## Общее описание

Activity Templates — раздел для управления пользовательскими пресетами (наборами активностей). Здесь пользователь может:
- Создавать собственные наборы активностей из системных шаблонов
- Настраивать повторение (ежедневно, еженедельно, ежемесячно)
- Активировать/деактивировать пресеты для автоматического добавления в календарь
- Архивировать и восстанавливать пресеты

---

## Структура файлов

```
src/
├── pages/
│   └── ActivityTemplates.tsx            # Главная страница (1250+ строк)
├── types/
│   └── preset.ts                        # Типы пресетов
├── utils/
│   ├── recurrenceUtils.ts               # Утилиты повторения
│   └── timeSlots.ts                     # Временные слоты
```

---

## Архитектура интерфейса

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ACTIVITY TEMPLATES PAGE                          │
├──────────────────────────────┬──────────────────────────────────────┤
│     TEMPLATES PALETTE        │         PRESET EDITOR                │
│     (Левая панель)           │         (Правая панель)              │
│                              │                                      │
│  [Поиск шаблонов...]         │  Название: [Моя рутина утра    ]     │
│                              │                                      │
│  Фильтр по типу:             │  Теги: [🔄 routine] [💝 care]        │
│  [Все][Восст.][Истощ.]       │                                      │
│                              │  ─────────────────────────────────   │
│  ┌────────────────────────┐  │  🌅 РАННЕЕ УТРО (5:00-9:00)          │
│  │ 🧘 Медитация    [drag] │  │    ├── 🧘 Медитация (30 мин)         │
│  │ 🏃 Бег          [drag] │  │    └── 🏃 Бег (45 мин)               │
│  │ 📚 Чтение       [drag] │  │                                      │
│  │ 🎵 Музыка       [drag] │  │  ☕ ПОЗДНЕЕ УТРО (9:00-12:00)        │
│  │ ...                    │  │    └── 📚 Чтение (30 мин)            │
│  └────────────────────────┘  │                                      │
│                              │  [🗑️ Перетащите сюда для удаления]   │
│                              │                                      │
│                              │  ─────────────────────────────────   │
│                              │  Повторение: [Ежедневно ▼] [7 дней]  │
│                              │                                      │
│                              │  [💾 Сохранить] [🗑️ Удалить]         │
├──────────────────────────────┴──────────────────────────────────────┤
│                        MY PRESETS LIBRARY                           │
│  [Активные] [Архив]                        Фильтр: [Все теги ▼]     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐        │
│  │ 🔄 Утренняя     │ │ 🧘 Анти-стресс  │ │ 📚 Обучение     │        │
│  │    рутина       │ │                 │ │                 │        │
│  │ ✅ Активен      │ │ ⏸️ Неактивен    │ │ ⏸️ Неактивен    │        │
│  │ [▶️][✏️][📦]    │ │ [▶️][✏️][📦]    │ │ [▶️][✏️][📦]    │        │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘        │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Модели данных

### UserPreset (Пользовательский пресет)

```typescript
interface UserPreset {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  activities: PresetActivity[];
  tags: PresetTag[];
  
  // Настройки повторения
  recurrence_type: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_count: number;
  custom_interval?: number;
  custom_unit?: 'day' | 'week' | 'month';
  custom_end_type?: 'never' | 'date' | 'count';
  custom_end_date?: string;
  custom_end_count?: number;
  
  // Статус активации
  is_active: boolean;
  is_archived: boolean;
  activation_start_date?: string;
  activation_end_date?: string;
  last_activated_at?: string;
  
  created_at: string;
  updated_at: string;
}
```

### PresetActivity (Активность в пресете)

```typescript
interface PresetActivity {
  template_id: string;           // ID системного шаблона
  category: string;              // Категория активности
  day_part: DayPart;             // Часть дня
  duration: number;              // Длительность в минутах
  repetitions: number;           // Количество повторений
}

type DayPart = 
  | 'early_morning'   // 5:00-9:00
  | 'late_morning'    // 9:00-12:00
  | 'midday'          // 12:00-14:00
  | 'afternoon'       // 14:00-17:00
  | 'evening'         // 17:00-21:00
  | 'night';          // 21:00-5:00
```

### PresetTag (Теги пресетов)

```typescript
type PresetTag = 
  | 'routine'       // 🔄 Рутина
  | 'care'          // 💝 Забота
  | 'health'        // 🏥 Здоровье
  | 'sport'         // 🏃 Спорт
  | 'habits'        // ✅ Привычки
  | 'tasks'         // 📋 Задачи
  | 'rest'          // 😴 Отдых
  | 'learning'      // 📚 Обучение
  | 'development'   // 🌱 Развитие
  | 'antistress'    // 🧘 Антистресс
  | 'basic_needs'   // 🏠 Базовые потребности
  | 'other';        // 📌 Другое

const TAG_EMOJIS: Record<PresetTag, string> = {
  routine: '🔄',
  care: '💝',
  health: '🏥',
  sport: '🏃',
  habits: '✅',
  tasks: '📋',
  rest: '😴',
  learning: '📚',
  development: '🌱',
  antistress: '🧘',
  basic_needs: '🏠',
  other: '📌',
};
```

---

## Части дня (Day Parts)

```typescript
const DAY_PARTS = [
  { value: 'early_morning', labelKey: 'calendar.dayParts.earlyMorning', emoji: '🌅' },
  { value: 'late_morning', labelKey: 'calendar.dayParts.lateMorning', emoji: '☕' },
  { value: 'midday', labelKey: 'calendar.dayParts.midday', emoji: '☀️' },
  { value: 'afternoon', labelKey: 'calendar.dayParts.afternoon', emoji: '🌤️' },
  { value: 'evening', labelKey: 'calendar.dayParts.evening', emoji: '🌆' },
  { value: 'night', labelKey: 'calendar.dayParts.night', emoji: '🌙' },
];
```

---

## Типы повторения

```typescript
const RECURRENCE_TYPES = [
  { value: 'none', labelKey: 'calendar.form.recurrence.none' },     // Без повторения
  { value: 'daily', labelKey: 'calendar.form.recurrence.daily' },   // Ежедневно
  { value: 'weekly', labelKey: 'calendar.form.recurrence.weekly' }, // Еженедельно
  { value: 'monthly', labelKey: 'calendar.form.recurrence.monthly' }, // Ежемесячно
  { value: 'custom', labelKey: 'calendar.form.recurrence.custom' }, // Пользовательское
];
```

---

## Логика Drag & Drop

### Перетаскивание шаблона → часть дня

```typescript
const handleTemplateDragStart = (e: DragEvent, template: ActivityTemplate) => {
  setDraggedTemplate(template);
  setDraggedActivityIndex(null);
  e.dataTransfer.effectAllowed = 'copy';
};

const handleDayPartDrop = (e: DragEvent, dayPartValue: string) => {
  if (draggedTemplate) {
    const newActivity: PresetActivity = {
      template_id: draggedTemplate.id,
      category: draggedTemplate.category,
      day_part: dayPartValue,
      duration: draggedTemplate.default_duration_minutes || 30,
      repetitions: 1,
    };
    setActivities([...activities, newActivity]);
  }
};
```

### Перетаскивание активности между частями дня

```typescript
const handleActivityDragStart = (e: DragEvent, index: number) => {
  setDraggedActivityIndex(index);
  setDraggedTemplate(null);
  e.dataTransfer.effectAllowed = 'move';
};

const handleDayPartDrop = (e: DragEvent, dayPartValue: string) => {
  if (draggedActivityIndex !== null) {
    const updatedActivities = [...activities];
    updatedActivities[draggedActivityIndex] = {
      ...updatedActivities[draggedActivityIndex],
      day_part: dayPartValue
    };
    setActivities(updatedActivities);
  }
};
```

### Перетаскивание в зону удаления

```typescript
const handleRemoveZoneDrop = (e: DragEvent) => {
  if (draggedActivityIndex !== null) {
    removeActivity(draggedActivityIndex);
  }
};
```

---

## Логика сохранения пресета

```typescript
const saveMutation = useMutation({
  mutationFn: async () => {
    const presetData = { 
      name: name.trim(), 
      emoji: TAG_EMOJIS[selectedTags[0]] || '📋', 
      activities: JSON.parse(JSON.stringify(activities)),
      tags: selectedTags,
      recurrence_type: recurrenceType,
      recurrence_count: recurrenceCount,
      custom_interval: customInterval,
      custom_unit: customUnit,
      custom_end_type: customEndType,
      custom_end_date: format(customEndDate, 'yyyy-MM-dd'),
      custom_end_count: customEndCount,
    };

    if (editingPreset?.id) {
      // Обновление существующего
      await supabase
        .from('user_presets')
        .update(presetData)
        .eq('id', editingPreset.id);
    } else {
      // Создание нового
      await supabase
        .from('user_presets')
        .insert([{ user_id: user.id, ...presetData }]);
    }
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user-presets'] });
    clearEditor();
  },
});
```

---

## Логика активации пресета

При активации пресета создаются активности в календаре:

```typescript
const activateMutation = useMutation({
  mutationFn: async (preset: UserPreset) => {
    const startDate = new Date();
    
    // 1. Генерация дат повторения
    const recurrenceDates = generateRecurrenceDates(startDate, {
      recurrence_type: preset.recurrence_type,
      recurrence_count: preset.recurrence_count,
      custom_interval: preset.custom_interval,
      custom_unit: preset.custom_unit,
      custom_end_type: preset.custom_end_type,
      custom_end_date: preset.custom_end_date,
      custom_end_count: preset.custom_end_count,
    });

    // 2. Создание активностей для каждой даты
    const activitiesToCreate = [];
    for (const dateStr of recurrenceDates) {
      for (const activity of preset.activities) {
        const template = templates.find(t => t.id === activity.template_id);
        if (!template) continue;

        activitiesToCreate.push({
          user_id: user.id,
          user_preset_id: preset.id,
          title: getLocalizedName(template),
          category: activity.category,
          impact_type: template.impact_type,
          duration_minutes: activity.duration,
          status: 'planned',
          emoji: template.emoji,
          date: dateStr,
          start_time: getDefaultTimeForSlot(activity.day_part),
        });
      }
    }

    // 3. Batch insert (по 100 записей)
    for (let i = 0; i < activitiesToCreate.length; i += 100) {
      const batch = activitiesToCreate.slice(i, i + 100);
      await supabase.from('activities').insert(batch);
    }

    // 4. Обновление статуса пресета
    await supabase
      .from('user_presets')
      .update({
        is_active: true,
        last_activated_at: new Date().toISOString(),
        activation_start_date: format(startDate, 'yyyy-MM-dd'),
        activation_end_date: calculateActivationEndDate(startDate, recurrenceSettings),
      })
      .eq('id', preset.id);

    return activitiesToCreate.length;
  },
});
```

---

## Логика деактивации пресета

При деактивации удаляются все связанные активности:

```typescript
const deactivateMutation = useMutation({
  mutationFn: async (presetId: string) => {
    // 1. Удалить все активности, созданные этим пресетом
    await supabase
      .from('activities')
      .delete()
      .eq('user_preset_id', presetId);

    // 2. Обновить статус пресета
    await supabase
      .from('user_presets')
      .update({
        is_active: false,
        activation_start_date: null,
        activation_end_date: null,
      })
      .eq('id', presetId);
  },
});
```

---

## Архивация и восстановление

### Архивация (soft delete)

```typescript
const archiveMutation = useMutation({
  mutationFn: async (presetId: string) => {
    // 1. Удалить связанные активности
    await supabase.from('activities').delete().eq('user_preset_id', presetId);

    // 2. Пометить как архивный
    await supabase
      .from('user_presets')
      .update({ 
        is_archived: true, 
        is_active: false,
        activation_start_date: null,
        activation_end_date: null 
      })
      .eq('id', presetId);
  },
});
```

### Восстановление из архива

```typescript
const restoreMutation = useMutation({
  mutationFn: async (presetId: string) => {
    await supabase
      .from('user_presets')
      .update({ is_archived: false })
      .eq('id', presetId);
  },
});
```

### Полное удаление

```typescript
const deleteMutation = useMutation({
  mutationFn: async (presetId: string) => {
    // 1. Удалить связанные активности
    await supabase.from('activities').delete().eq('user_preset_id', presetId);
    
    // 2. Удалить сам пресет
    await supabase.from('user_presets').delete().eq('id', presetId);
  },
});
```

---

## Фильтрация библиотеки

```typescript
// Фильтрация по статусу архива
const activePresets = userPresets.filter(p => !p.is_archived);
const archivedPresets = userPresets.filter(p => p.is_archived);

// Фильтрация по тегам
const filteredActivePresets = libraryTagFilter === 'all' 
  ? activePresets 
  : activePresets.filter(p => p.tags?.includes(libraryTagFilter));
```

---

## Утилиты повторения

### generateRecurrenceDates

```typescript
// src/utils/recurrenceUtils.ts
export function generateRecurrenceDates(
  startDate: Date, 
  settings: RecurrenceSettings
): string[] {
  const dates: string[] = [];
  let currentDate = new Date(startDate);
  let count = 0;

  switch (settings.recurrence_type) {
    case 'daily':
      while (count < settings.recurrence_count) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addDays(currentDate, 1);
        count++;
      }
      break;
      
    case 'weekly':
      while (count < settings.recurrence_count) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addWeeks(currentDate, 1);
        count++;
      }
      break;
      
    case 'monthly':
      while (count < settings.recurrence_count) {
        dates.push(format(currentDate, 'yyyy-MM-dd'));
        currentDate = addMonths(currentDate, 1);
        count++;
      }
      break;
      
    case 'custom':
      // Логика пользовательского повторения
      break;
  }

  return dates;
}
```

---

## Локализация имён шаблонов

```typescript
const getLocalizedName = (template: ActivityTemplate): string => {
  switch (locale) {
    case 'ru':
      return template.name_ru || template.name_en;
    case 'fr':
      return template.name_fr;
    default:
      return template.name_en;
  }
};
```
