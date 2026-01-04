# Раздел Profile (/profile)

## Общее описание

Profile — страница управления профилем пользователя и настройками приложения. Включает:
- Информацию о профиле (аватар, имя, bio)
- Статистику использования
- Настройки уведомлений
- Настройки внешнего вида
- Выбор языка
- Настройки приватности
- Админ-панель (для администраторов)

---

## Структура файлов

```
src/
├── pages/
│   └── Profile.tsx                      # Главная страница
├── components/profile/
│   ├── ProfileHeader.tsx                # Шапка профиля с аватаром
│   ├── ProfileInfo.tsx                  # Информация о профиле
│   ├── ProfileStats.tsx                 # Статистика использования
│   ├── EditProfileModal.tsx             # Модальное окно редактирования
│   └── AvatarUpload.tsx                 # Загрузка аватара
├── components/settings/
│   ├── NotificationSettings.tsx         # Настройки уведомлений
│   ├── AppearanceSettings.tsx           # Настройки внешнего вида
│   ├── LanguageSettings.tsx             # Настройки языка
│   └── DataPrivacySettings.tsx          # Настройки приватности
├── components/admin/
│   ├── AdminPanel.tsx                   # Панель администратора
│   ├── AdminExercises.tsx               # Управление упражнениями
│   ├── AdminTests.tsx                   # Управление тестами
│   ├── AdminUserStats.tsx               # Статистика пользователей
│   ├── ExerciseFormModal.tsx            # Форма упражнения
│   └── TestFormModal.tsx                # Форма теста
```

---

## Архитектура страницы

```
┌─────────────────────────────────────────────────────────────────┐
│  👤 Профиль                                        [🚪 Выйти]   │
├─────────────────────────────────────────────────────────────────┤
│  [Профиль][Админ*][Уведомления][Внешний вид][Язык][Приватность] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    📷                                      │  │
│  │                  [Avatar]                                  │  │
│  │                                                            │  │
│  │                  John Doe                                  │  │
│  │                @johndoe                                    │  │
│  │                                                            │  │
│  │    "Стремлюсь к балансу и гармонии в жизни"               │  │
│  │                                                [✏️ Edit]   │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📊 ИНФОРМАЦИЯ                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Возраст:    28 лет                                        │  │
│  │ Пол:        Мужской                                       │  │
│  │ Email:      john@example.com                              │  │
│  │ Цели:       Снизить стресс, Улучшить сон, Развить привычки│  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  📈 СТАТИСТИКА                                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐               │
│  │   42    │ │   128   │ │   15    │ │  14 дн  │               │
│  │ Записей │ │Активн-й │ │ Сессий  │ │ В приложении           │
│  │ трекера │ │выполнено│ │журнала  │ │                        │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Модель данных профиля

```typescript
interface Profile {
  id: string;                            // UUID пользователя
  
  // Основная информация
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  age: number | null;
  gender: string | null;                 // 'male' | 'female' | 'other' | 'prefer_not_to_say'
  goals: string[] | null;
  
  // Настройки уведомлений
  notifications_enabled: boolean | null;
  morning_reflection_enabled: boolean | null;
  morning_reflection_time: string | null;  // 'HH:MM'
  evening_reflection_enabled: boolean | null;
  evening_reflection_time: string | null;
  activity_reminders_enabled: boolean | null;
  activity_reminder_minutes: number | null;
  tracker_frequency: number | null;
  tracker_times: Json | null;              // ['09:00', '21:00']
  
  // Настройки внешнего вида
  theme: string | null;                    // 'light' | 'dark' | 'auto'
  color_scheme: string | null;             // 'default' | 'blue' | 'green' | etc.
  font_size: string | null;                // 'small' | 'medium' | 'large'
  high_contrast: boolean | null;
  reduce_motion: boolean | null;
  
  // Настройки языка
  language: string | null;                 // 'en' | 'ru' | 'fr'
  
  // Приватность
  analytics_enabled: boolean | null;
  
