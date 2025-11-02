-- Create enum types for activities
create type activity_category as enum (
  'sleep', 'nutrition', 'hydration', 'exercise', 
  'leisure', 'hobby', 'work', 'social', 'practice', 
  'health', 'reflection'
);

create type activity_impact as enum (
  'restorative', 'draining', 'neutral', 'mixed'
);

create type activity_status as enum (
  'planned', 'in_progress', 'completed', 'cancelled'
);

-- Create tracker_entries table
create table tracker_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  entry_date date not null,
  entry_time time not null,
  mood_score integer check (mood_score >= -5 and mood_score <= 5),
  stress_level integer check (stress_level >= 0 and stress_level <= 10),
  anxiety_level integer check (anxiety_level >= 0 and anxiety_level <= 10),
  energy_level integer check (energy_level >= -5 and energy_level <= 5),
  process_satisfaction integer check (process_satisfaction >= 0 and process_satisfaction <= 10),
  result_satisfaction integer check (result_satisfaction >= 0 and result_satisfaction <= 10),
  created_at timestamp with time zone default now()
);

-- Create tracker_emotions table
create table tracker_emotions (
  id uuid default uuid_generate_v4() primary key,
  tracker_entry_id uuid references tracker_entries on delete cascade not null,
  emotion_label text not null,
  intensity integer check (intensity >= 0 and intensity <= 10) not null,
  category text check (category in ('negative', 'neutral', 'positive')) not null
);

-- Create activities table
create table activities (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  description text,
  category activity_category not null,
  impact_type activity_impact not null,
  date date not null,
  start_time time,
  end_time time,
  duration_minutes integer,
  status activity_status default 'planned',
  reminder_enabled boolean default false,
  reminder_minutes_before integer,
  is_recurring boolean default false,
  recurrence_pattern jsonb,
  template_id uuid,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create indexes for tracker_entries
create index tracker_entries_user_date_idx on tracker_entries(user_id, entry_date);

-- Create indexes for tracker_emotions
create index tracker_emotions_entry_idx on tracker_emotions(tracker_entry_id);

-- Create indexes for activities
create index activities_user_date_idx on activities(user_id, date);
create index activities_status_idx on activities(status);

-- Enable RLS on tracker_entries
alter table tracker_entries enable row level security;

-- RLS policies for tracker_entries
create policy "Users can view own tracker entries" 
  on tracker_entries for select 
  using (auth.uid() = user_id);

create policy "Users can insert own tracker entries" 
  on tracker_entries for insert 
  with check (auth.uid() = user_id);

create policy "Users can update own tracker entries" 
  on tracker_entries for update 
  using (auth.uid() = user_id);

create policy "Users can delete own tracker entries" 
  on tracker_entries for delete 
  using (auth.uid() = user_id);

-- Enable RLS on tracker_emotions
alter table tracker_emotions enable row level security;

-- RLS policies for tracker_emotions
create policy "Users can view own emotions" 
  on tracker_emotions for select 
  using (exists (
    select 1 from tracker_entries 
    where id = tracker_emotions.tracker_entry_id 
    and user_id = auth.uid()
  ));

create policy "Users can insert own emotions" 
  on tracker_emotions for insert 
  with check (exists (
    select 1 from tracker_entries 
    where id = tracker_emotions.tracker_entry_id 
    and user_id = auth.uid()
  ));

create policy "Users can update own emotions" 
  on tracker_emotions for update 
  using (exists (
    select 1 from tracker_entries 
    where id = tracker_emotions.tracker_entry_id 
    and user_id = auth.uid()
  ));

create policy "Users can delete own emotions" 
  on tracker_emotions for delete 
  using (exists (
    select 1 from tracker_entries 
    where id = tracker_emotions.tracker_entry_id 
    and user_id = auth.uid()
  ));

-- Enable RLS on activities
alter table activities enable row level security;

-- RLS policies for activities
create policy "Users can manage own activities" 
  on activities for all 
  using (auth.uid() = user_id);

-- Add trigger to update updated_at timestamp for activities
create trigger on_activity_updated
  before update on activities
  for each row execute function public.handle_updated_at();