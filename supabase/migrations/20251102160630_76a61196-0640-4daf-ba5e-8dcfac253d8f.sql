-- Create tests table
create table tests (
  id uuid default uuid_generate_v4() primary key,
  slug text unique not null,
  name text not null,
  name_en text not null,
  name_fr text not null,
  description text,
  description_en text,
  description_fr text,
  duration_minutes integer,
  total_questions integer not null,
  scoring_info jsonb not null,
  questions jsonb not null,
  created_at timestamp with time zone default now()
);

-- Create test results table
create table test_results (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  test_id uuid references tests on delete cascade not null,
  score integer not null,
  max_score integer not null,
  category text not null,
  answers jsonb not null,
  completed_at timestamp with time zone default now()
);

-- Create indexes
create index test_results_user_test_idx on test_results(user_id, test_id, completed_at desc);

-- Enable RLS
alter table tests enable row level security;
alter table test_results enable row level security;

-- Create RLS policies
create policy "Tests are viewable by everyone"
  on tests for select using (true);

create policy "Users can manage own results"
  on test_results for all
  using (auth.uid() = user_id);

-- Seed PSS-10 test
insert into tests (slug, name, name_en, name_fr, description, description_en, description_fr, duration_minutes, total_questions, scoring_info, questions) values (
  'pss-10',
  'Тест на уровень стресса',
  'Stress Level Test (PSS-10)',
  'Test de niveau de stress',
  'Оцените уровень стресса за последний месяц',
  'Assess your stress level over the past month',
  'Évaluez votre niveau de stress au cours du dernier mois',
  5,
  10,
  '{"ranges": [{"min": 0, "max": 13, "category": "low", "label": "Low Stress"}, {"min": 14, "max": 26, "category": "moderate", "label": "Moderate Stress"}, {"min": 27, "max": 40, "category": "high", "label": "High Stress"}]}'::jsonb,
  '[
    {"id": 1, "text": "How often have you been upset because of something that happened unexpectedly?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]},
    {"id": 2, "text": "How often have you felt that you were unable to control important things in your life?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]},
    {"id": 3, "text": "How often have you felt nervous and stressed?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]},
    {"id": 4, "text": "How often have you felt confident about your ability to handle personal problems?", "options": [{"value": 4, "label": "Never"}, {"value": 3, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 1, "label": "Fairly Often"}, {"value": 0, "label": "Very Often"}]},
    {"id": 5, "text": "How often have you felt that things were going your way?", "options": [{"value": 4, "label": "Never"}, {"value": 3, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 1, "label": "Fairly Often"}, {"value": 0, "label": "Very Often"}]},
    {"id": 6, "text": "How often have you found that you could not cope with all the things you had to do?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]},
    {"id": 7, "text": "How often have you been able to control irritations in your life?", "options": [{"value": 4, "label": "Never"}, {"value": 3, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 1, "label": "Fairly Often"}, {"value": 0, "label": "Very Often"}]},
    {"id": 8, "text": "How often have you felt that you were on top of things?", "options": [{"value": 4, "label": "Never"}, {"value": 3, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 1, "label": "Fairly Often"}, {"value": 0, "label": "Very Often"}]},
    {"id": 9, "text": "How often have you been angered because of things outside your control?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]},
    {"id": 10, "text": "How often have you felt difficulties were piling up so high that you could not overcome them?", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Almost Never"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Fairly Often"}, {"value": 4, "label": "Very Often"}]}
  ]'::jsonb
);

-- Seed GAD-7 test
insert into tests (slug, name, name_en, name_fr, description, description_en, description_fr, duration_minutes, total_questions, scoring_info, questions) values (
  'gad-7',
  'Тест тревожности',
  'Anxiety Test (GAD-7)',
  'Test d''anxiété',
  'Измерьте уровень тревожности',
  'Measure your anxiety level',
  'Mesurez votre niveau d''anxiété',
  5,
  7,
  '{"ranges": [{"min": 0, "max": 4, "category": "minimal", "label": "Minimal Anxiety"}, {"min": 5, "max": 9, "category": "mild", "label": "Mild Anxiety"}, {"min": 10, "max": 14, "category": "moderate", "label": "Moderate Anxiety"}, {"min": 15, "max": 21, "category": "severe", "label": "Severe Anxiety"}]}'::jsonb,
  '[
    {"id": 1, "text": "Feeling nervous, anxious, or on edge", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 2, "text": "Not being able to stop or control worrying", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 3, "text": "Worrying too much about different things", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 4, "text": "Trouble relaxing", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 5, "text": "Being so restless that it''s hard to sit still", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 6, "text": "Becoming easily annoyed or irritable", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 7, "text": "Feeling afraid as if something awful might happen", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]}
  ]'::jsonb
);

