create index if not exists analytics_events_user_id_idx
  on public.analytics_events (user_id)
  where user_id is not null;
