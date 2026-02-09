-- Add traffic and campaign metadata fields to funnels
alter table public.funnels
  add column if not exists traffic_platform text,
  add column if not exists traffic_campaign_name text,
  add column if not exists traffic_start_date date,
  add column if not exists traffic_audience_behavior text,
  add column if not exists traffic_audience_interest text,
  add column if not exists traffic_keyword text,
  add column if not exists traffic_goal_campaign text,
  add column if not exists traffic_notes text;
