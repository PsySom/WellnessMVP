# Раздел Tracker History (/tracker-history)

## Общее описание

Tracker History — страница истории записей трекеров самочувствия. Здесь пользователь видит:
- Графики настроения, стресса, тревожности, энергии
- Распределение эмоций
- Метрики удовлетворённости
- Список всех записей с возможностью просмотра деталей

---

## Структура файлов

```
src/
├── pages/
│   └── TrackerHistory.tsx               # Главная страница
├── components/tracker-history/
│   ├── MoodGraph.tsx                    # График настроения
│   ├── EmotionsDistribution.tsx         # Распределение эмоций
│   ├── StressAnxietyGraph.tsx           # График стресса/тревожности
│   ├── EnergyGraph.tsx                  # График энергии
│   ├── SatisfactionMetrics.tsx          # Метрики удовлетворённости
│   ├── EntriesList.tsx                  # Список записей
│   └── EntryDetailsModal.tsx            # Модальное окно деталей
```

---

## Архитектура страницы

```
┌─────────────────────────────────────────────────────────────────┐
│  [← На Dashboard]                  История трекеров   [📥 Export]│
├─────────────────────────────────────────────────────────────────┤
│  🕐 История записей вашего самочувствия                          │
│  Отслеживайте изменения во времени                              │
├─────────────────────────────────────────────────────────────────┤
│  [День] [Неделя] [Месяц]                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📈 НАСТРОЕНИЕ                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │     +5 ┤                    ●                               │ │
│  │     +3 ┤        ●     ●  ●    ●  ●                          │ │
│  │      0 ┼────●─────────────────────●────                     │ │
│  │     -3 ┤  ●                          ●                      │ │
│  │     -5 ┤                                                    │ │
│  │        └──Пн──Вт──Ср──Чт──Пт──Сб──Вс──                      │ │
│  │        Среднее: +1.5  |  Мин: -3  |  Макс: +4               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────┐ ┌───────────────────────────────┐ │
│  │ 🎭 ЭМОЦИИ                 │ │ 😰 СТРЕСС И ТРЕВОЖНОСТЬ       │ │
│  │                           │ │                               │ │
│  │ 😊 Радость      ████ 24%  │ │  10 ┤   ●                     │ │
│  │ 😌 Спокойствие  ███ 18%   │ │   7 ┤ ●   ●   ●       ●       │ │
│  │ 😰 Тревога      ██ 12%    │ │   5 ┼─────────────────────    │ │
│  │ 😢 Грусть       ██ 10%    │ │   3 ┤         ●   ●   ●       │ │
│  │ 😠 Злость       █ 6%      │ │   0 ┤                         │ │
│  │                           │ │     └──Пн──Вт──Ср──Чт──Пт──   │ │
│  └───────────────────────────┘ └───────────────────────────────┘ │
│                                                                  │
│  ┌───────────────────────────┐ ┌───────────────────────────────┐ │
│  │ ⚡ ЭНЕРГИЯ                │ │ 📊 УДОВЛЕТВОРЁННОСТЬ          │ │
│  │                           │ │                               │ │
│  │  +5 ┤      ●              │ │ Процесс:   ▰▰▰▰▰▰▰▱▱▱ 7.2    │ │
│  │  +3 ┤  ●      ●           │ │ Результат: ▰▰▰▰▰▰▱▱▱▱ 6.5    │ │
│  │   0 ┼────────────         │ │                               │ │
│  │  -3 ┤            ●  ●     │ │ Корреляция: 0.72              │ │
│  │  -5 ┤                     │ │                               │ │
│  └───────────────────────────┘ └───────────────────────────────┘ │
│                                                                  │
│  📋 ВСЕ ЗАПИСИ                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 4 янв 2026 • 14:30                              [Подробнее] │ │
│  │ 😊 +3 | 😌 Спокойствие | Стресс: 4 | Энергия: +2            │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ 4 янв 2026 • 09:15                              [Подробнее] │ │
│  │ 😐 0 | 😴 Усталость | Стресс: 6 | Энергия: -1               │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ 3 янв 2026 • 21:00                              [Подробнее] │ │
│  │ 😊 +2 | 😌 Спокойствие, 🙏 Благодарность | Стресс: 3        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Модель данных

### TrackerEntry

```typescript
interface TrackerEntry {
  id: string;
  user_id: string;
  entry_date: string;                    // YYYY-MM-DD
  entry_time: string;                    // HH:MM:SS
  mood_score: number | null;             // -5 до +5
  stress_level: number | null;           // 0-10
  anxiety_level: number | null;          // 0-10
  energy_level: number | null;           // -5 до +5
  process_satisfaction: number | null;   // 0-10
  result_satisfaction: number | null;    // 0-10
  created_at: string;
  
  emotions?: Array<{
    emotion_label: string;
    intensity: number;                   // 1-3
    category: 'positive' | 'negative';
  }>;
}
```

---

## Периоды отображения

```typescript
type Period = 'day' | 'week' | 'month';

const fetchEntries = async () => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'day':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case 'week':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'month':
      startDate = new Date(now.setMonth(now.getMonth() - 1));
      break;
  }

  const { data: entriesData } = await supabase
    .from('tracker_entries')
    .select('*')
    .eq('user_id', user.id)
    .gte('entry_date', startDate.toISOString().split('T')[0])
    .order('entry_date', { ascending: true })
    .order('entry_time', { ascending: true });

  // Загрузить эмоции для каждой записи
  const entryIds = entriesData.map(e => e.id);
  const { data: emotionsData } = await supabase
    .from('tracker_emotions')
    .select('*')
    .in('tracker_entry_id', entryIds);

  // Объединить записи с эмоциями
  const entriesWithEmotions = entriesData.map(entry => ({
    ...entry,
    emotions: emotionsData?.filter(e => e.tracker_entry_id === entry.id) || [],
  }));

  setEntries(entriesWithEmotions);
};
```

---

## Компоненты визуализации

### 1. MoodGraph

Линейный график настроения с точками данных.

```typescript
interface MoodGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

