import { useState, useEffect } from "react";

const log = process.env.NODE_ENV === "development" ? console.log : () => {};
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowLeft, Plus, FolderKanban, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FunnelCard } from "@/components/FunnelCard";
import { AddFunnelModal } from "@/components/AddFunnelModal";
import { Brand, Funnel, CreateFunnelInput } from "@/types/brand";
import type { CustomLabel } from "@/types/lead";
import { brandService } from "@/services/brandService";
import { useToast } from "@/hooks/use-toast";
import { db, supabase } from "@/lib/supabase";

export default function BrandPage() {
  const router = useRouter();
  const { brandId } = router.query;
  const { toast } = useToast();

  const [brand, setBrand] = useState<Brand | null>(null);
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [funnelLabels, setFunnelLabels] = useState<Record<string, CustomLabel[]>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
      } else if (brandId && typeof brandId === "string") {
        loadBrandData(brandId);
      }
    });
  }, [brandId, router]);

  const loadBrandData = async (id: string) => {
    try {
      setLoading(true);
      
      log("🔍 Loading brand data for ID:", id);
      
      // Load brand info
      const brandData = await brandService.getBrandById(id);
      if (!brandData) {
        toast({
          title: "Error",
          description: "Brand not found",
          variant: "destructive",
        });
        router.push("/dashboard");
        return;
      }
      setBrand(brandData);
      log("✅ Brand loaded:", brandData.name);

      // Load funnels for this brand
      const funnelsData = await brandService.getFunnelsByBrand(id);
      log("✅ Funnels loaded:", funnelsData.length, "funnels");
      log("📊 Funnel details:", funnelsData);
      setFunnels(funnelsData);
      await loadFunnelLabels(funnelsData);

    } catch (error) {
      console.error("❌ Error loading brand data:", error);
      toast({
        title: "Error",
        description: "Failed to load brand data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddFunnel = async (input: CreateFunnelInput) => {
    if (!brandId || typeof brandId !== "string") return;

    try {
      const created = await brandService.createFunnel(input);
      setFunnels([...funnels, created]);
      setShowAddModal(false);

      toast({
        title: "Success",
        description: "Funnel created successfully",
      });
    } catch (error) {
      console.error("Error adding funnel:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create funnel",
        variant: "destructive",
      });
      throw error; // Let modal handle the error
    }
  };

  const handleSelectFunnel = (funnelId: string) => {
    router.push(`/brand/${brandId}/funnel/${funnelId}`);
  };

  const loadFunnelLabels = async (funnelsData: Funnel[]) => {
    if (funnelsData.length === 0) {
      setFunnelLabels({});
      return;
    }

    try {
      const entries = await Promise.all(
        funnelsData.map(async (funnel) => {
          const labels = await db.labels.getByFunnel(funnel.id);
          const funnelOnly = labels.filter((label: CustomLabel) => label.funnel_id === funnel.id);
          return [funnel.id, funnelOnly] as const;
        })
      );

      setFunnelLabels(Object.fromEntries(entries));
    } catch (error) {
      console.error("Error loading funnel labels:", error);
      setFunnelLabels({});
    }
  };

  // Calculate total leads across all funnels
  const totalLeads = funnels.reduce((sum, f) => sum + (f.total_leads_count || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading brand data...</p>
        </div>
      </div>
    );
  }

  if (!brand) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{brand.name} - Funnels - BKT-Leads</title>
        <meta name="description" content={`Manage funnels for ${brand.name}`} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Header */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1800px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Back + Brand Info */}
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Brands
                  </Button>
                </Link>
                
                <div className="h-8 w-px bg-slate-300"></div>

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
                    <h1 className="text-2xl font-bold text-slate-900">{brand.name}</h1>
                    {brand.description && (
                      <p className="text-sm text-slate-500">{brand.description}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="gap-2"
                  style={{ backgroundColor: brand.color }}
                >
                  <Plus className="w-4 h-4" />
                  Add Funnel
                </Button>

                <Link href="/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    <SettingsIcon className="w-4 h-4" />
                    Settings
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1800px] mx-auto px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Funnels</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{funnels.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Leads</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">{totalLeads}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Active Funnels</p>
                  <p className="text-3xl font-bold text-slate-900 mt-1">
                    {funnels.filter(f => f.is_active).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FolderKanban className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Funnels Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Funnels</h2>
            <p className="text-slate-600">
              Select a funnel to manage its leads or create a new one
            </p>
          </div>

          {/* Funnels Grid */}
          {funnels.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {funnels.map((funnel) => (
                <FunnelCard
                  key={funnel.id}
                  funnel={funnel}
                  brandColor={brand.color}
                  labels={funnelLabels[funnel.id] || []}
                  onSelect={handleSelectFunnel}
                  onDelete={() => loadBrandData(brandId as string)}
                  onUpdated={() => loadBrandData(brandId as string)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
              <FolderKanban className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No Funnels Yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Get started by creating your first funnel for {brand.name}. 
                Each funnel can have its own lead management pipeline.
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="gap-2"
                style={{ backgroundColor: brand.color }}
              >
                <Plus className="w-4 h-4" />
                Create First Funnel
              </Button>
            </div>
          )}
        </main>

        {/* Add Funnel Modal */}
        {showAddModal && brand && (
          <AddFunnelModal
            brandId={brand.id}
            brandName={brand.name}
            onAdd={handleAddFunnel}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </div>
    </>
  );
}