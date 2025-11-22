import { Constants, Enums } from '@/integrations/supabase/types';
export type ImpactType = 'restoring' | 'depleting' | 'mixed' | 'neutral';
export type CategoryKey = Enums<'activity_category'>;
export interface CategoryConfig {
  value: CategoryKey;
  emoji: string;
  recommendedType: ImpactType;
  label: {
    en: string;
    ru: string;
    fr: string;
  };
}

const BASE_CATEGORY_CONFIG: CategoryConfig[] = [
  // RESTORING (Восстанавливающие) - с подтипами
  // 1.1 Сон
  {
    value: 'sleep_8hours',
    emoji: '😴',
    recommendedType: 'restoring',
    label: {
      en: 'Sleep 8 hours',
      ru: 'Сон 8 часов',
      fr: 'Sommeil 8 heures'
    }
  },
  {
    value: 'sleep_nap',
    emoji: '😴',
    recommendedType: 'restoring',
    label: {
      en: 'Nap',
      ru: 'Короткий дневной сон',
      fr: 'Sieste'
    }
  },
  {
    value: 'sleep_quiet_rest',
    emoji: '🛋️',
    recommendedType: 'restoring',
    label: {
      en: 'Quiet Rest',
      ru: 'Спокойный отдых',
      fr: 'Repos calme'
    }
  },
  
  // 1.2 Питание
  {
    value: 'nutrition_breakfast',
    emoji: '🍳',
    recommendedType: 'restoring',
    label: {
      en: 'Breakfast',
      ru: 'Завтрак',
      fr: 'Petit déjeuner'
    }
  },
  {
    value: 'nutrition_brunch',
    emoji: '🥐',
    recommendedType: 'restoring',
    label: {
      en: 'Brunch',
      ru: 'Бранч',
      fr: 'Brunch'
    }
  },
  {
    value: 'nutrition_lunch',
    emoji: '🍽️',
    recommendedType: 'restoring',
    label: {
      en: 'Lunch',
      ru: 'Обед',
      fr: 'Déjeuner'
    }
  },
  {
    value: 'nutrition_coffee',
    emoji: '☕',
    recommendedType: 'restoring',
    label: {
      en: 'Coffee',
      ru: 'Кофе',
      fr: 'Café'
    }
  },
  {
    value: 'nutrition_dinner',
    emoji: '🍲',
    recommendedType: 'restoring',
    label: {
      en: 'Dinner',
      ru: 'Ужин',
      fr: 'Dîner'
    }
  },
  {
    value: 'nutrition_after_dinner',
    emoji: '🍪',
    recommendedType: 'restoring',
    label: {
      en: 'After Dinner',
      ru: 'Еда после ужина',
      fr: 'Après dîner'
    }
  },
  
  // 1.3 Гидратация
  {
    value: 'hydration',
    emoji: '💧',
    recommendedType: 'restoring',
    label: {
      en: 'Hydration',
      ru: 'Гидратация',
      fr: 'Hydratation'
    }
  },
  
  // 1.4 Отдых и практики
  {
    value: 'rest',
    emoji: '🛋️',
    recommendedType: 'restoring',
    label: {
      en: 'Rest',
      ru: 'Отдых',
      fr: 'Repos'
    }
  },
  {
    value: 'rest_relaxation',
    emoji: '😌',
    recommendedType: 'restoring',
    label: {
      en: 'Relaxation',
      ru: 'Расслабление',
      fr: 'Relaxation'
    }
  },
  {
    value: 'rest_water_procedures',
    emoji: '🛁',
    recommendedType: 'restoring',
    label: {
      en: 'Water Procedures',
      ru: 'Водные процедуры',
      fr: 'Procédures aquatiques'
    }
  },
  {
    value: 'rest_hygiene',
    emoji: '🚿',
    recommendedType: 'restoring',
    label: {
      en: 'Hygiene',
      ru: 'Гигиена',
      fr: 'Hygiène'
    }
  },
  {
    value: 'rest_self_care',
    emoji: '💆',
    recommendedType: 'restoring',
    label: {
      en: 'Self Care Procedures',
      ru: 'Процедуры ухода за собой',
      fr: 'Soins personnels'
    }
  },
  {
    value: 'rest_meditation_10min',
    emoji: '🧘‍♂️',
    recommendedType: 'restoring',
    label: {
      en: 'Meditation',
      ru: 'Медитация',
      fr: 'Méditation'
    }
  },
  {
    value: 'rest_psychological_exercises',
    emoji: '🧠',
    recommendedType: 'restoring',
    label: {
      en: 'Psychological Exercises',
      ru: 'Психологические упражнения',
      fr: 'Exercices psychologiques'
    }
  },
  {
    value: 'rest_walks',
    emoji: '🚶',
    recommendedType: 'restoring',
    label: {
      en: 'Walks',
      ru: 'Прогулки',
      fr: 'Promenades'
    }
  },
  {
    value: 'rest_light_exercise',
    emoji: '🧘',
    recommendedType: 'restoring',
    label: {
      en: 'Light Exercise',
      ru: 'Легкий спорт',
      fr: 'Exercice léger'
    }
  },
  {
    value: 'rest_morning_exercise',
    emoji: '🤸',
    recommendedType: 'restoring',
    label: {
      en: 'Morning Exercise',
      ru: 'Утренняя зарядка',
      fr: 'Exercice matinal'
    }
  },
  {
    value: 'rest_reading',
    emoji: '📖',
    recommendedType: 'restoring',
    label: {
      en: 'Reading',
      ru: 'Чтение',
      fr: 'Lecture'
    }
  },
  {
    value: 'rest_doing_nothing',
    emoji: '🪑',
    recommendedType: 'restoring',
    label: {
      en: 'Doing Nothing',
      ru: 'Бездействие',
      fr: 'Ne rien faire'
    }
  },
  {
    value: 'rest_breathing_5min',
    emoji: '🌬️',
    recommendedType: 'restoring',
    label: {
      en: 'Breathing Exercise',
      ru: 'Дыхательное упражнение',
      fr: 'Exercice de respiration'
    }
  },
  {
    value: 'rest_grounding_10min',
    emoji: '🌍',
    recommendedType: 'restoring',
    label: {
      en: 'Grounding Exercise',
      ru: 'Упражнение на заземление',
      fr: 'Exercice d\'ancrage'
    }
  },
  
  // Общение и хобби
  {
    value: 'close_socializing',
    emoji: '💝',
    recommendedType: 'restoring',
    label: {
      en: 'Close Socializing',
      ru: 'Общение с близкими',
      fr: 'Socialisation proche'
    }
  },
  {
    value: 'hobby',
    emoji: '🎨',
    recommendedType: 'restoring',
    label: {
      en: 'Hobby',
      ru: 'Хобби',
      fr: 'Loisir'
    }
  },
  {
    value: 'games',
    emoji: '🎮',
    recommendedType: 'restoring',
    label: {
      en: 'Games',
      ru: 'Игры',
      fr: 'Jeux'
    }
  },
  {
    value: 'creative',
    emoji: '🎭',
    recommendedType: 'restoring',
    label: {
      en: 'Creative',
      ru: 'Творчество',
      fr: 'Créatif'
    }
  },
  {
    value: 'entertainment',
    emoji: '🎬',
    recommendedType: 'restoring',
    label: {
      en: 'Entertainment',
      ru: 'Развлечения',
      fr: 'Divertissement'
    }
  },
  {
    value: 'entertainment_music',
    emoji: '🎵',
    recommendedType: 'restoring',
    label: {
      en: 'Listen to Music',
      ru: 'Послушать музыку',
      fr: 'Écouter de la musique'
    }
  },
  {
    value: 'entertainment_social_media',
    emoji: '📱',
    recommendedType: 'restoring',
    label: {
      en: 'Social Media',
      ru: 'Соцсети',
      fr: 'Réseaux sociaux'
    }
  },
  {
    value: 'entertainment_movies',
    emoji: '🎬',
    recommendedType: 'restoring',
    label: {
      en: 'Watch Movies',
      ru: 'Просмотр фильмов',
      fr: 'Regarder des films'
    }
  },
  {
    value: 'self_care',
    emoji: '💆',
    recommendedType: 'restoring',
    label: {
      en: 'Self Care',
      ru: 'Забота о себе',
      fr: 'Soin de soi'
    }
  },

  // DEPLETING (Истощающие)
  {
    value: 'work',
    emoji: '💼',
    recommendedType: 'depleting',
    label: {
      en: 'Work',
      ru: 'Работа',
      fr: 'Travail'
    }
  },
  {
    value: 'study',
    emoji: '📚',
    recommendedType: 'depleting',
    label: {
      en: 'Study',
      ru: 'Учеба',
      fr: 'Études'
    }
  },
  {
    value: 'commute',
    emoji: '🚗',
    recommendedType: 'depleting',
    label: {
      en: 'Commute',
      ru: 'Дорога',
      fr: 'Trajet'
    }
  },
  {
    value: 'intense_exercise',
    emoji: '🏋️',
    recommendedType: 'depleting',
    label: {
      en: 'Intense Exercise',
      ru: 'Интенсивный спорт',
      fr: 'Exercice intense'
    }
  },
  {
    value: 'household_chores',
    emoji: '🧹',
    recommendedType: 'depleting',
    label: {
      en: 'Household Chores',
      ru: 'Домашние дела',
      fr: 'Tâches ménagères'
    }
  },
  {
    value: 'tasks',
    emoji: '✅',
    recommendedType: 'depleting',
    label: {
      en: 'Tasks',
      ru: 'Задачи',
      fr: 'Tâches'
    }
  },
  {
    value: 'finances',
    emoji: '💰',
    recommendedType: 'depleting',
    label: {
      en: 'Finances',
      ru: 'Финансы',
      fr: 'Finances'
    }
  },
  {
    value: 'health_appointments',
    emoji: '🏥',
    recommendedType: 'depleting',
    label: {
      en: 'Health Appointments',
      ru: 'Здоровье',
      fr: 'Rendez-vous médicaux'
    }
  },
  {
    value: 'caregiving',
    emoji: '👶',
    recommendedType: 'depleting',
    label: {
      en: 'Caregiving',
      ru: 'Забота о других',
      fr: 'Soins aux autres'
    }
  },
  {
    value: 'learning',
    emoji: '📖',
    recommendedType: 'depleting',
    label: {
      en: 'Learning',
      ru: 'Обучение',
      fr: 'Apprentissage'
    }
  },
  {
    value: 'problem_solving',
    emoji: '🧩',
    recommendedType: 'depleting',
    label: {
      en: 'Problem Solving',
      ru: 'Решение проблем',
      fr: 'Résolution de problèmes'
    }
  },
  {
    value: 'social_obligations',
    emoji: '👔',
    recommendedType: 'depleting',
    label: {
      en: 'Social Obligations',
      ru: 'Социальные обязательства',
      fr: 'Obligations sociales'
    }
  },

  // MIXED (Смешанные)
  {
    value: 'exercise',
    emoji: '🏃',
    recommendedType: 'mixed',
    label: {
      en: 'Exercise',
      ru: 'Спорт',
      fr: 'Exercice'
    }
  },
  {
    value: 'moderate_exercise',
    emoji: '🚴',
    recommendedType: 'mixed',
    label: {
      en: 'Moderate Exercise',
      ru: 'Умеренный спорт',
      fr: 'Exercice modéré'
    }
  },
  {
    value: 'social',
    emoji: '👥',
    recommendedType: 'mixed',
    label: {
      en: 'Social',
      ru: 'Общение',
      fr: 'Social'
    }
  },
  {
    value: 'cooking',
    emoji: '🍳',
    recommendedType: 'mixed',
    label: {
      en: 'Cooking',
      ru: 'Готовка',
      fr: 'Cuisine'
    }
  },
  {
    value: 'projects',
    emoji: '🎯',
    recommendedType: 'mixed',
    label: {
      en: 'Projects',
      ru: 'Проекты',
      fr: 'Projets'
    }
  },
  {
    value: 'shopping',
    emoji: '🛒',
    recommendedType: 'mixed',
    label: {
      en: 'Shopping',
      ru: 'Покупки',
      fr: 'Shopping'
    }
  },
  {
    value: 'cleaning',
    emoji: '🧽',
    recommendedType: 'mixed',
    label: {
      en: 'Cleaning',
      ru: 'Наведение порядка',
      fr: 'Nettoyage'
    }
  },
  {
    value: 'planning',
    emoji: '📅',
    recommendedType: 'mixed',
    label: {
      en: 'Planning',
      ru: 'Планирование',
      fr: 'Planification'
    }
  },
  {
    value: 'reading',
    emoji: '📚',
    recommendedType: 'mixed',
    label: {
      en: 'Reading',
      ru: 'Чтение',
      fr: 'Lecture'
    }
  },
  {
    value: 'volunteering',
    emoji: '🤝',
    recommendedType: 'mixed',
    label: {
      en: 'Volunteering',
      ru: 'Волонтерство',
      fr: 'Bénévolat'
    }
  },
  {
    value: 'spiritual',
    emoji: '🕉️',
    recommendedType: 'mixed',
    label: {
      en: 'Spiritual',
      ru: 'Духовные практики',
      fr: 'Spirituel'
    }
  },

  // NEUTRAL (Нейтральные)
  {
    value: 'hygiene',
    emoji: '🚿',
    recommendedType: 'neutral',
    label: {
      en: 'Hygiene',
      ru: 'Гигиена',
      fr: 'Hygiène'
    }
  },
  {
    value: 'routine',
    emoji: '📋',
    recommendedType: 'neutral',
    label: {
      en: 'Routine',
      ru: 'Рутина',
      fr: 'Routine'
    }
  },
  {
    value: 'waiting',
    emoji: '⏳',
    recommendedType: 'neutral',
    label: {
      en: 'Waiting',
      ru: 'Ожидание',
      fr: 'Attente'
    }
  },
  {
    value: 'testing',
    emoji: '📊',
    recommendedType: 'neutral',
    label: {
      en: 'Testing',
      ru: 'Тестирование',
      fr: 'Tests'
    }
  },
  {
    value: 'practice',
    emoji: '🧘',
    recommendedType: 'neutral',
    label: {
      en: 'Practice',
      ru: 'Практика',
      fr: 'Pratique'
    }
  },
  {
    value: 'health',
    emoji: '🩺',
    recommendedType: 'neutral',
    label: {
      en: 'Health',
      ru: 'Здоровье',
      fr: 'Santé'
    }
  },
  {
    value: 'reflection',
    emoji: '📝',
    recommendedType: 'neutral',
    label: {
      en: 'Reflection',
      ru: 'Рефлексия',
      fr: 'Réflexion'
    }
  },
  {
    value: 'reflection_trackers_5min',
    emoji: '📊',
    recommendedType: 'neutral',
    label: {
      en: 'Fill Trackers',
      ru: 'Заполнить трекеры',
      fr: 'Remplir les trackers'
    }
  },
  {
    value: 'reflection_evening_10min',
    emoji: '🌙',
    recommendedType: 'neutral',
    label: {
      en: 'Evening Reflection',
      ru: 'Вечерняя рефлексия',
      fr: 'Réflexion du soir'
    }
  },
  {
    value: 'reflection_morning_10min',
    emoji: '🌅',
    recommendedType: 'neutral',
    label: {
      en: 'Morning Reflection',
      ru: 'Утренняя рефлексия',
      fr: 'Réflexion matinale'
    }
  },
  {
    value: 'other',
    emoji: '⚡',
    recommendedType: 'neutral',
    label: {
      en: 'Other',
      ru: 'Другое',
      fr: 'Autre'
    }
  },

  // Keep old categories for backward compatibility
  {
    value: 'sleep',
    emoji: '😴',
    recommendedType: 'restoring',
    label: {
      en: 'Sleep',
      ru: 'Сон',
      fr: 'Sommeil'
    }
  },
  {
    value: 'nutrition',
    emoji: '🍎',
    recommendedType: 'restoring',
    label: {
      en: 'Nutrition',
      ru: 'Питание',
      fr: 'Nutrition'
    }
  },
  {
    value: 'light_exercise',
    emoji: '🧘',
    recommendedType: 'restoring',
    label: {
      en: 'Light Exercise',
      ru: 'Легкий спорт',
      fr: 'Exercice léger'
    }
  },
  {
    value: 'walks',
    emoji: '🚶',
    recommendedType: 'restoring',
    label: {
      en: 'Walks',
      ru: 'Прогулки',
      fr: 'Promenades'
    }
  },
  {
    value: 'meditation',
    emoji: '🧘‍♂️',
    recommendedType: 'restoring',
    label: {
      en: 'Meditation',
      ru: 'Медитация',
      fr: 'Méditation'
    }
  },
  {
    value: 'nature',
    emoji: '🌳',
    recommendedType: 'restoring',
    label: {
      en: 'Nature',
      ru: 'Природа',
      fr: 'Nature'
    }
  },
  {
    value: 'psychological_exercises',
    emoji: '🧠',
    recommendedType: 'restoring',
    label: {
      en: 'Psychological Exercises',
      ru: 'Психологические упражнения',
      fr: 'Exercices psychologiques'
    }
  },
  {
    value: 'leisure',
    emoji: '🎯',
    recommendedType: 'neutral',
    label: {
      en: 'Leisure',
      ru: 'Досуг',
      fr: 'Loisir'
    }
  },
  {
    value: 'deadlines',
    emoji: '⏰',
    recommendedType: 'depleting',
    label: {
      en: 'Deadlines',
      ru: 'Дедлайны',
      fr: 'Échéances'
    }
  },
  {
    value: 'multitasking',
    emoji: '🔄',
    recommendedType: 'depleting',
    label: {
      en: 'Multitasking',
      ru: 'Многозадачность',
      fr: 'Multitâche'
    }
  },
  {
    value: 'emotional_labor',
    emoji: '😌',
    recommendedType: 'depleting',
    label: {
      en: 'Emotional Labor',
      ru: 'Эмоциональный труд',
      fr: 'Travail émotionnel'
    }
  },
];

// Dynamically get categories from database enum
const DB_CATEGORIES = Constants.public.Enums.activity_category;

// Map database categories to config, keeping only those with definitions
export const CATEGORY_CONFIG: CategoryConfig[] = DB_CATEGORIES
  .map(key => BASE_CATEGORY_CONFIG.find(config => config.value === key))
  .filter((config): config is CategoryConfig => config !== undefined);

export const getCategoriesByType = (type: ImpactType): CategoryConfig[] => {
  return CATEGORY_CONFIG.filter(cat => cat.recommendedType === type);
};

export const getAllCategories = (): CategoryConfig[] => {
  return CATEGORY_CONFIG;
};

export const getCategoryConfig = (categoryKey: string): CategoryConfig | undefined => {
  return CATEGORY_CONFIG.find(cat => cat.value === categoryKey);
};
