/**
 * Brand Selector Component
 * Dropdown for selecting active brand across the app
 */

import { useState, useEffect } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Brand } from "@/types/brand";
import { brandService } from "@/services/brandService";

interface BrandSelectorProps {
  selectedBrandId: string | null;
  onBrandSelect: (brandId: string | null) => void;
  showAllBrands?: boolean;
  onManageBrands?: () => void;
}

export function BrandSelector({
  selectedBrandId,
  onBrandSelect,
  showAllBrands = true,
  onManageBrands,
}: BrandSelectorProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedBrand = brands.find((b) => b.id === selectedBrandId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="min-w-[200px] justify-between"
          disabled={loading}
        >
          <div className="flex items-center gap-2">
            {selectedBrand ? (
              <>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedBrand.color }}
                />
                <span>{selectedBrand.name}</span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                <span>All Brands</span>
              </>
            )}
          </div>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        {showAllBrands && (
          <>
            <DropdownMenuItem
              onClick={() => onBrandSelect(null)}
              className="cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                  <span>All Brands</span>
                </div>
                {!selectedBrandId && <Check className="w-4 h-4" />}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {brands.map((brand) => (
          <DropdownMenuItem
            key={brand.id}
            onClick={() => onBrandSelect(brand.id)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: brand.color }}
                />
                <div className="flex flex-col">
                  <span className="font-medium">{brand.name}</span>
                  {brand.description && (
                    <span className="text-xs text-muted-foreground">
                      {brand.description}
                    </span>
                  )}
                </div>
              </div>
              {selectedBrandId === brand.id && <Check className="w-4 h-4" />}
            </div>
          </DropdownMenuItem>
        ))}

        {brands.length === 0 && !loading && (
          <div className="px-2 py-6 text-center text-sm text-muted-foreground">
            No brands found
          </div>
        )}

        {onManageBrands && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onManageBrands}
              className="cursor-pointer text-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Manage Brands</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}