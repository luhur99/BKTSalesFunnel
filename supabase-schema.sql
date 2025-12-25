-- BKT-Leads CRM Database Schema
-- PostgreSQL/Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Lead Sources Table
CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'facebook_ads', 'google_ads', 'social_media', 'manual'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funnel Types
CREATE TYPE funnel_type AS ENUM ('follow_up', 'broadcast');

-- Lead Status
CREATE TYPE lead_status AS ENUM ('active', 'deal', 'lost');

-- Stages Table (10 Follow Up + 10 Broadcast)
CREATE TABLE stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    funnel_type funnel_type NOT NULL,
    stage_number INTEGER NOT NULL,
    stage_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(funnel_type, stage_number)
);

-- Script Templates for Each Stage
CREATE TABLE stage_scripts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id UUID REFERENCES stages(id) ON DELETE CASCADE,
    script_text TEXT NOT NULL,
    media_links TEXT[], -- Array of media URLs
    image_url TEXT,
    video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    company VARCHAR(255),
    source_id UUID REFERENCES lead_sources(id),
    current_stage_id UUID REFERENCES stages(id),
    current_funnel funnel_type DEFAULT 'follow_up',
    status lead_status DEFAULT 'active',
    last_response_date TIMESTAMPTZ,
    last_response_note TEXT,
    deal_value DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Stage History (Track all movements)
CREATE TABLE lead_stage_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    from_stage_id UUID REFERENCES stages(id),
    to_stage_id UUID REFERENCES stages(id),
    from_funnel funnel_type,
    to_funnel funnel_type,
    reason VARCHAR(255), -- 'progression', 'no_response', 'responded', 'manual_move'
    notes TEXT,
    moved_by VARCHAR(100), -- Sales person name/ID
    moved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lead Activities/Interactions Log
CREATE TABLE lead_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    activity_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'whatsapp', 'meeting', 'note'
    description TEXT,
    response_received BOOLEAN DEFAULT FALSE,
    created_by VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_current_stage ON leads(current_stage_id);
CREATE INDEX idx_leads_current_funnel ON leads(current_funnel);
CREATE INDEX idx_lead_history_lead_id ON lead_stage_history(lead_id);
CREATE INDEX idx_lead_activities_lead_id ON lead_activities(lead_id);

-- Insert Default Stages
INSERT INTO stages (funnel_type, stage_number, stage_name, description) VALUES
-- Follow Up Funnel
('follow_up', 1, 'Initial Contact', 'First contact with lead'),
('follow_up', 2, 'Qualification', 'Qualify lead requirements'),
('follow_up', 3, 'Needs Analysis', 'Understand detailed needs'),
('follow_up', 4, 'Presentation', 'Present solution'),
('follow_up', 5, 'Demo Scheduled', 'Demo appointment set'),
('follow_up', 6, 'Demo Completed', 'Demo conducted'),
('follow_up', 7, 'Proposal Sent', 'Proposal delivered'),
('follow_up', 8, 'Negotiation', 'Price and terms discussion'),
('follow_up', 9, 'Final Review', 'Final decision pending'),
('follow_up', 10, 'Closing', 'Ready to close deal'),

-- Broadcast Funnel
('broadcast', 1, 'Re-engagement Start', 'Begin broadcast sequence'),
('broadcast', 2, 'Value Reminder', 'Remind of value proposition'),
('broadcast', 3, 'Case Study Share', 'Share success stories'),
('broadcast', 4, 'Limited Offer', 'Special offer communication'),
('broadcast', 5, 'Problem Highlight', 'Highlight pain points'),
('broadcast', 6, 'Social Proof', 'Share testimonials'),
('broadcast', 7, 'Last Attempt', 'Final personalized message'),
('broadcast', 8, 'Automation Check', 'Automated check-in'),
('broadcast', 9, 'Final Reminder', 'Last reminder before lost'),
('broadcast', 10, 'Archive Ready', 'Ready to mark as lost');

-- Insert Default Lead Sources
INSERT INTO lead_sources (name, type) VALUES
('Facebook Ads', 'facebook_ads'),
('Google Ads', 'google_ads'),
('Instagram', 'social_media'),
('LinkedIn', 'social_media'),
('Manual Entry', 'manual'),
('Website Form', 'manual');

-- Function to automatically move lead to LOST after stage 10 broadcast
CREATE OR REPLACE FUNCTION check_broadcast_stage_10()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.current_funnel = 'broadcast' AND 
       (SELECT stage_number FROM stages WHERE id = NEW.current_stage_id) = 10 THEN
        NEW.status = 'lost';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_broadcast_stage_10
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION check_broadcast_stage_10();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stage_scripts_updated_at
    BEFORE UPDATE ON stage_scripts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lead_sources_updated_at
    BEFORE UPDATE ON lead_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();