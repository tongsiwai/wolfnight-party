-- WolfNight Party - Rooms table for multi-device game state sync
-- Run this in your Supabase project's SQL Editor

-- Create rooms table
create table if not exists public.rooms (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  game_state jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.rooms enable row level security;

-- Allow full public access (no login needed for party game)
create policy "Public rooms - select"
  on public.rooms for select using (true);

create policy "Public rooms - insert"
  on public.rooms for insert with check (true);

create policy "Public rooms - update"
  on public.rooms for update using (true);

create policy "Public rooms - delete"
  on public.rooms for delete using (true);

-- Add rooms table to realtime publication so players receive live updates
alter publication supabase_realtime add table public.rooms;

-- Index for cleanup queries
create index if not exists rooms_created_at_idx on public.rooms (created_at);
create index if not exists rooms_code_idx on public.rooms (code);