  // Служебные
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}
```

---

## Вкладки настроек

### 1. Профиль (Profile)

**Компоненты:**
- `ProfileHeader` — аватар, имя, username, bio, кнопка редактирования
- `ProfileInfo` — возраст, пол, email, цели
- `ProfileStats` — статистика использования

**ProfileStats — метрики:**
| Метрика | Запрос |
|---------|--------|
| Записей трекера | `COUNT(*) FROM tracker_entries` |
| Активностей выполнено | `COUNT(*) FROM activities WHERE status = 'completed'` |
| Сессий журнала | `COUNT(*) FROM journal_sessions` |
| Дней в приложении | `now() - created_at` |

---

### 2. Админ (Admin) — только для администраторов

**Проверка роли:**
```typescript
const { isAdmin, loading: roleLoading } = useUserRole();

// Внутри компонента
{isAdmin && (
  <TabsTrigger value="admin">Admin</TabsTrigger>
)}
```

**Компоненты AdminPanel:**
- `AdminUserStats` — статистика пользователей
- `AdminExercises` — CRUD упражнений
- `AdminTests` — CRUD тестов

---

### 3. Уведомления (Notifications)

**NotificationSettings:**
```typescript
interface NotificationSettingsProps {
  profile: Profile;
  onUpdate: (updates: Partial<Profile>) => void;
}

// Настройки:
// • Уведомления включены (Switch)
// • Утренняя рефлексия (Switch + Time picker)
// • Вечерняя рефлексия (Switch + Time picker)
// • Напоминания об активностях (Switch + Minutes selector)
// • Частота трекера (Number input)
// • Время трекера (Multi-time picker)
```

---

### 4. Внешний вид (Appearance)

**AppearanceSettings:**
```typescript
// Настройки:
// • Тема: Light / Dark / Auto (RadioGroup)
// • Цветовая схема: Default, Blue, Green, Purple, etc. (Select)
// • Размер шрифта: Small / Medium / Large (RadioGroup)
// • Высокий контраст (Switch)
// • Уменьшить анимации (Switch)
```

**Применение темы:**
```typescript
const themeContext = useTheme();

// При загрузке профиля
if (data.theme) themeContext.setTheme(data.theme);
if (data.color_scheme) themeContext.setColorScheme(data.color_scheme);
if (data.font_size) themeContext.setFontSize(data.font_size);
if (data.high_contrast !== undefined) themeContext.setHighContrast(data.high_contrast);
if (data.reduce_motion !== undefined) themeContext.setReduceMotion(data.reduce_motion);
```

---

### 5. Язык (Language)

**LanguageSettings:**
```typescript
// Доступные языки:
const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

// При изменении:
const handleLanguageChange = async (lang: string) => {
  await onUpdate({ language: lang });
  i18n.changeLanguage(lang);
};
```

---

### 6. Приватность (Privacy)

**DataPrivacySettings:**
```typescript
// Настройки:
// • Аналитика включена (Switch)
// • Экспорт данных (Button)
// • Удаление аккаунта (Button с подтверждением)
```

---

## Загрузка аватара

```typescript
// components/profile/AvatarUpload.tsx
const handleAvatarUpload = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  // 1. Загрузить в Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  // 2. Получить публичный URL
  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // 3. Обновить профиль
  await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', user.id);
};
```

---

## Редактирование профиля

```typescript
// components/profile/EditProfileModal.tsx
interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onUpdate: () => void;
}

// Поля формы:
// • Полное имя (Input)
// • Username (Input)
// • Bio (Textarea)
// • Возраст (Number input)
// • Пол (Select)
// • Цели (Multi-select / Checkboxes)
```

---

## Обновление профиля

```typescript
const handleUpdate = async (updates: Partial<Profile>) => {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user?.id);

  if (error) throw error;

  setProfile({ ...profile, ...updates });
  toast.success('Settings updated');
};
```

---

## Проверка роли администратора

```typescript
// hooks/useUserRole.ts
export const useUserRole = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      setIsAdmin(!!data);
      setLoading(false);
    };

    checkRole();
  }, [user]);

  return { isAdmin, loading };
};
```

---

## Выход из аккаунта

```typescript
const { signOut } = useAuth();

<Button variant="outline" onClick={signOut}>
  <LogOut className="h-4 w-4 mr-2" />
  Выйти
</Button>
```

---

## Цели пользователя

```typescript
const goals = [
  'reduce_stress',      // Снизить стресс
  'improve_sleep',      // Улучшить сон
  'build_habits',       // Развить привычки
  'increase_energy',    // Повысить энергию
  'manage_anxiety',     // Управлять тревожностью
  'improve_mood',       // Улучшить настроение
  'boost_productivity', // Повысить продуктивность
  'self_awareness',     // Самопознание
];
```
