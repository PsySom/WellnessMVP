# Раздел Auth (/login, /signup, /forgot-password)

## Общее описание

Auth pages — страницы аутентификации пользователей:
- `/login` — вход в аккаунт
- `/signup` — регистрация нового аккаунта
- `/forgot-password` — восстановление пароля

---

## Структура файлов

```
src/
├── pages/auth/
│   ├── Login.tsx                        # Страница входа
│   ├── Signup.tsx                       # Страница регистрации
│   └── ForgotPassword.tsx               # Восстановление пароля
├── contexts/
│   └── AuthContext.tsx                  # Контекст аутентификации
├── components/
│   └── ProtectedRoute.tsx               # HOC для защищённых маршрутов
```

---

## Страница Login

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                        MindBalance                               │
│                  Ваш путь к гармонии                            │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Email                                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ you@example.com                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Пароль                                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ••••••••                                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                               [Забыли пароль?]                  │
│                                                                  │
│                    [       Войти       ]                        │
│                                                                  │
│            Нет аккаунта? [Зарегистрироваться]                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Валидация

```typescript
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});
```

### Логика входа

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});
  
  // Валидация
  const result = loginSchema.safeParse({ email, password });
  if (!result.success) {
    const fieldErrors = {};
    result.error.errors.forEach((error) => {
      fieldErrors[error.path[0]] = error.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setIsLoading(true);
  const { error } = await signIn(email, password);
  setIsLoading(false);

  if (!error) {
    navigate('/dashboard');
  }
};
```

---

## Страница Signup

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                   Создайте аккаунт                               │
│               Начните своё путешествие                          │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Полное имя (необязательно)                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ John Doe                                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Email                                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ you@example.com                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   Пароль                                                         │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ••••••••                                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│   Минимум 8 символов                                            │
│                                                                  │
│   Подтвердите пароль                                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ ••••••••                                                │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│                    [  Создать аккаунт  ]                        │
│                                                                  │
│            Уже есть аккаунт? [Войти]                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Валидация

```typescript
const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

### Логика регистрации

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setErrors({});
  
  // Валидация
  const result = signupSchema.safeParse({ 
    email, 
    password, 
    confirmPassword,
    fullName: fullName || undefined 
  });
  
  if (!result.success) {
    const fieldErrors = {};
    result.error.errors.forEach((error) => {
      fieldErrors[error.path[0]] = error.message;
    });
    setErrors(fieldErrors);
    return;
  }

  setIsLoading(true);
  const { error } = await signUp(email, password, fullName);
  setIsLoading(false);

  if (!error) {
    navigate('/onboarding');
  }
};
```

---

## Страница ForgotPassword

### Форма ввода email

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   [← Назад к входу]                                             │
│                                                                  │
│                    Сброс пароля                                 │
│       Введите email для получения ссылки сброса                 │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   Email                                                          │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ you@example.com                                         │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│              [  Отправить ссылку сброса  ]                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Успешная отправка

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│                          ✅                                      │
│                                                                  │
│                  Проверьте почту                                │
│                                                                  │
│       Мы отправили ссылку для сброса пароля                     │
│       на указанный email                                        │
│                                                                  │
│              [← Вернуться к входу]                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Логика сброса

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');
  
  // Валидация email
  const result = emailSchema.safeParse({ email });
  if (!result.success) {
    setError(result.error.errors[0].message);
    return;
  }

  setIsLoading(true);
  const { error } = await resetPassword(email);
  setIsLoading(false);

  if (!error) {
    setEmailSent(true);
  }
};
```

---

## AuthContext

```typescript
// contexts/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверить текущую сессию
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Подписаться на изменения auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    toast.success('Account created! Check your email.');
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    
    if (error) {
      toast.error(error.message);
      return { error };
    }
    
    return { error: null };
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## ProtectedRoute

```typescript
// components/ProtectedRoute.tsx
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
```

---

## Автоматическое создание профиля

При регистрации нового пользователя автоматически создаётся профиль через триггер:

```sql
-- Database function
CREATE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', ''));
  RETURN new;
END;
$$;

-- Trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

---

## Локализация

Все тексты локализованы через `react-i18next`:

```typescript
const { t } = useTranslation();

// Примеры ключей
t('auth.email')           // "Email"
t('auth.password')        // "Password"
t('auth.login')           // "Sign In"
t('auth.signup')          // "Sign Up"
t('auth.forgotPassword')  // "Forgot password?"
t('auth.dontHaveAccount') // "Don't have an account?"
t('auth.alreadyHaveAccount') // "Already have an account?"
```

---

## Навигация

| Страница | Успешное действие → |
|----------|---------------------|
| `/login` | `/dashboard` |
| `/signup` | `/onboarding` |
| `/forgot-password` | Показ success screen |

---

## Стили

Все auth страницы используют:
- Центрированный layout (`flex items-center justify-center`)
- Максимальная ширина контента: `max-w-sm`
- Анимация появления: `animate-fade-in`
- Фон: `bg-background`
