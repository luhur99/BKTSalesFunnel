import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { db } from "@/lib/supabase";
import { Stage } from "@/types/lead";
import { Loader2, Save, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ScriptTemplatesTabProps {
  funnelId: string;
  onUpdate?: () => void;
}

export function ScriptTemplatesTab({ funnelId }: ScriptTemplatesTabProps) {
  const [stages, setStages] = useState<Stage[]>([]);
  const [selectedStageId, setSelectedStageId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [scriptText, setScriptText] = useState("");
  const [mediaLinks, setMediaLinks] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadStages();
  }, [funnelId]);

  useEffect(() => {
    if (selectedStageId) {
      loadScript(selectedStageId);
    } else {
      setScriptText("");
      setMediaLinks([]);
    }
  }, [selectedStageId]);

  const loadStages = async () => {
    try {
      setLoading(true);
      const data = await db.stages.getByFunnel(funnelId);
      setStages(data);
      if (data.length > 0 && !selectedStageId) {
        setSelectedStageId(data[0].id);
      }
    } catch (error) {
      console.error("Error loading stages:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load stages",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScript = async (stageId: string) => {
    try {
      const script = await db.scripts.getByStage(stageId);
      if (script) {
        setScriptText(script.script_text || "");
        setMediaLinks(script.media_links || []);
      } else {
        setScriptText("");
        setMediaLinks([]);
      }
    } catch (error) {
      console.error("Error loading script:", error);
    }
  };

  const handleSave = async () => {
    if (!selectedStageId) return;

    try {
      setSaving(true);
      await db.scripts.upsert({
        stage_id: selectedStageId,
        script_text: scriptText,
        media_links: mediaLinks,
      });
      
      toast({ title: "Script template saved successfully" });
    } catch (error) {
      console.error("Error saving script:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save script template",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && stages.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="w-[300px]">
          <Label>Select Stage</Label>
          <Select value={selectedStageId} onValueChange={setSelectedStageId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a stage..." />
            </SelectTrigger>
            <SelectContent>
              {stages.map((stage) => (
                <SelectItem key={stage.id} value={stage.id}>
                  {stage.stage_name} ({stage.funnel_type})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSave} disabled={saving || !selectedStageId}>
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {!saving && <Save className="w-4 h-4 mr-2" />}
          Save Template
        </Button>
      </div>

      <Card className="flex-1 p-6 flex flex-col gap-4">
        {selectedStageId ? (
          <Tabs defaultValue="text" className="flex-1 flex flex-col">
            <TabsList>
              <TabsTrigger value="text">Script Text</TabsTrigger>
              <TabsTrigger value="media">Media & Links</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="flex-1 mt-4">
              <div className="h-full flex flex-col gap-2">
                <Label>Message Template</Label>
                <p className="text-sm text-muted-foreground">
                  Use this template to quickly send messages to leads in this stage.
                </p>
                <Textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Type your message script here..."
                  className="flex-1 min-h-[300px] resize-none font-mono text-sm"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Attachment URLs</Label>
                  <p className="text-sm text-muted-foreground">
                    Add links to images, documents, or videos that should be sent with this script.
                  </p>
                  <Textarea
                    value={mediaLinks.join("\n")}
                    onChange={(e) => setMediaLinks(e.target.value.split("\n").filter(Boolean))}
                    placeholder="https://example.com/image.jpg&#10;https://example.com/brochure.pdf"
                    className="h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">Enter one URL per line</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a stage to edit its script template</p>
          </div>
        )}
      </Card>
    </div>
  );
}