-- CREATE TRIGGER: Fire before UPDATE of current_stage_id
CREATE TRIGGER trigger_auto_mark_lead_lost
BEFORE UPDATE OF current_stage_id ON leads
FOR EACH ROW
EXECUTE FUNCTION auto_mark_lead_lost();