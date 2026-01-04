# Раздел Journal (/journal, /journal/history)

## Общее описание

Journal — интерактивный дневник самоанализа с чат-интерфейсом. Пользователь может:
- Вести свободный диалог с приложением
- Проходить структурированные утренние/вечерние рефлексии
- Просматривать историю сессий
- Экспортировать записи
- Видеть статистику и инсайты

---

## Структура файлов

```
src/
├── pages/
│   ├── Journal.tsx                      # Чат-интерфейс журнала
│   └── JournalHistory.tsx               # История сессий
├── components/journal/
│   ├── JournalStats.tsx                 # Статистика журнала
│   └── JournalInsights.tsx              # Инсайты из записей
```

---

## Архитектура: Страница Journal

```
┌─────────────────────────────────────────────────────────────────┐
│  📔 Журнал                                    [ℹ️] [🕐 История] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│         Привет! Как вы себя чувствуете сегодня?                 │
│         Расскажите, что у вас на уме.                           │
│                                                     14:30        │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 😔 Что-то беспокоит │ 😊 Хорошие новости │ 🤔 Думаю о... │   │
│  │ ✍️ Свободное письмо │                                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                        Сегодня был непростой день,              │
│                        чувствую себя уставшим.                  │
│                                                     14:32  ←──── │
│                                                                  │
│         Спасибо, что поделились. Расскажите                     │
│         подробнее, что именно вызывает усталость?               │
│                                                     14:32        │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│     [🌅 Утренняя рефлексия]    [🌙 Вечерняя рефлексия]          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ Напишите что-нибудь...                             [🎤] │    │
│  └─────────────────────────────────────────────────────────┘    │
│  0/2000 символов                                      [➤ Send]  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Модели данных

### Сессия журнала

```typescript
interface Session {
  id: string;
  user_id: string;
  session_type: 'morning' | 'evening' | 'free';
  started_at: string;
  ended_at: string | null;
  created_at: string;
}
```

### Сообщение журнала

```typescript
interface Message {
  id: string;
  session_id: string;
  user_id: string;
  message_type: 'user' | 'app';
  content: string;
  metadata: Json | null;
  created_at: string;
}
```

### Таблицы БД

```sql
-- Сессии журнала
CREATE TABLE journal_sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  session_type TEXT,            -- 'morning' | 'evening' | 'free'
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
);

