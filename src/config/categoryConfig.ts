export type ImpactType = 'restoring' | 'depleting' | 'mixed' | 'neutral';
export type CategoryKey = string;

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

export const CATEGORY_CONFIG: CategoryConfig[] = [
  // RESTORING (Восстанавливающие) - 15 категорий
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
    value: 'hydration',
    emoji: '💧',
    recommendedType: 'restoring',
    label: {
      en: 'Hydration',
      ru: 'Гидратация',
      fr: 'Hydratation'
    }
  },
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
    value: 'self_care',
    emoji: '💆',
    recommendedType: 'restoring',
    label: {
      en: 'Self Care',
      ru: 'Забота о себе',
      fr: 'Soin de soi'
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

  // DEPLETING (Истощающие) - 15 категорий
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

  // MIXED (Смешанные) - 10 категорий
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
    emoji: '🏃',
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
    emoji: '📖',
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

  // NEUTRAL (Нейтральные) - 6 категорий
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
    value: 'leisure',
    emoji: '🎮',
    recommendedType: 'neutral',
    label: {
      en: 'Leisure',
      ru: 'Досуг',
      fr: 'Loisirs'
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
  }
];

export const getCategoriesByType = (type: ImpactType): CategoryConfig[] => {
  return CATEGORY_CONFIG.filter(cat => cat.recommendedType === type);
};

export const getAllCategories = (): CategoryConfig[] => {
  return CATEGORY_CONFIG;
};

export const getCategoryConfig = (categoryKey: string): CategoryConfig | undefined => {
  return CATEGORY_CONFIG.find(cat => cat.value === categoryKey);
};
