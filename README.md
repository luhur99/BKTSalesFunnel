# BKT-Leads CRM

Lead management CRM for Budi Karya Teknologi with a dual-funnel flow (Follow Up + Broadcast), stage-level copywriting, and analytics.

## Features

- Dual-funnel pipeline (Follow Up + Broadcast) with stage-level scripts
- Lead journey tracking and stage history
- Bottleneck analytics and stage velocity insights
- Funnel health and leakage stats
- Unified funnel journey report with traffic/campaign metadata
- Kanban and List views for leads

## Tech Stack

- Next.js 15
- TypeScript
- Supabase
- Tailwind CSS

## Setup

1) Install dependencies:

```bash
npm install
```

2) Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3) Run the dev server:

```bash
npm run dev
```

## Supabase Migrations

If you are running Supabase locally or apply schema changes manually, run the latest migration(s), including funnel traffic metadata:

```sql
alter table public.funnels
	add column if not exists traffic_platform text,
	add column if not exists traffic_campaign_name text,
	add column if not exists traffic_start_date date,
	add column if not exists traffic_audience_behavior text,
	add column if not exists traffic_audience_interest text,
	add column if not exists traffic_keyword text,
	add column if not exists traffic_goal_campaign text,
	add column if not exists traffic_notes text;
```

## Key Workflows

### Lead Journey Logic

1. New lead enters Follow Up stage 1
2. If lead does not respond, move to Broadcast funnel
3. If lead responds in Broadcast, move back to Follow Up
4. Broadcast final stage with no response -> Lost
5. Follow Up success -> Deal

### Funnel Traffic Metadata

Each funnel stores campaign context to analyze conversion performance:

- Platform (Facebook Ads, Google Ads, TikTok Ads)
- Campaign name and start date
- Audience behavior and interests
- Keyword / targeting
- Goal campaign
- Funnel notes

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run lint

## Notes

- Make sure Supabase Row Level Security (RLS) policies are configured properly.
- For analytics and journey reports, ensure `lead_stage_history` is populated.