-- Сообщения журнала
CREATE TABLE journal_messages (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES journal_sessions,
  user_id UUID REFERENCES auth.users,
  message_type TEXT,            -- 'user' | 'app'
  content TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ
);
```

---

## Типы сессий

| Тип | Emoji | Описание |
|-----|-------|----------|
| `morning` | 🌅 | Утренняя рефлексия — структурированные вопросы о планах на день |
| `evening` | 🌙 | Вечерняя рефлексия — вопросы об итогах дня |
| `free` | ✍️ | Свободное письмо — диалог без структуры |

---

## Логика инициализации сессии

```typescript
const initializeSession = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Создать новую free-сессию
  const { data: session } = await supabase
    .from('journal_sessions')
    .insert({
      user_id: user.id,
      session_type: 'free'
    })
    .select()
    .single();

  setSessionId(session.id);
  
  // 2. Отправить приветственное сообщение
  const greeting = {
    session_id: session.id,
    user_id: user.id,
    message_type: 'app',
    content: t('journal.greetings.initial')
  };

  const { data: message } = await supabase
    .from('journal_messages')
    .insert(greeting)
    .select()
    .single();

  setMessages([message]);
};
```

---

## Quick Replies (быстрые ответы)

```typescript
const QUICK_REPLIES = [
  { emoji: '😔', text: t('journal.quickReplies.bothering') },    // "Что-то беспокоит"
  { emoji: '😊', text: t('journal.quickReplies.goodNews') },     // "Хорошие новости"
  { emoji: '🤔', text: t('journal.quickReplies.thinking') },     // "Думаю о..."
  { emoji: '✍️', text: t('journal.quickReplies.freeWriting') }   // "Свободное письмо"
];
```

Отображаются только после первого сообщения приложения и до начала сценария.

---

## Сценарии рефлексии

### Утренний сценарий

```typescript
const morningQuestions = [
  t('journal.morningScenario.greeting'),    // "Доброе утро! Как вы себя чувствуете?"
  t('journal.morningScenario.plans'),        // "Какие у вас планы на сегодня?"
  t('journal.morningScenario.intention'),    // "Какое намерение вы хотите установить?"
  t('journal.morningScenario.feeling'),      // "Как вы оцениваете свою готовность к дню?"
  t('journal.morningScenario.closing')       // "Отлично! Удачного вам дня!"
];
```

### Вечерний сценарий

```typescript
const eveningQuestions = [
  t('journal.eveningScenario.greeting'),     // "Добрый вечер! Как прошёл ваш день?"
  t('journal.eveningScenario.wentWell'),     // "Что сегодня получилось хорошо?"
  t('journal.eveningScenario.grateful'),     // "За что вы благодарны сегодня?"
  t('journal.eveningScenario.improve'),      // "Что можно было бы улучшить?"
  t('journal.eveningScenario.feeling'),      // "Как вы себя чувствуете сейчас?"
  t('journal.eveningScenario.closing')       // "Спасибо за рефлексию. Хорошего отдыха!"
];
```

---

## Логика отправки сообщения

```typescript
const sendMessage = async (content: string) => {
  if (!content.trim() || !sessionId || isLoading) return;

  setIsLoading(true);

  // 1. Сохранить сообщение пользователя
  const { data: newMessage } = await supabase
    .from('journal_messages')
    .insert({
      session_id: sessionId,
      user_id: user.id,
      message_type: 'user',
      content: content.trim()
    })
    .select()
    .single();

  setMessages(prev => [...prev, newMessage]);
  setInputText('');

  // 2. Обработать ответ
  if (currentScenario) {
    await handleScenarioResponse(content);
  } else {
    // Free mode — простой ответ благодарности
    setTimeout(async () => {
      const appMessage = {
        session_id: sessionId,
        user_id: user.id,
        message_type: 'app',
        content: t('journal.greetings.thanks')
      };

      const { data: response } = await supabase
        .from('journal_messages')
        .insert(appMessage)
        .select()
        .single();

      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1000);
  }
};
```

---

## Логика обработки сценария

```typescript
const handleScenarioResponse = async (content: string) => {
  const questions = getScenarioQuestions(currentScenario);
  const nextStep = scenarioStep + 1;

  setTimeout(async () => {
    if (nextStep < questions.length) {
      // Отправить следующий вопрос
      const appMessage = {
        session_id: sessionId,
        user_id: user.id,
        message_type: 'app',
        content: questions[nextStep]
      };

      const { data: response } = await supabase
        .from('journal_messages')
        .insert(appMessage)
        .select()
        .single();

      setMessages(prev => [...prev, response]);
      setScenarioStep(nextStep);

      // Завершить сценарий после финального сообщения
      if (nextStep === questions.length - 1) {
        setCurrentScenario(null);
        setScenarioStep(0);
      }
    }
    setIsLoading(false);
  }, 1000);
};
```

---

## Архитектура: Страница JournalHistory

```
┌─────────────────────────────────────────────────────────────────┐
│  [← Назад]                    История журнала         [Экспорт] │
├─────────────────────────────────────────────────────────────────┤
│  [🔍 Поиск...]                               [Фильтры 🔽]       │
├─────────────────────────────────────────────────────────────────┤
│  📊 СТАТИСТИКА                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                │
│  │   42    │ │    7    │ │   14    │ │   12    │                │
│  │ Всего   │ │ Текущий │ │ Лучший  │ │ В этом  │                │
│  │ сессий  │ │ streak  │ │ streak  │ │ месяце  │                │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘                │
├─────────────────────────────────────────────────────────────────┤
│  💡 ИНСАЙТЫ                                                      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • В среднем 3.2 сессии в неделю                             │ │
│  │ • Наиболее активное время: Вечер (5PM-9PM)                  │ │
│  │ • Средняя длина сессии: 8 сообщений                         │ │
│  │ • Consistency score: 75%                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  📅 СЕССИИ                                                       │
│                                                                  │
│  Сегодня                                                         │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🌙 Вечерняя рефлексия                     14:30             │ │
│  │ "Сегодня был продуктивный день..."        8 сообщений       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Вчера                                                           │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ 🌅 Утренняя рефлексия                     08:15             │ │
│  │ "Планирую сегодня закончить проект..."    6 сообщений       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  3 января 2026                                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ ✍️ Свободное письмо                       21:00             │ │
│  │ "Размышляю о целях на новый год..."       12 сообщений      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Статистика и инсайты

### Статистика (stats)

```typescript
interface Stats {
  totalSessions: number;      // Всего сессий
  currentStreak: number;      // Текущий streak (дни подряд)
  longestStreak: number;      // Лучший streak
  thisMonthCount: number;     // Сессий в этом месяце
}
```

### Инсайты (insights)

```typescript
interface Insights {
  averageSessionsPerWeek: number;   // Среднее сессий в неделю
  mostActiveTimeOfDay: string;      // Самое активное время дня
  averageMessageCount: number;      // Среднее сообщений в сессии
  consistencyScore: number;         // Процент регулярности
  topWords: Array<{                 // Топ-10 часто используемых слов
    word: string;
    count: number;
  }>;
}
```

---

## Фильтрация сессий

```typescript
type FilterType = 'all' | 'morning' | 'evening' | 'free';
type DateRangeType = 'all' | 'today' | 'week' | 'month' | 'custom';

const applyFilters = () => {
  let filtered = [...sessions];

  // Фильтр по типу сессии
  if (filterType !== 'all') {
    filtered = filtered.filter(s => s.session_type === filterType);
  }

  // Фильтр по дате
  if (dateRange === 'today') {
    filtered = filtered.filter(s => new Date(s.started_at) >= today);
  } else if (dateRange === 'week') {
    filtered = filtered.filter(s => new Date(s.started_at) >= weekAgo);
  } else if (dateRange === 'month') {
    filtered = filtered.filter(s => new Date(s.started_at) >= monthAgo);
  }

  // Поиск по тексту
  if (searchQuery.trim()) {
    filtered = filtered.filter(s =>
      s.preview.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  setFilteredSessions(filtered);
};
```

---

## Экспорт данных

### Экспорт в текст

```typescript
const exportAsText = async () => {
  let text = `JOURNAL EXPORT\nGenerated: ${exportDate}\n`;
  text += '═'.repeat(50) + '\n\n';

  for (const { session, messages } of exportData) {
    text += `${date} - ${type} Reflection\n`;
    text += '─'.repeat(50) + '\n\n';

    messages.forEach((msg) => {
      const sender = msg.message_type === 'app' ? 'App' : 'You';
      text += `${sender}: ${msg.content}\n\n`;
    });

    text += '─'.repeat(50) + '\n\n';
  }

  // Скачать как .txt файл
  const blob = new Blob([text], { type: 'text/plain' });
  downloadFile(blob, `journal-export-${date}.txt`);
};
```

### Экспорт в JSON

```typescript
const exportAsJSON = () => {
  const data = JSON.stringify(sessions, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  downloadFile(blob, `journal-export-${date}.json`);
};
```

---

## Группировка сессий по дате

```typescript
const groupSessionsByDate = (sessions: Session[]) => {
  const groups: { [key: string]: Session[] } = {};

  sessions.forEach((session) => {
    const sessionDate = new Date(session.started_at);
    
    let dateKey: string;
    if (isToday(sessionDate)) {
      dateKey = 'Today';
    } else if (isYesterday(sessionDate)) {
      dateKey = 'Yesterday';
    } else {
      dateKey = format(sessionDate, 'MMMM d, yyyy');
    }
    
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(session);
  });

  return groups;
};
```

---

## Удаление сессий

```typescript
const handleDelete = async () => {
  if (deleteTarget.type === 'all') {
    // Удалить все сессии пользователя
    await supabase
      .from('journal_sessions')
      .delete()
      .eq('user_id', user.id);
  } else if (deleteTarget.id) {
    // Удалить конкретную сессию
    await supabase
      .from('journal_sessions')
      .delete()
      .eq('id', deleteTarget.id);
  }
  
  loadSessions();
};
```

---

## Расчёт streaks

```typescript
const calculateStreaks = (sessions: Session[]) => {
  const dates = sessions.map(s => new Date(s.started_at).toDateString());
  const uniqueDates = [...new Set(dates)];
  
  let currentStreak = 0;
  let longestStreak = 0;
  
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  // Проверить, продолжается ли streak
  if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
    currentStreak = 1;
    
    // Считать назад
    for (let i = uniqueDates.length - 2; i >= 0; i--) {
      const curr = new Date(uniqueDates[i]);
      const next = new Date(uniqueDates[i + 1]);
      const diffDays = Math.floor((next - curr) / 86400000);
      
      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Найти самый длинный streak
  let tempStreak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const curr = new Date(uniqueDates[i - 1]);
    const next = new Date(uniqueDates[i]);
    const diffDays = Math.floor((next - curr) / 86400000);
    
    if (diffDays === 1) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 1;
    }
  }

  return { currentStreak, longestStreak };
};
```
