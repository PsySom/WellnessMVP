-- Create exercises table
create table exercises (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  name_en text not null,
  name_fr text not null,
  description text,
  category text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')) not null,
  duration_minutes integer not null,
  effects text[] not null,
  instructions jsonb not null,
  emoji text not null,
  created_at timestamp with time zone default now()
);

-- Create exercise history table
create table exercise_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  exercise_id uuid references exercises on delete cascade not null,
  duration_minutes integer not null,
  mood_before integer,
  mood_after integer,
  notes text,
  completed_at timestamp with time zone default now()
);

-- Indexes
create index exercise_sessions_user_idx on exercise_sessions(user_id, completed_at desc);

-- Enable RLS
alter table exercises enable row level security;
alter table exercise_sessions enable row level security;

-- Create RLS policies
create policy "Exercises are viewable by everyone"
  on exercises for select using (true);

create policy "Users can manage own sessions"
  on exercise_sessions for all
  using (auth.uid() = user_id);

-- Seed Grounding Exercises
insert into exercises (slug, name, name_en, name_fr, description, category, difficulty, duration_minutes, effects, instructions, emoji) values 
(
  '5-4-3-2-1-grounding',
  'Техника 5-4-3-2-1',
  '5-4-3-2-1 Grounding',
  'Ancrage 5-4-3-2-1',
  'A simple technique to bring you back to the present moment',
  'grounding',
  'easy',
  5,
  ARRAY['Reduces anxiety', 'Increases present-moment awareness', 'Calms racing thoughts'],
  '[
    {"step": 1, "title": "Find 5 things you can see", "content": "Look around and name 5 things you can see. Be specific about colors, shapes, and details."},
    {"step": 2, "title": "Find 4 things you can touch", "content": "Notice the textures. What are 4 things you can feel? Touch them if possible."},
    {"step": 3, "title": "Find 3 things you can hear", "content": "Listen carefully. What sounds do you notice? Near and far."},
    {"step": 4, "title": "Find 2 things you can smell", "content": "What scents are present right now? If nothing, remember a favorite smell."},
    {"step": 5, "title": "Find 1 thing you can taste", "content": "What taste is in your mouth right now? Take a sip of water if needed."}
  ]'::jsonb,
  '🌊'
),
(
  'body-scan',
  'Сканирование тела',
  'Body Scan Meditation',
  'Méditation du scan corporel',
  'Progressive relaxation through body awareness',
  'grounding',
  'medium',
  10,
  ARRAY['Releases tension', 'Improves body awareness', 'Promotes relaxation'],
  '[
    {"step": 1, "title": "Get comfortable", "content": "Sit or lie down in a comfortable position. Close your eyes if comfortable."},
    {"step": 2, "title": "Focus on your feet", "content": "Notice sensations in your feet. Warmth, coolness, pressure, tingling."},
    {"step": 3, "title": "Move to your legs", "content": "Slowly bring attention up through your calves, knees, and thighs."},
    {"step": 4, "title": "Notice your torso", "content": "Feel your abdomen, chest, and back. Notice your breath moving."},
    {"step": 5, "title": "Check your arms", "content": "Bring awareness to your shoulders, arms, hands, and fingers."},
    {"step": 6, "title": "Relax your head", "content": "Notice your neck, face, and head. Release any tension."},
    {"step": 7, "title": "Full body awareness", "content": "Feel your whole body as one. Take three deep breaths."}
  ]'::jsonb,
  '🧘'
),
(
  'sensory-grounding',
  'Сенсорное заземление',
  'Sensory Grounding',
  'Ancrage sensoriel',
  'Use your five senses to ground yourself',
  'grounding',
  'easy',
  3,
  ARRAY['Quick calming', 'Reduces panic', 'Brings focus'],
  '[
    {"step": 1, "title": "Notice what you see", "content": "Name 3 things you can see right now in detail."},
    {"step": 2, "title": "Notice what you hear", "content": "Identify 2 sounds you can hear."},
    {"step": 3, "title": "Notice what you feel", "content": "Feel 1 texture or temperature on your skin."}
  ]'::jsonb,
  '👁️'
);

