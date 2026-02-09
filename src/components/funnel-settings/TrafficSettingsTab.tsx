import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Funnel } from "@/types/brand";
import { updateFunnel } from "@/services/brandService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save } from "lucide-react";

interface TrafficSettingsTabProps {
  funnel: Funnel;
  onUpdate?: () => void;
}

interface TrafficFormState {
  traffic_platform: string;
  traffic_campaign_name: string;
  traffic_start_date: string;
  traffic_audience_behavior: string;
  traffic_audience_interest: string;
  traffic_keyword: string;
  traffic_goal_campaign: string;
  traffic_notes: string;
}

const toDateInputValue = (dateString?: string | null) => {
  if (!dateString) return "";
  return dateString.slice(0, 10);
};

export function TrafficSettingsTab({ funnel, onUpdate }: TrafficSettingsTabProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<TrafficFormState>({
    traffic_platform: "",
    traffic_campaign_name: "",
    traffic_start_date: "",
    traffic_audience_behavior: "",
    traffic_audience_interest: "",
    traffic_keyword: "",
    traffic_goal_campaign: "",
    traffic_notes: "",
  });

  useEffect(() => {
    setFormData({
      traffic_platform: funnel.traffic_platform || "",
      traffic_campaign_name: funnel.traffic_campaign_name || "",
      traffic_start_date: toDateInputValue(funnel.traffic_start_date),
      traffic_audience_behavior: funnel.traffic_audience_behavior || "",
      traffic_audience_interest: funnel.traffic_audience_interest || "",
      traffic_keyword: funnel.traffic_keyword || "",
      traffic_goal_campaign: funnel.traffic_goal_campaign || "",
      traffic_notes: funnel.traffic_notes || "",
    });
  }, [funnel]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateFunnel(funnel.id, {
        traffic_platform: formData.traffic_platform.trim() || null,
        traffic_campaign_name: formData.traffic_campaign_name.trim() || null,
        traffic_start_date: formData.traffic_start_date || null,
        traffic_audience_behavior: formData.traffic_audience_behavior.trim() || null,
        traffic_audience_interest: formData.traffic_audience_interest.trim() || null,
        traffic_keyword: formData.traffic_keyword.trim() || null,
        traffic_goal_campaign: formData.traffic_goal_campaign.trim() || null,
        traffic_notes: formData.traffic_notes.trim() || null,
      });

      toast({ title: "Traffic metadata saved" });
      onUpdate?.();
    } catch (error) {
      console.error("Error saving traffic metadata:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save traffic metadata",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="traffic-platform">Platform</Label>
            <Input
              id="traffic-platform"
              value={formData.traffic_platform}
              onChange={(e) => setFormData({ ...formData, traffic_platform: e.target.value })}
              placeholder="Facebook Ads, Google Ads, TikTok Ads"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traffic-campaign">Campaign Name</Label>
            <Input
              id="traffic-campaign"
              value={formData.traffic_campaign_name}
              onChange={(e) => setFormData({ ...formData, traffic_campaign_name: e.target.value })}
              placeholder="Q1 Lead Gen - Jakarta"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="traffic-start-date">Start Date</Label>
            <Input
              id="traffic-start-date"
              type="date"
              value={formData.traffic_start_date}
              onChange={(e) => setFormData({ ...formData, traffic_start_date: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traffic-goal">Goal Campaign</Label>
            <Input
              id="traffic-goal"
              value={formData.traffic_goal_campaign}
              onChange={(e) => setFormData({ ...formData, traffic_goal_campaign: e.target.value })}
              placeholder="Leads, Purchases, WhatsApp"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="traffic-audience-behavior">Audience Behavior</Label>
            <Input
              id="traffic-audience-behavior"
              value={formData.traffic_audience_behavior}
              onChange={(e) => setFormData({ ...formData, traffic_audience_behavior: e.target.value })}
              placeholder="Engaged shoppers, video viewers"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="traffic-audience-interest">Audience Interest</Label>
            <Input
              id="traffic-audience-interest"
              value={formData.traffic_audience_interest}
              onChange={(e) => setFormData({ ...formData, traffic_audience_interest: e.target.value })}
              placeholder="Interior design, home improvement"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="traffic-keyword">Keyword / Targeting</Label>
          <Input
            id="traffic-keyword"
            value={formData.traffic_keyword}
            onChange={(e) => setFormData({ ...formData, traffic_keyword: e.target.value })}
            placeholder="renovasi rumah, kitchen set"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="traffic-notes">Catatan Funnel</Label>
          <Textarea
            id="traffic-notes"
            value={formData.traffic_notes}
            onChange={(e) => setFormData({ ...formData, traffic_notes: e.target.value })}
            placeholder="Catatan khusus untuk funnel ini"
            rows={4}
          />
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Traffic Metadata
          </Button>
        </div>
      </Card>
    </div>
  );
}
