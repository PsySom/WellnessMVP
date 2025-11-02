-- Add additional profile and settings fields
alter table public.profiles
  add column if not exists bio text,
  add column if not exists theme text default 'light',
  add column if not exists language text default 'en',
  add column if not exists font_size text default 'medium',
  add column if not exists high_contrast boolean default false,
  add column if not exists reduce_motion boolean default false,
  add column if not exists notifications_enabled boolean default true,
  add column if not exists activity_reminders_enabled boolean default true,
  add column if not exists activity_reminder_minutes integer default 15,
  add column if not exists analytics_enabled boolean default true,
  add column if not exists color_scheme text default 'purple';

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- RLS policies for avatars bucket
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars' 
    and auth.uid()::text = (storage.foldername(name))[1]
  );