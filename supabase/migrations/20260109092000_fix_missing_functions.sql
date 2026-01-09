-- Migration: Fix Missing RPC Functions for Analytics
-- Created: 2026-01-09
-- Purpose: Add get_daily_stage_movements and get_lead_journey_analytics functions

-- ==============================================
-- Function 1: Get Daily Stage Movements
-- ==============================================
DROP FUNCTION IF EXISTS get_daily_stage_movements(DATE, DATE);

CREATE OR REPLACE FUNCTION get_daily_stage_movements(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  movement_date DATE,
  from_stage_name VARCHAR,
  to_stage_name VARCHAR,
  from_funnel TEXT,
  to_funnel TEXT,
  is_funnel_switch BOOLEAN,
  total_movements BIGINT,
  movement_reasons JSONB
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH movement_data AS (
    SELECT 
      DATE(lsh.moved_at) AS mv_date,
      s_from.stage_name AS from_stage,
      s_to.stage_name AS to_stage,
      lsh.from_funnel::TEXT AS from_f,
      lsh.to_funnel::TEXT AS to_f,
      (lsh.from_funnel != lsh.to_funnel) AS is_switch,
      lsh.reason
    FROM lead_stage_history lsh
    JOIN stages s_from ON lsh.from_stage_id = s_from.id
    JOIN stages s_to ON lsh.to_stage_id = s_to.id
    WHERE DATE(lsh.moved_at) BETWEEN start_date AND end_date
  ),
  reason_counts AS (
    SELECT 
      mv_date,
      from_stage,
      to_stage,
      from_f,
      to_f,
      is_switch,
      reason,
      COUNT(*) AS reason_count
    FROM movement_data
    GROUP BY mv_date, from_stage, to_stage, from_f, to_f, is_switch, reason
  )
  SELECT 
    rc.mv_date AS movement_date,
    rc.from_stage AS from_stage_name,
    rc.to_stage AS to_stage_name,
    rc.from_f AS from_funnel,
    rc.to_f AS to_funnel,
    rc.is_switch AS is_funnel_switch,
    SUM(rc.reason_count) AS total_movements,
    jsonb_object_agg(
      COALESCE(rc.reason, 'unknown'), 
      rc.reason_count
    ) AS movement_reasons
  FROM reason_counts rc
  GROUP BY rc.mv_date, rc.from_stage, rc.to_stage, rc.from_f, rc.to_f, rc.is_switch
  ORDER BY rc.mv_date DESC, total_movements DESC;
END;
$$;

-- ==============================================
-- Function 2: Get Lead Journey Analytics
-- ==============================================
DROP FUNCTION IF EXISTS get_lead_journey_analytics(UUID);

CREATE OR REPLACE FUNCTION get_lead_journey_analytics(
  p_lead_id UUID
)
RETURNS TABLE (
  lead_id UUID,
  lead_name VARCHAR,
  total_journey_days NUMERIC,
  current_status VARCHAR,
  current_funnel TEXT,
  current_stage_name VARCHAR,
  stages_history JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH lead_info AS (
    SELECT 
      l.id AS lead_id,
      l.name AS lead_name,
      EXTRACT(DAY FROM (CURRENT_TIMESTAMP - l.created_at)) AS journey_days,
      l.status,
      l.current_funnel::TEXT AS funnel,
      s.stage_name
    FROM leads l
    LEFT JOIN stages s ON l.current_stage_id = s.id
    WHERE l.id = p_lead_id
  ),
  stage_windows AS (
    SELECT
      lsh.lead_id AS history_lead_id,
      s_from.stage_name,
      s_from.stage_number,
      lsh.from_funnel::TEXT AS funnel_type,
      lsh.moved_at AS entered_at,
      LEAD(lsh.moved_at) OVER (PARTITION BY lsh.lead_id ORDER BY lsh.moved_at) AS exited_at,
      lsh.reason,
      lsh.notes
    FROM lead_stage_history lsh
    JOIN stages s_from ON lsh.from_stage_id = s_from.id
    WHERE lsh.lead_id = p_lead_id
  ),
  history_data AS (
    SELECT
      sw.history_lead_id,
      jsonb_agg(
        jsonb_build_object(
          'stage_name', sw.stage_name,
          'stage_number', sw.stage_number,
          'funnel_type', sw.funnel_type,
          'entered_at', sw.entered_at,
          'exited_at', sw.exited_at,
          'days_in_stage', COALESCE(
            EXTRACT(DAY FROM (sw.exited_at - sw.entered_at))::NUMERIC, 
            EXTRACT(DAY FROM (CURRENT_TIMESTAMP - sw.entered_at))::NUMERIC
          ),
          'reason', sw.reason,
          'notes', sw.notes
        )
        ORDER BY sw.entered_at
      ) AS stages_history
    FROM stage_windows sw
    GROUP BY sw.history_lead_id
  )
  SELECT 
    li.lead_id,
    li.lead_name,
    li.journey_days,
    li.status,
    li.funnel,
    li.stage_name,
    COALESCE(hd.stages_history, '[]'::JSONB) AS stages_history
  FROM lead_info li
  LEFT JOIN history_data hd ON li.lead_id = hd.history_lead_id;
END;
$$;

-- ==============================================
-- Verification Queries
-- ==============================================

-- Test 1: Verify get_daily_stage_movements exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_daily_stage_movements'
  ) THEN
    RAISE NOTICE '✅ Function get_daily_stage_movements created successfully';
  ELSE
    RAISE EXCEPTION '❌ Function get_daily_stage_movements creation failed';
  END IF;
END $$;

-- Test 2: Verify get_lead_journey_analytics exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_lead_journey_analytics'
  ) THEN
    RAISE NOTICE '✅ Function get_lead_journey_analytics created successfully';
  ELSE
    RAISE EXCEPTION '❌ Function get_lead_journey_analytics creation failed';
  END IF;
END $$;