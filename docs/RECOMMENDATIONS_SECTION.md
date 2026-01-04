# Раздел Recommendations (/recommendations)

## Общее описание

Recommendations — страница персональных рекомендаций активностей на основе анализа данных пользователя. Система анализирует записи трекеров и предлагает активности, которые могут улучшить самочувствие.

---

## Структура файлов

```
src/
├── pages/
│   └── Recommendations.tsx              # Главная страница
├── supabase/functions/
│   └── generate-recommendations/
│       └── index.ts                     # Edge function генерации
```

---

## Архитектура страницы

```
┌─────────────────────────────────────────────────────────────────┐
│  💡 Рекомендации                                   [🔄 Обновить]│
│  Персонально для вас                                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ⚠️ ВНИМАНИЕ                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Обнаружены высокоприоритетные рекомендации.                 │ │
│  │ Рекомендуем принять меры.                                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  🔴 HIGH PRIORITY                                                │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🧘                                                     [✕]  │ │
│  │ [High] [High stress]                                        │ │
│  │ Медитация осознанности                                      │ │
│  │ Практика для снижения уровня стресса и тревожности          │ │
│  │ meditation • 15 min • restoring                             │ │
│  │ [+ Добавить на сегодня] [📅 Запланировать]                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  🟡 MEDIUM PRIORITY                                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🚶                                                     [✕]  │ │
│  │ [Medium] [Low energy]                                       │ │
│  │ Прогулка на свежем воздухе                                  │ │
│  │ Лёгкая физическая активность для повышения энергии          │ │
│  │ walks • 30 min • restoring                                  │ │
│  │ [+ Добавить на сегодня] [📅 Запланировать]                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  💭 SUGGESTIONS                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 📚                                                     [✕]  │ │
│  │ [Low] [Balance]                                             │ │
│  │ Чтение                                                      │ │
│  │ Расслабляющее занятие для баланса                           │ │
│  │ reading • 30 min • restoring                                │ │
│  │ [+ Добавить на сегодня] [📅 Запланировать]                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Модель данных

### Recommendation

```typescript
interface Recommendation {
  id: string;
  user_id: string;
  activity_template_id: string;
  reason: string;                    // Причина рекомендации
  priority: number;                  // 1 = высокий, 2 = средний, 3+ = низкий
  accepted: boolean | null;          // true = принято, false = отклонено
  dismissed: boolean;                // Отклонено без действия
  expires_at: string | null;         // Срок действия
  created_at: string;
  
  // Join с activity_templates
  activity_templates: {
    name: string;
    emoji: string;
    category: string;
    impact_type: string;
    default_duration_minutes: number;
    description: string;
  };
}
```

### Таблица user_recommendations

```sql
CREATE TABLE user_recommendations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  activity_template_id UUID REFERENCES activity_templates,
  reason TEXT,                       -- 'High stress', 'Low energy', etc.
  priority INTEGER DEFAULT 3,        -- 1 = high, 2 = medium, 3+ = low
  accepted BOOLEAN,                  -- NULL = pending, TRUE/FALSE = decided
  dismissed BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Таблица recommendation_rules

```sql
CREATE TABLE recommendation_rules (
  id UUID PRIMARY KEY,
  trigger_condition JSONB,           -- Условие срабатывания
  activity_template_ids UUID[],      -- Рекомендуемые шаблоны
  priority INTEGER DEFAULT 3,
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ
);

-- Пример trigger_condition:
-- { "stress_level": { "gte": 7 } }
-- { "mood_score": { "lte": -2 } }
-- { "energy_level": { "lte": -3 } }
```

---

## Приоритеты рекомендаций

| Priority | Label | Badge Color | Описание |
|----------|-------|-------------|----------|
| 1 | High | `bg-destructive` | Срочные рекомендации (высокий стресс, низкое настроение) |
| 2 | Medium | `bg-warning` | Важные рекомендации (средние показатели) |
| 3+ | Low | `bg-muted` | Предложения для улучшения баланса |

---

## Причины рекомендаций (Reasons)

| Reason | Описание | Trigger |
|--------|----------|---------|
| `High stress` | Высокий уровень стресса | `stress_level >= 7` |
| `High anxiety` | Высокая тревожность | `anxiety_level >= 7` |
| `Low mood` | Плохое настроение | `mood_score <= -2` |
| `Low energy` | Низкая энергия | `energy_level <= -2` |
| `Balance` | Для баланса | По умолчанию |
| `Routine` | Регулярная практика | Нет активностей определённого типа |

---

## Загрузка рекомендаций

```typescript
const fetchRecommendations = async () => {
  const lang = i18n.language;
  
  const { data, error } = await supabase
    .from('user_recommendations')
    .select(`
      *,
      activity_templates (*)
    `)
    .eq('user_id', user?.id)
    .is('accepted', null)           // Только pending
    .eq('dismissed', false)         // Не отклонённые
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });

  // Локализация названий
  const mappedData = data.map(rec => ({
    ...rec,
    activity_templates: {
      name: rec.activity_templates[`name_${lang}`] || rec.activity_templates.name_en,
      description: rec.activity_templates[`description_${lang}`] || rec.activity_templates.description_en,
      // ...остальные поля
    }
  }));

  setRecommendations(mappedData);
  setHasHighPriority(mappedData.some(r => r.priority === 1));
};
```

