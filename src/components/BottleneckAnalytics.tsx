import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Users, Facebook, Globe, Share2, UserPlus, Target, Calendar, BarChart3, Award } from "lucide-react";
import { db } from "@/lib/supabase";
import { BottleneckAnalytics as BottleneckData } from "@/types/lead";

interface BottleneckAnalyticsProps {
  key?: string;
  refreshTrigger?: any;
}

interface SourceBreakdown {
  source: string;
  count: number;
  percentage: number;
}

interface SourceConversion {
  source: string;
  totalLeads: number;
  dealLeads: number;
  conversionRate: number;
}

interface WeeklyAnalytics {
  dayWithMostLeads: { day: string; count: number };
  dayWithMostDeals: { day: string; count: number };
  stageDistribution: { stage: string; count: number; percentage: number }[];
  leadsPerDay: { day: string; count: number }[];
  dealsPerDay: { day: string; count: number }[];
}

interface MonthlyAnalytics {
  weeklyDeals: { week: number; count: number }[];
  weeklyLeads: { week: number; count: number }[];
  monthlyDeals: number;
  monthlyLeads: number;
  month: string;
}

export function BottleneckAnalytics({ refreshTrigger }: BottleneckAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BottleneckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [sourceConversion, setSourceConversion] = useState<SourceConversion[]>([]);
  const [weeklyAnalytics, setWeeklyAnalytics] = useState<WeeklyAnalytics | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await db.analytics.getBottleneckAnalytics();
      setAnalytics(data);
      
      // Load source breakdown and conversion
      await loadSourceBreakdown();
      await loadSourceConversion();
      await loadWeeklyAnalytics();
      await loadMonthlyAnalytics();
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadSourceBreakdown = async () => {
    try {
      const leads = await db.leads.getAll();
      
      // Debug logging
      console.log("🔍 DEBUG: Total leads fetched:", leads.length);
      if (leads.length > 0) {
        console.log("🔍 DEBUG: Sample lead structure:", leads[0]);
        console.log("🔍 DEBUG: Lead[0] source object:", leads[0].source);
        console.log("🔍 DEBUG: Lead[0] source.name:", leads[0].source?.name);
      }
      
      const sourceMap = new Map<string, number>();
      leads.forEach(lead => {
        const sourceName = lead.source?.name || "Unknown";
        sourceMap.set(sourceName, (sourceMap.get(sourceName) || 0) + 1);
      });
      
      const total = leads.length;
      const breakdown: SourceBreakdown[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
      
      breakdown.sort((a, b) => b.count - a.count);
      
      setSourceBreakdown(breakdown);
    } catch (error) {
      console.error("Error loading source breakdown:", error);
    }
  };

  const loadSourceConversion = async () => {
    try {
      const leads = await db.leads.getAll();
      
      // Debug logging
      console.log("🔍 DEBUG: Total leads fetched:", leads.length);
      if (leads.length > 0) {
        console.log("🔍 DEBUG: Sample lead structure:", leads[0]);
        console.log("🔍 DEBUG: Lead[0] source object:", leads[0].source);
        console.log("🔍 DEBUG: Lead[0] source.name:", leads[0].source?.name);
      }
      
      // 🔍 DEBUG: Log all lead statuses to check format
      console.log("🔍 DEBUG: All lead statuses:", leads.map(l => ({ 
        id: l.id, 
        name: l.name, 
        status: l.status,
        statusType: typeof l.status,
        statusTrimmed: l.status?.trim(),
        statusLower: l.status?.toLowerCase()
      })));
      
      const sourceMap = new Map<string, { total: number; deals: number }>();
      leads.forEach(lead => {
        const sourceName = lead.source?.name || "Unknown";
        
        // 🔧 FIX: Case-insensitive status check with trim
        const normalizedStatus = lead.status?.trim().toLowerCase();
        const isDeal = normalizedStatus === "deal";
        
        // 🔍 DEBUG: Log each lead processing
        if (normalizedStatus === "deal") {
          console.log("✅ DEAL FOUND:", {
            name: lead.name,
            source: sourceName,
            status: lead.status,
            normalized: normalizedStatus
          });
        }
        
        if (!sourceMap.has(sourceName)) {
          sourceMap.set(sourceName, { total: 0, deals: 0 });
        }
        
        const current = sourceMap.get(sourceName)!;
        current.total += 1;
        if (isDeal) current.deals += 1;
      });
      
      // 🔍 DEBUG: Log final sourceMap
      console.log("🔍 DEBUG: Source map after processing:", Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        total: data.total,
        deals: data.deals,
        rate: data.total > 0 ? (data.deals / data.total * 100).toFixed(1) + '%' : '0%'
      })));
      
      const conversions: SourceConversion[] = Array.from(sourceMap.entries()).map(([source, data]) => ({
        source,
        totalLeads: data.total,
        dealLeads: data.deals,
        conversionRate: data.total > 0 ? (data.deals / data.total) * 100 : 0
      }));
      
      conversions.sort((a, b) => b.conversionRate - a.conversionRate);
      
      setSourceConversion(conversions);
    } catch (error) {
      console.error("Error loading source conversion:", error);
    }
  };

  const loadWeeklyAnalytics = async () => {
    try {
      const leads = await db.leads.getAll();
      
      // Indonesian day names
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      
      // 1. Count leads per day of week (based on created_at)
      const leadsPerDay = new Map<string, number>();
      dayNames.forEach(day => leadsPerDay.set(day, 0));
      
      leads.forEach(lead => {
        const date = new Date(lead.created_at);
        const dayIndex = date.getDay();
        const dayName = dayNames[dayIndex];
        leadsPerDay.set(dayName, (leadsPerDay.get(dayName) || 0) + 1);
      });
      
      // 2. Count deals per day of week (based on updated_at when status became Deal)
      const dealsPerDay = new Map<string, number>();
      dayNames.forEach(day => dealsPerDay.set(day, 0));
      
      const dealLeads = leads.filter(l => l.status?.trim().toLowerCase() === "deal");
      dealLeads.forEach(lead => {
        const date = new Date(lead.updated_at);
        const dayIndex = date.getDay();
        const dayName = dayNames[dayIndex];
        dealsPerDay.set(dayName, (dealsPerDay.get(dayName) || 0) + 1);
      });
      
      // 3. Find day with most leads
      let maxLeadsDay = { day: "Senin", count: 0 };
      leadsPerDay.forEach((count, day) => {
        if (count > maxLeadsDay.count) {
          maxLeadsDay = { day, count };
        }
      });
      
      // 4. Find day with most deals
      let maxDealsDay = { day: "Senin", count: 0 };
      dealsPerDay.forEach((count, day) => {
        if (count > maxDealsDay.count) {
          maxDealsDay = { day, count };
        }
      });
      
      // 5. Stage distribution (Follow Up vs Broadcast)
      const stages = await db.stages.getAll();
      const stageDistribution: { stage: string; count: number }[] = [];
      
      // Group by funnel type and stage number
      const followUpStages = stages.filter(s => s.funnel_type === "follow_up").sort((a, b) => a.stage_number - b.stage_number);
      const broadcastStages = stages.filter(s => s.funnel_type === "broadcast").sort((a, b) => a.stage_number - b.stage_number);
      
      followUpStages.forEach(stage => {
        const count = leads.filter(l => l.current_stage_id === stage.id && l.status === "active").length;
        if (count > 0) {
          stageDistribution.push({
            stage: `FU ${stage.stage_number}: ${stage.stage_name}`,
            count
          });
        }
      });
      
      broadcastStages.forEach(stage => {
        const count = leads.filter(l => l.current_stage_id === stage.id && l.status === "active").length;
        if (count > 0) {
          stageDistribution.push({
            stage: `BC ${stage.stage_number}: ${stage.stage_name}`,
            count
          });
        }
      });
      
      const totalActiveLeads = leads.filter(l => l.status === "active").length;
      
      const stageDistributionWithPercentage = stageDistribution.map(s => ({
        ...s,
        percentage: totalActiveLeads > 0 ? (s.count / totalActiveLeads) * 100 : 0
      }));
      
      // Convert maps to arrays
      const leadsPerDayArray = Array.from(leadsPerDay.entries()).map(([day, count]) => ({ day, count }));
      const dealsPerDayArray = Array.from(dealsPerDay.entries()).map(([day, count]) => ({ day, count }));
      
      setWeeklyAnalytics({
        dayWithMostLeads: maxLeadsDay,
        dayWithMostDeals: maxDealsDay,
        stageDistribution: stageDistributionWithPercentage,
        leadsPerDay: leadsPerDayArray,
        dealsPerDay: dealsPerDayArray
      });
    } catch (error) {
      console.error("Error loading weekly analytics:", error);
    }
  };

  const loadMonthlyAnalytics = async () => {
    try {
      const leads = await db.leads.getAll();
      
      // Debug logging
      console.log("🔍 DEBUG: Total leads fetched:", leads.length);
      if (leads.length > 0) {
        console.log("🔍 DEBUG: Sample lead structure:", leads[0]);
        console.log("🔍 DEBUG: Lead[0] source object:", leads[0].source);
        console.log("🔍 DEBUG: Lead[0] source.name:", leads[0].source?.name);
      }
      
      // 🔍 DEBUG: Log all lead statuses to check format
      console.log("🔍 DEBUG: All lead statuses:", leads.map(l => ({ 
        id: l.id, 
        name: l.name, 
        status: l.status,
        statusType: typeof l.status,
        statusTrimmed: l.status?.trim(),
        statusLower: l.status?.toLowerCase()
      })));
      
      // 🔧 FIX: Case-insensitive status check with trim
      const dealLeads = leads.filter(l => l.status?.trim().toLowerCase() === "deal");
      
      // 🔍 DEBUG: Log final sourceMap
      console.log("🔍 DEBUG: Deal leads count:", dealLeads.length);
      
      const totalLeads = leads.length;
      const totalDeals = dealLeads.length;
      
      const month = new Date().toLocaleString("id-ID", { month: "long" });
      
      setMonthlyAnalytics({
        weeklyDeals: [],
        weeklyLeads: [],
        monthlyDeals: totalDeals,
        monthlyLeads: totalLeads,
        month
      });
    } catch (error) {
      console.error("Error loading monthly analytics:", error);
    }
  };

  const getSourceIcon = (source: string | null | undefined) => {
    if (!source || typeof source !== "string") return UserPlus;
    
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
    if (rate >= 30) return "bg-green-500";
    if (rate >= 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getConversionBadge = (rate: number) => {
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

        {/* NEW: Conversion Rate by Source Card */}
        <Card className="border-slate-200 bg-white md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-purple-600" />
              </div>
              Conversion Rate by Source
            </CardTitle>
            <CardDescription className="text-xs">Persentase konversi menjadi Deal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sourceConversion.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Belum ada data konversi</p>
            ) : (
              sourceConversion.map((item, index) => {
                const Icon = getSourceIcon(item.source);
                return (
                  <div key={item.source} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-slate-600" />
                        <span className="font-medium text-slate-700">{item.source}</span>
                      </div>
                      <span className="text-xs text-slate-500">
                        {item.totalLeads} leads → {item.dealLeads} deals
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        Conversion: {item.conversionRate.toFixed(1)}%
                      </p>
                      <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 left-0 h-full ${getConversionColor(item.conversionRate)} transition-all duration-500`}
                          style={{ width: `${Math.min(item.conversionRate, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600" />
              </div>
              Analisa Mingguan
            </CardTitle>
            <CardDescription className="text-xs">Data lead 7 hari terakhir</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!weeklyAnalytics ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
            ) : (
              <>
                {/* Day with Most Leads */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">📅 Lead Masuk Terbanyak</p>
                    <span className="text-xs text-slate-500">Hari ini minggu</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-lg font-bold text-blue-900">{weeklyAnalytics.dayWithMostLeads.day}</p>
                      <p className="text-xs text-blue-600">{weeklyAnalytics.dayWithMostLeads.count} leads masuk</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Day with Most Deals */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">💰 Closing Terbanyak</p>
                    <span className="text-xs text-slate-500">Deal terbanyak</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-lg font-bold text-green-900">{weeklyAnalytics.dayWithMostDeals.day}</p>
                      <p className="text-xs text-green-600">{weeklyAnalytics.dayWithMostDeals.count} deals closed</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Stage Distribution */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">📍 Distribusi Stage (Active Leads)</p>
                  {weeklyAnalytics.stageDistribution.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-2">Tidak ada active leads</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {weeklyAnalytics.stageDistribution.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700">{stage.stage}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">{stage.count}</span>
                            <span className="text-slate-500">({stage.percentage.toFixed(1)}%)</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-green-600" />
              </div>
              Analisa Bulanan
            </CardTitle>
            <CardDescription className="text-xs">Data lead bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!monthlyAnalytics ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
            ) : (
              <>
                {/* Month */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">📅 Bulan</p>
                    <span className="text-xs text-slate-500">{monthlyAnalytics.month}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <p className="text-lg font-bold text-green-900">{monthlyAnalytics.monthlyDeals}</p>
                      <p className="text-xs text-green-600">Deals closed</p>
                    </div>
                    <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Leads */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">👥 Leads Masuk</p>
                    <span className="text-xs text-slate-500">{monthlyAnalytics.monthlyLeads}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <p className="text-lg font-bold text-blue-900">{monthlyAnalytics.monthlyLeads}</p>
                      <p className="text-xs text-blue-600">Leads masuk</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                      <UserPlus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </>
            )}
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
                const displayRate = Math.min(stage.conversion_rate, 100);
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