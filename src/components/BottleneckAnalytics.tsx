import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users, Facebook, Globe, Share2, UserPlus } from "lucide-react";
import { db } from "@/lib/supabase";
import { BottleneckAnalytics as BottleneckData } from "@/types/lead";

interface BottleneckAnalyticsProps {
  key?: string;
}

interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

export function BottleneckAnalytics({ key }: BottleneckAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BottleneckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, [key]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await db.analytics.getBottleneckAnalytics();
      setAnalytics(data);
      
      // Load source breakdown
      await loadSourceBreakdown();
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceBreakdown = async () => {
    try {
      const leads = await db.leads.getAll();
      
      // Group by source
      const sourceMap = new Map<string, number>();
      leads.forEach(lead => {
        const source = lead.source || "Unknown";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });
      
      // Calculate percentages
      const total = leads.length;
      const breakdown: SourceBreakdown[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
      
      // Sort by count descending
      breakdown.sort((a, b) => b.count - a.count);
      
      setSourceBreakdown(breakdown);
    } catch (error) {
      console.error("Error loading source breakdown:", error);
    }
  };

  const getSourceIcon = (source: string) => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes("facebook")) return Facebook;
    if (lowerSource.includes("google")) return Globe;
    if (lowerSource.includes("social")) return Share2;
    return UserPlus;
  };

  const getSourceColor = (index: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500"
    ];
    return colors[index % colors.length];
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getConversionBadge = (rate: number) => {
    // Cap at 100% for display (data quality issue if > 100%)
    const displayRate = Math.min(rate, 100);
    if (displayRate >= 70) return { color: "bg-green-100 text-green-700 border-green-200", icon: TrendingUp };
    if (displayRate >= 50) return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: TrendingUp };
    return { color: "bg-red-100 text-red-700 border-red-200", icon: TrendingDown };
  };

  const getBottleneckStages = () => {
    return analytics
      .filter(stage => stage.conversion_rate < 50 && stage.leads_stuck > 0)
      .sort((a, b) => a.conversion_rate - b.conversion_rate);
  };

  const getTopPerformingStages = () => {
    return analytics
      .filter(stage => stage.conversion_rate >= 70)
      .sort((a, b) => b.conversion_rate - a.conversion_rate)
      .slice(0, 5);
  };

  const getOverallStats = async () => {
    // Get stats directly from database - more reliable than summing analytics
    const stats = await db.leads.getStats();
    
    return { 
      totalEntered: stats.total_leads,
      totalProgressing: stats.leads_progressing,
      totalStuck: stats.leads_stuck,
      lostLeadsCount: stats.lost_leads
    };
  };

  const [stats, setStats] = useState({ totalEntered: 0, totalProgressing: 0, totalStuck: 0, lostLeadsCount: 0 });

  useEffect(() => {
    getOverallStats().then(setStats);
  }, [analytics]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const bottlenecks = getBottleneckStages();
  const topPerformers = getTopPerformingStages();

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Source Breakdown Card */}
        <Card className="border-slate-200 bg-white md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              Lead Masuk by Source
            </CardTitle>
            <CardDescription className="text-xs">Breakdown traffic source</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourceBreakdown.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Tidak ada data source</p>
            ) : (
              <>
                {sourceBreakdown.map((item, index) => {
                  const Icon = getSourceIcon(item.source);
                  return (
                    <div key={item.source} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-slate-600" />
                          <span className="font-medium text-slate-700">{item.source}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-slate-900 font-semibold">{item.count}</span>
                          <span className="text-slate-500 text-xs">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full ${getSourceColor(index)} transition-all duration-500`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div className="pt-2 mt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">Total Leads:</span>
                    <span className="font-bold text-slate-900">{sourceBreakdown.reduce((sum, s) => sum + s.count, 0)}</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Leads Progressing</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalProgressing}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Leads Stuck</p>
                <p className="text-3xl font-bold text-red-600">{stats.totalStuck}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Lost Leads</p>
                <p className="text-3xl font-bold text-slate-900">{stats.lostLeadsCount}</p>
              </div>
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Quality Warning */}
      {analytics.some(s => s.conversion_rate > 100) && (
        <Alert className="border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Info:</strong> Beberapa stage menunjukkan konversi &gt;100% karena lead berpindah bolak-balik antar stage saat testing. 
            Metrics ditampilkan berdasarkan kondisi real-time untuk akurasi.
          </AlertDescription>
        </Alert>
      )}

      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Perhatian!</strong> Ditemukan {bottlenecks.length} stage dengan konversi rendah (&lt;50%) yang perlu ditingkatkan.
          </AlertDescription>
        </Alert>
      )}

      {/* Bottleneck Stages */}
      {bottlenecks.length > 0 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              Stage dengan Bottleneck (Perlu Perhatian)
            </CardTitle>
            <CardDescription>
              Stage dengan tingkat konversi rendah dan banyak leads yang stuck
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks.map((stage) => {
                const badge = getConversionBadge(stage.conversion_rate);
                const Icon = badge.icon;
                const displayRate = Math.min(stage.conversion_rate, 100); // Cap at 100%
                const hasAnomaly = stage.conversion_rate > 100;
                
                return (
                  <div key={stage.stage_id} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-slate-900">
                            {stage.stage_name}
                          </h4>
                          <Badge className="text-xs bg-slate-100 text-slate-700 border-slate-200">
                            {stage.funnel_type === "follow_up" ? "Follow Up" : "Broadcast"} #{stage.stage_number}
                          </Badge>
                          {hasAnomaly && (
                            <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                              Data Testing
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Leads Masuk</p>
                            <p className="text-lg font-bold text-slate-900">{stage.leads_entered}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Progressed</p>
                            <p className="text-lg font-bold text-green-600">{stage.leads_progressed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 mb-1">Stuck</p>
                            <p className="text-lg font-bold text-red-600">{stage.leads_stuck}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right ml-4">
                        <Badge className={`${badge.color} border mb-2`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {displayRate.toFixed(1)}%
                        </Badge>
                        <p className="text-xs text-slate-500">Conversion</p>
                      </div>
                    </div>
                    
                    <Progress value={displayRate} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performing Stages */}
      {topPerformers.length > 0 && (
        <Card className="border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              Stage dengan Performa Terbaik
            </CardTitle>
            <CardDescription>
              Stage dengan tingkat konversi tertinggi (≥70%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((stage) => (
                <div key={stage.stage_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{stage.stage_name}</p>
                      <p className="text-sm text-slate-500">
                        {stage.funnel_type === "follow_up" ? "Follow Up" : "Broadcast"} Stage {stage.stage_number}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">{stage.conversion_rate.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500">{stage.leads_progressed}/{stage.leads_entered} progressed</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Stages Detail */}
      <Card className="border-slate-200 bg-white">
        <CardHeader>
          <CardTitle className="text-xl">Detail Semua Stage (Follow Up + Broadcast)</CardTitle>
          <CardDescription>
            Analisa lengkap performa setiap stage dalam pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.map((stage) => {
              const badge = getConversionBadge(stage.conversion_rate);
              const Icon = badge.icon;
              const displayRate = Math.min(stage.conversion_rate, 100);
              const hasAnomaly = stage.conversion_rate > 100;
              
              return (
                <div key={stage.stage_id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{stage.stage_name}</h4>
                      <Badge className="text-xs bg-slate-100 text-slate-700">
                        {stage.funnel_type === "follow_up" ? "Follow Up" : "Broadcast"} #{stage.stage_number}
                      </Badge>
                      {hasAnomaly && (
                        <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                          Testing Data
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-slate-600">
                        <strong className="text-slate-900">{stage.leads_entered}</strong> masuk
                      </span>
                      <span className="text-green-600">
                        <strong>{stage.leads_progressed}</strong> lanjut
                      </span>
                      <span className="text-red-600">
                        <strong>{stage.leads_stuck}</strong> stuck
                      </span>
                    </div>
                  </div>
                  <Badge className={`${badge.color} border`}>
                    <Icon className="w-3 h-3 mr-1" />
                    {displayRate.toFixed(1)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}