---

## Генерация рекомендаций (Edge Function)

```typescript
// supabase/functions/generate-recommendations/index.ts
export default async function handler(req: Request) {
  const user = await getUser(req);
  
  // 1. Получить последние записи трекера
  const { data: entries } = await supabase
    .from('tracker_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10);
  
  // 2. Анализ показателей
  const avgStress = average(entries.map(e => e.stress_level));
  const avgAnxiety = average(entries.map(e => e.anxiety_level));
  const avgMood = average(entries.map(e => e.mood_score));
  const avgEnergy = average(entries.map(e => e.energy_level));
  
  // 3. Получить правила
  const { data: rules } = await supabase
    .from('recommendation_rules')
    .select('*')
    .eq('enabled', true);
  
  // 4. Сопоставить правила с данными
  const recommendations = [];
  
  for (const rule of rules) {
    if (matchCondition(rule.trigger_condition, { avgStress, avgAnxiety, avgMood, avgEnergy })) {
      for (const templateId of rule.activity_template_ids) {
        recommendations.push({
          user_id: user.id,
          activity_template_id: templateId,
          reason: rule.trigger_condition.reason || 'Balance',
          priority: rule.priority,
        });
      }
    }
  }
  
  // 5. Удалить старые и вставить новые
  await supabase
    .from('user_recommendations')
    .delete()
    .eq('user_id', user.id)
    .is('accepted', null);
  
  await supabase
    .from('user_recommendations')
    .insert(recommendations);
  
  return new Response(JSON.stringify({ success: true }));
}
```

---

## Действия с рекомендациями

### Добавить на сегодня

```typescript
const handleAddToToday = async (rec: Recommendation) => {
  const today = getLocalDateString();
  const now = new Date();
  const startTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  // 1. Создать активность
  await supabase.from('activities').insert([{
    user_id: user?.id,
    title: rec.activity_templates.name,
    category: rec.activity_templates.category,
    impact_type: rec.activity_templates.impact_type,
    date: today,
    start_time: startTime,
    duration_minutes: rec.activity_templates.default_duration_minutes,
    status: 'planned',
    template_id: rec.activity_template_id,
  }]);

  // 2. Пометить как принятую
  await supabase
    .from('user_recommendations')
    .update({ accepted: true })
    .eq('id', rec.id);

  fetchRecommendations();
};
```

### Запланировать (перейти в календарь)

```typescript
const handleSchedule = async (rec: Recommendation) => {
  // 1. Пометить как принятую
  await supabase
    .from('user_recommendations')
    .update({ accepted: true })
    .eq('id', rec.id);

  // 2. Перейти в календарь с предзаполненным шаблоном
  navigate('/calendar', { 
    state: { templateId: rec.activity_template_id } 
  });
};
```

### Отклонить

```typescript
const handleDismiss = async (recId: string) => {
  await supabase
    .from('user_recommendations')
    .update({ dismissed: true })
    .eq('id', recId);

  setRecommendations(prev => prev.filter(r => r.id !== recId));
};
```

---

## Группировка по приоритету

```typescript
const groupedRecs = {
  high: recommendations.filter(r => r.priority === 1),
  medium: recommendations.filter(r => r.priority === 2),
  low: recommendations.filter(r => r.priority >= 3),
};
```

---

## Цвета типов воздействия

```typescript
const getImpactColor = (impact: string) => {
  switch (impact) {
    case 'restoring': return 'text-green-600 dark:text-green-400';
    case 'depleting': return 'text-red-600 dark:text-red-400';
    case 'neutral': return 'text-orange-600 dark:text-orange-400';
    case 'mixed': return 'text-blue-600 dark:text-blue-400';
    default: return 'text-muted-foreground';
  }
};
```

---

## Пустое состояние

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                           ✨                                     │
│                                                                  │
│                    Всё отлично!                                 │
│                                                                  │
│         Нет новых рекомендаций. Продолжайте                     │
│         отслеживать настроение и активности                     │
│         для персональных предложений.                           │
│                                                                  │
│              [🔄 Проверить рекомендации]                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Интеграция с Dashboard

На Dashboard отображается `InsightsPreview` — превью топ-1 рекомендации:

```typescript
// components/dashboard/InsightsPreview.tsx
const fetchRecommendations = async () => {
  const { data } = await supabase
    .from('user_recommendations')
    .select(`*, activity_templates (name, emoji)`)
    .eq('user_id', user?.id)
    .is('accepted', null)
    .eq('dismissed', false)
    .order('priority', { ascending: true })
    .limit(1);

  setRecommendationCount(data?.length || 0);
  setTopRecommendation(data?.[0] || null);
};
```