-- Seed PHQ-9 test
insert into tests (slug, name, name_en, name_fr, description, description_en, description_fr, duration_minutes, total_questions, scoring_info, questions) values (
  'phq-9',
  'Тест депрессии',
  'Depression Test (PHQ-9)',
  'Test de dépression',
  'Оцените симптомы депрессии',
  'Assess depression symptoms',
  'Évaluez les symptômes de dépression',
  5,
  9,
  '{"ranges": [{"min": 0, "max": 4, "category": "minimal", "label": "Minimal Depression"}, {"min": 5, "max": 9, "category": "mild", "label": "Mild Depression"}, {"min": 10, "max": 14, "category": "moderate", "label": "Moderate Depression"}, {"min": 15, "max": 19, "category": "moderately-severe", "label": "Moderately Severe Depression"}, {"min": 20, "max": 27, "category": "severe", "label": "Severe Depression"}]}'::jsonb,
  '[
    {"id": 1, "text": "Little interest or pleasure in doing things", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 2, "text": "Feeling down, depressed, or hopeless", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 3, "text": "Trouble falling or staying asleep, or sleeping too much", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 4, "text": "Feeling tired or having little energy", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 5, "text": "Poor appetite or overeating", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 6, "text": "Feeling bad about yourself or that you are a failure", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 7, "text": "Trouble concentrating on things", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 8, "text": "Moving or speaking slowly, or being fidgety or restless", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]},
    {"id": 9, "text": "Thoughts that you would be better off dead or hurting yourself", "options": [{"value": 0, "label": "Not at all"}, {"value": 1, "label": "Several days"}, {"value": 2, "label": "More than half the days"}, {"value": 3, "label": "Nearly every day"}]}
  ]'::jsonb
);

-- Seed Cognitive Distortions test
insert into tests (slug, name, name_en, name_fr, description, description_en, description_fr, duration_minutes, total_questions, scoring_info, questions) values (
  'cognitive-distortions',
  'Когнитивные искажения',
  'Cognitive Distortions Test',
  'Test des distorsions cognitives',
  'Определите паттерны мышления',
  'Identify thinking patterns',
  'Identifiez les schémas de pensée',
  10,
  15,
  '{"ranges": [{"min": 0, "max": 15, "category": "minimal", "label": "Minimal Distortions"}, {"min": 16, "max": 30, "category": "mild", "label": "Mild Distortions"}, {"min": 31, "max": 45, "category": "moderate", "label": "Moderate Distortions"}, {"min": 46, "max": 60, "category": "high", "label": "High Distortions"}]}'::jsonb,
  '[
    {"id": 1, "text": "I tend to see things as either all good or all bad", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 2, "text": "I focus on negative details and ignore positive aspects", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 3, "text": "I predict the worst possible outcome", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 4, "text": "I minimize my accomplishments and maximize my failures", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 5, "text": "I jump to conclusions without evidence", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 6, "text": "I take things personally even when they are not about me", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 7, "text": "I use words like should, must, or ought", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 8, "text": "I label myself or others based on one characteristic", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 9, "text": "I blame myself for things outside my control", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 10, "text": "I make generalizations based on single events", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 11, "text": "I assume I know what others are thinking", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 12, "text": "I disqualify positive experiences", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 13, "text": "I let my emotions guide my reasoning", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 14, "text": "I compare myself unfavorably to others", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]},
    {"id": 15, "text": "I focus on what I cannot control", "options": [{"value": 0, "label": "Never"}, {"value": 1, "label": "Rarely"}, {"value": 2, "label": "Sometimes"}, {"value": 3, "label": "Often"}, {"value": 4, "label": "Always"}]}
  ]'::jsonb
);