import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Building2, Clock, MessageSquare } from "lucide-react";
import { Lead, Stage } from "@/types/lead";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable, useDroppable } from "@dnd-kit/core";

interface LeadKanbanProps {
  leads: Lead[];
  funnelType?: "follow_up" | "broadcast";
  brandId?: string;
  funnelId?: string;
  stages: Stage[];
  onLeadClick?: (lead: Lead) => void;
  onLeadsUpdated?: () => void;
}

interface DraggableLeadCardProps {
  lead: Lead;
  onClick: () => void;
}

interface DroppableStageColumnProps {
  stage: Stage;
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

function DraggableLeadCard({ lead, onClick }: DraggableLeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="cursor-grab hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200 active:cursor-grabbing"
      onClick={(e) => {
        if (!isDragging) {
          onClick();
        }
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-slate-900 mb-1">{lead.name}</h4>
            {lead.company && (
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Building2 className="w-3 h-3" />
                {lead.company}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {lead.phone && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Phone className="w-3 h-3" />
              {lead.phone}
            </div>
          )}
          {lead.email && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mail className="w-3 h-3" />
              {lead.email}
            </div>
          )}
        </div>

        {lead.last_response_date && (
          <div className="mt-3 pt-3 border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock className="w-3 h-3" />
              Last response: {new Date(lead.last_response_date).toLocaleDateString()}
            </div>
            {lead.last_response_note && (
              <div className="flex items-start gap-2 mt-1 text-xs text-slate-600">
                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span className="line-clamp-2">{lead.last_response_note}</span>
              </div>
            )}
          </div>
        )}

        {lead.source && (
          <div className="mt-3">
            <Badge variant="outline" className="text-xs">
              {lead.source.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DroppableStageColumn({ stage, leads, onLeadClick }: DroppableStageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
    data: { stage },
  });

  const getStageColor = (stageNumber: number) => {
    if (stageNumber <= 3) return "from-blue-500 to-blue-600";
    if (stageNumber <= 6) return "from-indigo-500 to-indigo-600";
    if (stageNumber <= 9) return "from-purple-500 to-purple-600";
    return "from-green-500 to-green-600";
  };

  return (
    <div className="flex-shrink-0 w-80">
      <div className={`bg-gradient-to-br ${getStageColor(stage.stage_number)} rounded-t-lg p-4 text-white`}>
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium opacity-90">Stage {stage.stage_number}</div>
          <Badge variant="secondary" className="bg-white/20 text-white border-0">
            {leads.length}
          </Badge>
        </div>
        <h3 className="font-bold text-lg">{stage.stage_name}</h3>
        <p className="text-sm opacity-80 mt-1">{stage.description}</p>
      </div>

      <div
        ref={setNodeRef}
        className={`space-y-3 p-3 rounded-b-lg min-h-[200px] transition-colors ${
          isOver ? "bg-blue-100 border-2 border-blue-400" : "bg-slate-50"
        }`}
      >
        {leads.map((lead) => (
          <DraggableLeadCard
            key={lead.id}
            lead={lead}
            onClick={() => onLeadClick(lead)}
          />
        ))}

        {leads.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <div className="text-sm">
              {isOver ? "Drop lead here" : "No leads in this stage"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LeadKanban({ leads, funnelType, stages, onLeadClick, onLeadsUpdated }: LeadKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const filteredStages = funnelType
    ? stages.filter(s => s.funnel_type === funnelType)
    : stages;

  const getLeadsByStage = (stageId: string) => {
    return leads.filter(lead => lead.current_stage_id === stageId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStageId = over.id as string;
    const lead = leads.find(l => l.id === leadId);
    const newStage = filteredStages.find(s => s.id === newStageId);

    if (!lead || !newStage || lead.current_stage_id === newStageId) {
      return;
    }

    try {
      console.log("🔄 Kanban: Moving lead via drag & drop");
      await db.leads.update(leadId, {
        current_stage_id: newStageId,
      });

      toast({
        title: "Lead Moved",
        description: `${lead.name} moved to ${newStage.stage_name}`,
      });

      // Trigger parent refresh
      if (onLeadsUpdated) {
        console.log("🔄 Kanban: Calling onLeadsUpdated callback");
        onLeadsUpdated();
      }
    } catch (error) {
      console.error("❌ Kanban: Error moving lead:", error);
      
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to move lead. Please try again.",
      });
    }
  };

  const handleLeadClick = (lead: Lead) => {
    if (onLeadClick) {
      onLeadClick(lead);
    }
  };

  const activeLead = activeId ? leads.find(l => l.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {filteredStages.map((stage) => (
          <DroppableStageColumn
            key={stage.id}
            stage={stage}
            leads={getLeadsByStage(stage.id)}
            onLeadClick={handleLeadClick}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <Card className="w-80 opacity-90 rotate-3 shadow-2xl">
            <CardContent className="p-4">
              <h4 className="font-semibold text-slate-900">{activeLead.name}</h4>
              {activeLead.company && (
                <div className="flex items-center gap-1 text-xs text-slate-600 mt-1">
                  <Building2 className="w-3 h-3" />
                  {activeLead.company}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}