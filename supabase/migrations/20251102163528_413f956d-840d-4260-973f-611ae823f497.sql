-- Create recommendation_rules table
create table public.recommendation_rules (
  id uuid default gen_random_uuid() primary key,
  trigger_condition jsonb not null,
  activity_template_ids uuid[] not null,
  priority integer default 1,
  enabled boolean default true,
  created_at timestamp with time zone default now()
);

-- Create user_recommendations table
create table public.user_recommendations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  activity_template_id uuid references public.activity_templates(id) on delete cascade not null,
  reason text not null,
  priority integer default 1,
  accepted boolean,
  created_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  dismissed boolean default false
);

-- Indexes
create index user_recommendations_user_idx on public.user_recommendations(user_id, created_at desc);
create index user_recommendations_active_idx on public.user_recommendations(user_id, expires_at) 
  where dismissed = false and accepted is null;

-- Enable RLS
alter table public.recommendation_rules enable row level security;
alter table public.user_recommendations enable row level security;

-- RLS Policies
create policy "Rules are viewable by everyone"
  on public.recommendation_rules for select 
  using (true);

create policy "Users can view own recommendations"
  on public.user_recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert own recommendations"
  on public.user_recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own recommendations"
  on public.user_recommendations for update
  using (auth.uid() = user_id);

create policy "Users can delete own recommendations"
  on public.user_recommendations for delete
  using (auth.uid() = user_id);

-- Seed recommendation rules
-- Rule 1: High Stress (reflection + exercise)
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "tracker_threshold", "metric": "stress_level", "operator": ">", "value": 7, "occurrences": 2, "period_hours": 24}'::jsonb,
  array_agg(id),
  1,
  true
from public.activity_templates
where category in ('reflection', 'exercise')
limit 4;

-- Rule 2: High Anxiety (reflection + practice)
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "tracker_threshold", "metric": "anxiety_level", "operator": ">", "value": 7, "occurrences": 2, "period_hours": 24}'::jsonb,
  array_agg(id),
  1,
  true
from public.activity_templates
where category in ('reflection', 'practice')
limit 3;

-- Rule 3: Low Energy (sleep + nutrition + exercise)
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "tracker_threshold", "metric": "energy_level", "operator": "<", "value": -2, "occurrences": 3, "period_hours": 72}'::jsonb,
  array_agg(id),
  2,
  true
from public.activity_templates
where category in ('sleep', 'nutrition', 'exercise')
limit 4;

-- Rule 4: Low Mood (hobby + leisure)
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "tracker_threshold", "metric": "mood_score", "operator": "<", "value": 0, "occurrences": 2, "period_hours": 48}'::jsonb,
  array_agg(id),
  2,
  true
from public.activity_templates
where category in ('hobby', 'leisure')
limit 4;

-- Rule 5: Sleep Deficit
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "activity_deficit", "category": "sleep", "target_hours": 7, "period_days": 2}'::jsonb,
  array_agg(id),
  1,
  true
from public.activity_templates
where category = 'sleep'
limit 3;

-- Rule 6: No Exercise
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "activity_absence", "category": "exercise", "period_days": 3}'::jsonb,
  array_agg(id),
  3,
  true
from public.activity_templates
where category = 'exercise'
limit 3;

-- Rule 7: Low Hydration
insert into public.recommendation_rules (trigger_condition, activity_template_ids, priority, enabled)
select 
  '{"type": "activity_absence", "category": "hydration", "period_days": 1}'::jsonb,
  array_agg(id),
  2,
  true
from public.activity_templates
where category = 'hydration'
limit 2;