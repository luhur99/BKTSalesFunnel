-- DROP broken triggers
DROP TRIGGER IF EXISTS trigger_auto_mark_lead_lost ON leads;
DROP TRIGGER IF EXISTS trigger_broadcast_stage_10 ON leads;