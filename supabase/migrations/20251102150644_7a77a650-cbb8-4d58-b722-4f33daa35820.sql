-- Add reminder settings to profiles table
alter table profiles 
add column if not exists tracker_frequency integer default 2,
add column if not exists tracker_times jsonb default '["09:00", "21:00"]'::jsonb,
add column if not exists morning_reflection_enabled boolean default true,
add column if not exists morning_reflection_time time default '08:00',
add column if not exists evening_reflection_enabled boolean default true,
add column if not exists evening_reflection_time time default '22:00',
add column if not exists onboarding_completed boolean default false;