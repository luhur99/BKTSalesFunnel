import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { Plus, Settings as SettingsIcon, BookOpen, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/BrandCard";
import { AddBrandModal } from "@/components/AddBrandModal";
import { Brand } from "@/types/brand";
import { brandService } from "@/services/brandService";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    // Check authentication
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (!isLoggedIn) {
      router.push("/");
      return;
    }

    loadBrands();
  }, [router]);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error loading brands:", error);
      toast({
        title: "Error",
        description: "Failed to load brands",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBrand = (brandId: string) => {
    router.push(`/brand/${brandId}`);
  };

  const handleAddBrandSuccess = () => {
    toast({
      title: "Success",
      description: "Brand created successfully",
    });
    loadBrands(); // Refresh brand list
    setShowAddModal(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    router.push("/");
  };

  return (
    <>
      <Head>
        <title>BKT-Leads - Dashboard CRM Budi Karya Teknologi</title>
        <meta name="description" content="Sistem manajemen leads dengan dual-funnel: Follow Up & Broadcast" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-[1600px] mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    BKT-Leads
                  </h1>
                  <p className="text-sm text-slate-500 font-medium">Budi Karya Teknologi CRM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/analytics-report">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Analytics Report
                  </Button>
                </Link>
                <Link href="/guide">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Panduan
                  </Button>
                </Link>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setShowAddModal(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add New Brand
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-[1600px] mx-auto px-6 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Your Brands</h2>
                <p className="text-slate-600 mt-2">
                  Select a brand to manage leads and view funnels
                </p>
              </div>
              <Button 
                className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                onClick={() => setShowAddModal(true)}
              >
                <Plus className="w-4 h-4" />
                Add New Brand
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-white/50 rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          {/* Brands Grid */}
          {!loading && brands.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {brands.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  onSelect={() => handleSelectBrand(brand.id)}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && brands.length === 0 && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-12 h-12 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Brands Yet</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Create your first brand to start managing leads and tracking conversions
              </p>
              <Link href="/settings?tab=brands">
                <Button className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  <Plus className="w-4 h-4" />
                  Create Your First Brand
                </Button>
              </Link>
            </div>
          )}
        </main>

        {/* Add Brand Modal */}
        {showAddModal && (
          <AddBrandModal
            onClose={() => setShowAddModal(false)}
            onSuccess={handleAddBrandSuccess}
          />
        )}
      </div>
    </>
  );
}