-- Seed Stress Relief Exercises
insert into exercises (slug, name, name_en, name_fr, description, category, difficulty, duration_minutes, effects, instructions, emoji) values 
(
  '4-7-8-breathing',
  'Дыхание 4-7-8',
  '4-7-8 Breathing',
  'Respiration 4-7-8',
  'A powerful breathing technique for instant calm',
  'stress',
  'easy',
  5,
  ARRAY['Reduces stress', 'Lowers heart rate', 'Improves sleep'],
  '[
    {"step": 1, "title": "Prepare", "content": "Sit comfortably with your back straight. Place tip of tongue behind upper front teeth.", "duration": 10},
    {"step": 2, "title": "Exhale completely", "content": "Exhale completely through your mouth, making a whoosh sound.", "duration": 8},
    {"step": 3, "title": "Inhale", "content": "Close your mouth and inhale quietly through your nose for 4 seconds.", "duration": 4},
    {"step": 4, "title": "Hold", "content": "Hold your breath for 7 seconds.", "duration": 7},
    {"step": 5, "title": "Exhale", "content": "Exhale completely through your mouth for 8 seconds.", "duration": 8},
    {"step": 6, "title": "Repeat", "content": "This completes one cycle. Repeat 3-4 times.", "duration": 0}
  ]'::jsonb,
  '🌬️'
),
(
  'box-breathing',
  'Квадратное дыхание',
  'Box Breathing',
  'Respiration carrée',
  'Equal breathing for balance and calm',
  'stress',
  'easy',
  5,
  ARRAY['Balances nervous system', 'Improves focus', 'Reduces stress'],
  '[
    {"step": 1, "title": "Inhale", "content": "Breathe in slowly through your nose for 4 seconds.", "duration": 4},
    {"step": 2, "title": "Hold", "content": "Hold your breath for 4 seconds.", "duration": 4},
    {"step": 3, "title": "Exhale", "content": "Breathe out slowly through your mouth for 4 seconds.", "duration": 4},
    {"step": 4, "title": "Hold", "content": "Hold empty for 4 seconds.", "duration": 4},
    {"step": 5, "title": "Repeat", "content": "Continue for 4-5 minutes or 10 cycles.", "duration": 0}
  ]'::jsonb,
  '📦'
),
(
  'progressive-muscle-relaxation',
  'Прогрессивная мышечная релаксация',
  'Progressive Muscle Relaxation',
  'Relaxation musculaire progressive',
  'Release physical tension through systematic muscle relaxation',
  'stress',
  'medium',
  15,
  ARRAY['Releases muscle tension', 'Reduces physical stress', 'Improves sleep'],
  '[
    {"step": 1, "title": "Hands", "content": "Clench your fists tight for 5 seconds, then release. Notice the difference.", "duration": 10},
    {"step": 2, "title": "Arms", "content": "Tense your biceps and forearms, hold, then release completely.", "duration": 10},
    {"step": 3, "title": "Shoulders", "content": "Raise shoulders to ears, hold the tension, then drop and relax.", "duration": 10},
    {"step": 4, "title": "Face", "content": "Scrunch your face tight, hold, then release. Let your jaw hang loose.", "duration": 10},
    {"step": 5, "title": "Chest", "content": "Take a deep breath, hold tension in chest, then breathe out slowly.", "duration": 10},
    {"step": 6, "title": "Stomach", "content": "Tighten your abs, hold, then let your belly be soft.", "duration": 10},
    {"step": 7, "title": "Legs", "content": "Point your toes, tense your legs, hold, then release.", "duration": 10},
    {"step": 8, "title": "Full body", "content": "Scan your body. Notice the relaxation. Take three deep breaths.", "duration": 20}
  ]'::jsonb,
  '💆'
);

-- Seed Anxiety Management Exercises
insert into exercises (slug, name, name_en, name_fr, description, category, difficulty, duration_minutes, effects, instructions, emoji) values 
(
  'worry-postponement',
  'Отложенное беспокойство',
  'Worry Postponement',
  'Report de l''inquiétude',
  'Schedule time for worries instead of letting them control you',
  'anxiety',
  'medium',
  5,
  ARRAY['Reduces constant worry', 'Improves focus', 'Increases sense of control'],
  '[
    {"step": 1, "title": "Notice the worry", "content": "When a worry appears, acknowledge it without judgment."},
    {"step": 2, "title": "Write it down", "content": "Briefly note the worry (just a few words is enough)."},
    {"step": 3, "title": "Schedule it", "content": "Tell yourself: I will think about this during my worry time at [specific time]."},
    {"step": 4, "title": "Return to present", "content": "Gently bring your attention back to what you were doing."},
    {"step": 5, "title": "Worry time later", "content": "At your scheduled time, review your worries. Many will seem less important."}
  ]'::jsonb,
  '📝'
),
(
  'exposure-ladder',
  'Лестница экспозиции',
  'Anxiety Exposure Ladder',
  'Échelle d''exposition',
  'Gradually face your fears in manageable steps',
  'anxiety',
  'hard',
  20,
  ARRAY['Reduces avoidance', 'Builds confidence', 'Decreases anxiety over time'],
  '[
    {"step": 1, "title": "Identify the fear", "content": "What situation or thing causes you anxiety?"},
    {"step": 2, "title": "Rate the fear", "content": "On a scale of 0-10, how anxious does it make you?"},
    {"step": 3, "title": "Break it down", "content": "List smaller, easier versions of facing this fear."},
    {"step": 4, "title": "Start small", "content": "Begin with the easiest step (anxiety level 2-3)."},
    {"step": 5, "title": "Stay until anxiety drops", "content": "Remain in the situation until anxiety decreases by half."},
    {"step": 6, "title": "Move up the ladder", "content": "Once comfortable, move to the next level."},
    {"step": 7, "title": "Celebrate progress", "content": "Acknowledge each step, no matter how small."}
  ]'::jsonb,
  '🪜'
),
(
  'reality-testing',
  'Проверка реальности',
  'Reality Testing',
  'Test de réalité',
  'Challenge anxious thoughts with evidence',
  'anxiety',
  'medium',
  10,
  ARRAY['Reduces catastrophizing', 'Increases rational thinking', 'Decreases worry'],
  '[
    {"step": 1, "title": "Identify the thought", "content": "What anxious thought is bothering you?"},
    {"step": 2, "title": "Evidence for", "content": "What evidence supports this thought being true?"},
    {"step": 3, "title": "Evidence against", "content": "What evidence suggests this thought might not be true?"},
    {"step": 4, "title": "Alternative views", "content": "What are other ways to interpret this situation?"},
    {"step": 5, "title": "Balanced thought", "content": "Create a more balanced, realistic thought based on all evidence."}
  ]'::jsonb,
  '🔍'
);

