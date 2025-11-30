export interface PresetActivity {
  category: string;
  isCore: boolean; // основная или дополнительная
  recommendedTimeSlot?: string;
  recommendedDuration?: number;
  repetitionConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    count: number;
  };
}

export interface ActivityPreset {
  id: string;
  name: {
    en: string;
    ru: string;
    fr: string;
  };
  emoji: string;
  activities: PresetActivity[];
}

export const ACTIVITY_PRESETS: ActivityPreset[] = [
  {
    id: 'basic_needs',
    name: {
      en: 'Basic Needs',
      ru: 'Базовые потребности',
      fr: 'Besoins de base'
    },
    emoji: '🔋',
    activities: [
      // Основные
      {
        category: 'sleep_8hours',
        isCore: true,
        recommendedTimeSlot: 'night',
        recommendedDuration: 480,
        repetitionConfig: { frequency: 'daily', count: 1 }
      },
      {
        category: 'nutrition_breakfast',
        isCore: true,
        recommendedTimeSlot: 'early_morning',
        recommendedDuration: 30,
        repetitionConfig: { frequency: 'daily', count: 1 }
      },
      {
        category: 'nutrition_lunch',
        isCore: true,
        recommendedTimeSlot: 'midday',
        recommendedDuration: 45,
        repetitionConfig: { frequency: 'daily', count: 1 }
      },
      {
        category: 'nutrition_dinner',
        isCore: true,
        recommendedTimeSlot: 'evening',
        recommendedDuration: 45,
        repetitionConfig: { frequency: 'daily', count: 1 }
      },
      // Дополнительные
      {
        category: 'hydration',
        isCore: false,
        recommendedTimeSlot: 'anytime',
        recommendedDuration: 5,
        repetitionConfig: { frequency: 'daily', count: 8 }
      },
      {
        category: 'nutrition_coffee',
        isCore: false,
        recommendedTimeSlot: 'late_morning',
        recommendedDuration: 15,
        repetitionConfig: { frequency: 'daily', count: 2 }
      },
      {
        category: 'nutrition_brunch',
        isCore: false,
        recommendedTimeSlot: 'late_morning',
        recommendedDuration: 30,
        repetitionConfig: { frequency: 'daily', count: 1 }
      },
      {
        category: 'nutrition_after_dinner',
        isCore: false,
        recommendedTimeSlot: 'evening',
        recommendedDuration: 15,
        repetitionConfig: { frequency: 'daily', count: 1 }
      }
    ]
  },
  {
    id: 'routines',
    name: {
      en: 'Routines & Habits',
      ru: 'Рутины/привычки',
      fr: 'Routines & habitudes'
    },
    emoji: '🔄',
    activities: []
  },
  {
    id: 'development',
    name: {
      en: 'Development',
      ru: 'Развитие',
      fr: 'Développement'
    },
    emoji: '📈',
    activities: []
  },
  {
    id: 'rest',
    name: {
      en: 'Rest',
      ru: 'Отдых',
      fr: 'Repos'
    },
    emoji: '🌿',
    activities: []
  },
  {
    id: 'other',
    name: {
      en: 'Other',
      ru: 'Иное',
      fr: 'Autre'
    },
    emoji: '✨',
    activities: []
  }
];

export const getPresetById = (id: string) => {
  return ACTIVITY_PRESETS.find(preset => preset.id === id);
};

export const getCoreActivities = (presetId: string) => {
  const preset = getPresetById(presetId);
  return preset?.activities.filter(a => a.isCore) || [];
};

export const getAdditionalActivities = (presetId: string) => {
  const preset = getPresetById(presetId);
  return preset?.activities.filter(a => !a.isCore) || [];
};