// Данные для графика
const chartData = entries
  .filter(e => e.mood_score !== null)
  .map(entry => ({
    date: format(parseISO(entry.entry_date), 'dd.MM'),
    time: entry.entry_time.slice(0, 5),
    mood: entry.mood_score,
  }));

// Статистика
const stats = {
  average: (sum / count).toFixed(1),
  min: Math.min(...moods),
  max: Math.max(...moods),
};
```

**Шкала настроения:**
- +5: 😊 Отлично
- +3: 🙂 Хорошо
- 0: 😐 Нейтрально
- -3: 😕 Плохо
- -5: 😢 Очень плохо

---

### 2. EmotionsDistribution

Горизонтальная гистограмма распределения эмоций.

```typescript
interface EmotionsDistributionProps {
  entries: TrackerEntry[];
}

const getEmotionStats = () => {
  const counts: Record<string, number> = {};
  
  entries.forEach(entry => {
    entry.emotions?.forEach(emotion => {
      counts[emotion.emotion_label] = (counts[emotion.emotion_label] || 0) + 1;
    });
  });
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([label, count]) => ({
      label,
      count,
      percent: (count / totalEmotions * 100).toFixed(0),
    }));
};
```

---

### 3. StressAnxietyGraph

Двойной линейный график стресса и тревожности.

```typescript
interface StressAnxietyGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

const chartData = entries.map(entry => ({
  date: format(parseISO(entry.entry_date), 'dd.MM'),
  stress: entry.stress_level,
  anxiety: entry.anxiety_level,
}));

// Легенда
// ─── Стресс (сплошная)
// --- Тревожность (пунктирная)
```

---

### 4. EnergyGraph

Линейный график уровня энергии.

```typescript
interface EnergyGraphProps {
  entries: TrackerEntry[];
  period: Period;
}

// Шкала энергии:
// +5: ⚡ Полон энергии
// +3: 💪 Энергичный
// 0: ➖ Нейтрально
// -3: 😴 Уставший
// -5: 🔋 Истощён
```

---

### 5. SatisfactionMetrics

Метрики удовлетворённости процессом и результатом.

```typescript
interface SatisfactionMetricsProps {
  entries: TrackerEntry[];
}

const calculateMetrics = () => {
  const processScores = entries
    .filter(e => e.process_satisfaction !== null)
    .map(e => e.process_satisfaction);
    
  const resultScores = entries
    .filter(e => e.result_satisfaction !== null)
    .map(e => e.result_satisfaction);

  return {
    processAvg: average(processScores),
    resultAvg: average(resultScores),
    correlation: calculateCorrelation(processScores, resultScores),
  };
};
```

**Визуализация:**
- Progress bars (0-10)
- Числовые средние значения
- Коэффициент корреляции

---

### 6. EntriesList

Список всех записей с возможностью просмотра деталей.

```typescript
interface EntriesListProps {
  entries: TrackerEntry[];
  onEntryDeleted: () => void;
}

// Каждая запись отображает:
// - Дата и время
// - Emoji настроения
// - Список эмоций
// - Уровень стресса
// - Уровень энергии
// - Кнопка "Подробнее"
```

---

### 7. EntryDetailsModal

Модальное окно с полной информацией о записи.

```
┌─────────────────────────────────────────────────────────────────┐
│  Запись от 4 января 2026, 14:30                           [✕]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  😊 НАСТРОЕНИЕ                                                   │
│  ████████████████████ +3 (Хорошо)                               │
│                                                                  │
│  🎭 ЭМОЦИИ                                                       │
│  • 😌 Спокойствие (интенсивность: 3)                            │
│  • 🙏 Благодарность (интенсивность: 2)                          │
│                                                                  │
│  😰 СТРЕСС                                                       │
│  ████████░░ 4/10                                                 │
│                                                                  │
│  😟 ТРЕВОЖНОСТЬ                                                  │
│  ██████░░░░ 3/10                                                 │
│                                                                  │
│  ⚡ ЭНЕРГИЯ                                                      │
│  ████████████████████ +2                                         │
│                                                                  │
│  📊 УДОВЛЕТВОРЁННОСТЬ                                            │
│  Процесс:   ██████████████████░░ 8/10                           │
│  Результат: ████████████████░░░░ 7/10                           │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                               [🗑️ Удалить]       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Экспорт данных

```typescript
const handleExport = () => {
  const dataStr = JSON.stringify(entries, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mood-history-${period}-${new Date().toISOString()}.json`;
  link.click();
  URL.revokeObjectURL(url);
};
```

---

## Пустое состояние

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                            📊                                    │
│                                                                  │
│                   Записей пока нет                              │
│                                                                  │
│         Начните отслеживать своё настроение                     │
│         на главной странице, чтобы увидеть                      │
│         историю здесь.                                          │
│                                                                  │
│              [Начать отслеживание]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Навигация

| Кнопка | Действие |
|--------|----------|
| ← На Dashboard | `navigate('/dashboard')` |
| Начать отслеживание | `navigate('/dashboard')` |
| Экспорт | Скачивание JSON файла |