-- Seed Cognitive Work Exercises
insert into exercises (slug, name, name_en, name_fr, description, category, difficulty, duration_minutes, effects, instructions, emoji) values 
(
  'thought-record',
  'Запись мыслей',
  'Thought Record',
  'Enregistrement des pensées',
  'Track and challenge negative thought patterns',
  'cognitive',
  'medium',
  15,
  ARRAY['Identifies patterns', 'Challenges distortions', 'Improves mood'],
  '[
    {"step": 1, "title": "Situation", "content": "Describe what happened. Keep it factual and specific."},
    {"step": 2, "title": "Emotions", "content": "What emotions did you feel? Rate intensity 0-100%."},
    {"step": 3, "title": "Automatic thoughts", "content": "What thoughts went through your mind? What did you tell yourself?"},
    {"step": 4, "title": "Evidence for thoughts", "content": "What facts support these thoughts?"},
    {"step": 5, "title": "Evidence against thoughts", "content": "What facts contradict these thoughts?"},
    {"step": 6, "title": "Balanced thought", "content": "Create a more balanced, realistic thought."},
    {"step": 7, "title": "Re-rate emotions", "content": "How intense are your emotions now? 0-100%"}
  ]'::jsonb,
  '📔'
),
(
  'values-clarification',
  'Прояснение ценностей',
  'Values Clarification',
  'Clarification des valeurs',
  'Identify what truly matters to you',
  'cognitive',
  'medium',
  20,
  ARRAY['Increases self-awareness', 'Guides decisions', 'Improves life satisfaction'],
  '[
    {"step": 1, "title": "Life domains", "content": "Consider: relationships, work, health, personal growth, leisure."},
    {"step": 2, "title": "What matters", "content": "For each domain, what qualities matter most to you?"},
    {"step": 3, "title": "Best self", "content": "Imagine your best self. What values are you living by?"},
    {"step": 4, "title": "Top 5 values", "content": "From your list, choose your top 5 most important values."},
    {"step": 5, "title": "Current alignment", "content": "Are your daily actions aligned with these values?"},
    {"step": 6, "title": "Action steps", "content": "What one small action can you take today to honor your values?"}
  ]'::jsonb,
  '⭐'
),
(
  'cognitive-reframe',
  'Когнитивный рефрейминг',
  'Cognitive Reframing',
  'Recadrage cognitif',
  'Transform negative thoughts into helpful ones',
  'cognitive',
  'hard',
  10,
  ARRAY['Changes perspective', 'Reduces negative thinking', 'Increases flexibility'],
  '[
    {"step": 1, "title": "Catch the thought", "content": "Notice when you have a negative or unhelpful thought."},
    {"step": 2, "title": "Name the distortion", "content": "Is it catastrophizing? All-or-nothing? Mind reading?"},
    {"step": 3, "title": "Challenge it", "content": "Is this thought based on facts or feelings?"},
    {"step": 4, "title": "Find alternatives", "content": "What are 3 other ways to view this situation?"},
    {"step": 5, "title": "Choose helpful", "content": "Which perspective is most balanced and helpful?"},
    {"step": 6, "title": "Practice", "content": "Repeat the new thought. Notice how your emotions shift."}
  ]'::jsonb,
  '🔄'
);