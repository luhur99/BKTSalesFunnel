import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Funnel } from "@/types/brand";
import { FunnelStagesTab } from "./funnel-settings/FunnelStagesTab";
import { ScriptTemplatesTab } from "./funnel-settings/ScriptTemplatesTab";
import { CustomLabelsTab } from "./funnel-settings/CustomLabelsTab";

interface FunnelSettingsDialogProps {
  funnel: Funnel;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function FunnelSettingsDialog({
  funnel,
  isOpen,
  onClose,
  onUpdate,
}: FunnelSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("stages");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Funnel Settings</DialogTitle>
          <DialogDescription>
            Customize stages, scripts, and labels for {funnel.name}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="stages">Funnel Stages</TabsTrigger>
            <TabsTrigger value="scripts">Script Templates</TabsTrigger>
            <TabsTrigger value="labels">Custom Labels</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto mt-4">
            <TabsContent value="stages" className="h-full m-0">
              <FunnelStagesTab funnelId={funnel.id} onUpdate={onUpdate} />
            </TabsContent>

            <TabsContent value="scripts" className="h-full m-0">
              <ScriptTemplatesTab funnelId={funnel.id} onUpdate={onUpdate} />
            </TabsContent>

            <TabsContent value="labels" className="h-full m-0">
              <CustomLabelsTab funnelId={funnel.id} onUpdate={onUpdate} />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}