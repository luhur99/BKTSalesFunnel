/**
 * Brand Card Component
 * Display brand with stats and actions
 */

import { ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/types/brand";

interface BrandCardProps {
  brand: Brand;
  onSelect: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BrandCard({ brand, onSelect, onEdit, onDelete }: BrandCardProps) {
  return (
    <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white/80 backdrop-blur cursor-pointer group">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: brand.color,
                backgroundImage: `linear-gradient(135deg, ${brand.color}, ${brand.color}dd)`,
              }}
            >
              <span className="text-white font-bold text-xl">
                {brand.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <CardTitle className="text-xl">{brand.name}</CardTitle>
              {brand.description && (
                <CardDescription className="mt-1">{brand.description}</CardDescription>
              )}
            </div>
          </div>
          
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit} className="cursor-pointer">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Brand
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="cursor-pointer text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Brand
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {brand.total_leads || 0}
            </div>
            <div className="text-xs text-slate-600 mt-1">Total Leads</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {brand.conversion_rate?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-slate-600 mt-1">Conversion</div>
          </div>
        </div>
        
        <Button
          onClick={onSelect}
          className="w-full gap-2"
          style={{ backgroundColor: brand.color }}
        >
          View Funnels
          <ArrowRight className="w-4 h-4" />
        </Button>
      </CardContent>
    </Card>
  );
}