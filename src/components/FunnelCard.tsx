/**
 * Funnel Card Component
 * Display funnel with stats and actions
 */

import { ArrowRight, Users, TrendingUp, Trash2 } from "lucide-react";
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
import { useState } from "react";
import { db } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface FunnelCardProps {
  funnel: Funnel;
  brandColor: string;
  onSelect: (funnelId: string) => void;
  onDelete?: () => void;
}

export function FunnelCard({ funnel, brandColor, onSelect, onDelete }: FunnelCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      console.log("🗑️ Deleting funnel:", funnel.id, funnel.name);
      
      await db.funnels.delete(funnel.id);
      
      console.log("✅ Funnel deleted successfully");
      
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
          </div>
          <div className="flex items-center gap-2 ml-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: brandColor }}
            />
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
                  <AlertDialogTitle>⚠️ Hapus Funnel "{funnel.name}"?</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p className="font-semibold text-red-600">
                      Tindakan ini tidak dapat dibatalkan!
                    </p>
                    <p>
                      Menghapus funnel ini akan menghapus:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>Semua leads di funnel ini ({funnel.total_leads_count || 0} leads)</li>
                      <li>Semua stages di funnel ini</li>
                      <li>Semua activities terkait</li>
                      <li>Semua stage history terkait</li>
                    </ul>
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
    </Card>
  );
}