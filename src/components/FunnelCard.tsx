/**
 * Funnel Card Component
 * Display funnel with stats and actions
 */

import { ArrowRight, Users, TrendingUp, Trash2, Pencil } from "lucide-react";

const log = process.env.NODE_ENV === "development" ? console.log : () => {};
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Funnel } from "@/types/brand";
import type { CustomLabel } from "@/types/lead";
import { useState } from "react";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { EditFunnelModal } from "@/components/EditFunnelModal";

interface FunnelCardProps {
  funnel: Funnel;
  brandColor: string;
  labels?: CustomLabel[];
  onSelect: (funnelId: string) => void;
  onDelete?: () => void;
  onUpdated?: () => void;
}

const LABEL_COLOR_CLASSES: Record<string, string> = {
  red: "bg-red-50 text-red-700 border-red-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  amber: "bg-amber-50 text-amber-700 border-amber-200",
  yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
  lime: "bg-lime-50 text-lime-700 border-lime-200",
  green: "bg-green-50 text-green-700 border-green-200",
  emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
  teal: "bg-teal-50 text-teal-700 border-teal-200",
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
  sky: "bg-sky-50 text-sky-700 border-sky-200",
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  violet: "bg-violet-50 text-violet-700 border-violet-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  fuchsia: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  pink: "bg-pink-50 text-pink-700 border-pink-200",
  rose: "bg-rose-50 text-rose-700 border-rose-200",
  slate: "bg-slate-50 text-slate-700 border-slate-200",
};

export function FunnelCard({ funnel, brandColor, labels = [], onSelect, onDelete, onUpdated }: FunnelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      log("🗑️ Deleting funnel:", funnel.id, funnel.name);
      
      await db.funnels.delete(funnel.id);
      
      log("✅ Funnel deleted successfully");
      
      toast({
        title: "✅ Funnel Berhasil Dihapus",
        description: `Funnel "${funnel.name}" dan semua data terkait telah dihapus.`,
      });
      
      setShowDeleteDialog(false);
      
      // Call parent refresh
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error("❌ Error deleting funnel:", error);
      toast({
        title: "❌ Gagal Menghapus Funnel",
        description: error instanceof Error ? error.message : "Terjadi kesalahan saat menghapus funnel",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-2 hover:border-slate-300">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{funnel.name}</CardTitle>
            {funnel.description && (
              <CardDescription className="line-clamp-2">
                {funnel.description}
              </CardDescription>
            )}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {labels.map((label) => (
                  <span
                    key={label.id}
                    className={`text-xs border rounded-full px-2 py-0.5 ${LABEL_COLOR_CLASSES[label.color] || "bg-slate-50 text-slate-700 border-slate-200"}`}
                  >
                    {label.name}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: brandColor }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              onClick={() => setShowEditModal(true)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  disabled={isDeleting}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Funnel?</AlertDialogTitle>
                  <AlertDialogDescription asChild>
                    <div>
                      <p className="mb-2">
                        Tindakan ini akan menghapus funnel <strong>{funnel.name}</strong> beserta:
                      </p>
                      <ul className="list-disc list-inside space-y-1 mb-2">
                        <li>Semua leads di funnel ini</li>
                        <li>Semua activities</li>
                        <li>Semua stage history</li>
                      </ul>
                      <p className="text-destructive font-semibold">
                        Tindakan ini tidak dapat dibatalkan!
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? "Menghapus..." : "Ya, Hapus Funnel"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-slate-600 text-sm mb-1">
              <Users className="w-4 h-4" />
              <span>Total Leads</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">
              {funnel.total_leads_count || 0}
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-600 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Active</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {funnel.is_active ? "Yes" : "No"}
            </div>
          </div>
        </div>

        <Button 
          onClick={() => onSelect(funnel.id)}
          className="w-full gap-2"
          style={{ backgroundColor: brandColor }}
        >
          Manage Leads
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>

      {showEditModal && (
        <EditFunnelModal
          funnel={funnel}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdated={onUpdated}
        />
      )}
    </Card>
  );
}