-- Create journal sessions table
create table journal_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  session_type text check (session_type in ('morning', 'evening', 'free')) not null,
  started_at timestamp with time zone default now(),
  ended_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Create journal messages table
create table journal_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references journal_sessions on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  message_type text check (message_type in ('user', 'app')) not null,
  content text not null,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- Create indexes
create index journal_sessions_user_idx on journal_sessions(user_id, created_at desc);
create index journal_messages_session_idx on journal_messages(session_id, created_at);

-- Enable RLS
alter table journal_sessions enable row level security;
alter table journal_messages enable row level security;

-- Create RLS policies
create policy "Users can manage own sessions"
  on journal_sessions for all
  using (auth.uid() = user_id);

create policy "Users can manage own messages"
  on journal_messages for all
  using (auth.uid() = user_id);