import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Users, Facebook, Globe, Share2, UserPlus, Target, Calendar, BarChart3, Award } from "lucide-react";
import { db } from "@/lib/supabase";
import { BottleneckAnalytics as BottleneckData } from "@/types/lead";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface MonthlyDayAnalytics {
  topDaysLeads: { day: string; count: number }[];
  topDaysDeals: { day: string; count: number }[];
  stageDistribution: { stage: string; count: number; percentage: number }[];
  leadsPerDay: { day: string; count: number }[];
  dealsPerDay: { day: string; count: number }[];
}

interface DailyMovement {
  movement_date: string;
  from_stage_name: string;
  to_stage_name: string;
  from_funnel: string;
  to_funnel: string;
  is_funnel_switch: boolean;
  funnel_switches: number;
  total_movements: number;
  movement_reasons: Record<string, number>;
}

interface MonthlyAnalytics {
  weeklyDeals: { week: number; count: number }[];
  weeklyLeads: any[];
  monthlyDeals: number;
  monthlyLeads: number;
  month: string;
  lastMonthDeals: number;
  lastMonthLeads: number;
  conversionRate: number;
  lastMonthConversionRate: number;
  topSources: { source: string; deals: number; percentage: number }[];
  leadsGrowth: number;
  dealsGrowth: number;
}

export function BottleneckAnalytics({ refreshTrigger }: BottleneckAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BottleneckData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceBreakdown[]>([]);
  const [sourceConversion, setSourceConversion] = useState<SourceConversion[]>([]);
  const [dailyMovements, setDailyMovements] = useState<DailyMovement[]>([]);
  const [monthlyDayAnalytics, setMonthlyDayAnalytics] = useState<MonthlyDayAnalytics | null>(null);
  const [monthlyAnalytics, setMonthlyAnalytics] = useState<MonthlyAnalytics | null>(null);
  
  useEffect(() => {
    loadAnalytics();
    loadDailyMovements();
    loadSourceBreakdown();
    loadSourceConversion();
    loadMonthlyDayAnalytics();
    loadMonthlyAnalytics();
  }, [refreshTrigger]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await db.analytics.getBottleneckAnalytics();
      setAnalytics(Array.isArray(data) ? data : []);
      
      // Load source breakdown and conversion
      await loadSourceBreakdown();
      await loadSourceConversion();
      await loadMonthlyDayAnalytics();
      await loadMonthlyAnalytics();
      
      // NEW: Load daily movements and leads list
      await loadDailyMovements();
    } catch (error) {
      console.error("Error loading analytics:", error);
      // Set empty arrays on error to prevent crashes
      setAnalytics([]);
      setSourceBreakdown([]);
      setSourceConversion([]);
      setDailyMovements([]);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Load daily movements for last 7 days
  const loadDailyMovements = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const data = await db.analytics.getDailyStageMovements(startDate, endDate);
      setDailyMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading daily movements:", error);
      setDailyMovements([]);
    }
  };

  const loadSourceBreakdown = async () => {
    try {
      const leads = await db.leads.getAll();
      const leadsArray = Array.isArray(leads) ? leads : [];
      
      // Debug logging
      console.log("🔍 DEBUG: Total leads fetched:", leadsArray.length);
      if (leadsArray.length > 0) {
        console.log("🔍 DEBUG: Sample lead structure:", leadsArray[0]);
        console.log("🔍 DEBUG: Lead[0] source object:", leadsArray[0].source);
        console.log("🔍 DEBUG: Lead[0] source.name:", leadsArray[0].source?.name);
      }
      
      const sourceMap = new Map<string, number>();
      leadsArray.forEach(lead => {
        const sourceName = lead.source?.name || "Unknown";
        sourceMap.set(sourceName, (sourceMap.get(sourceName) || 0) + 1);
      });
      
      const total = leadsArray.length;
      const breakdown: SourceBreakdown[] = Array.from(sourceMap.entries()).map(([source, count]) => ({
        source,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0
      }));
      
      breakdown.sort((a, b) => b.count - a.count);
      
      setSourceBreakdown(breakdown);
    } catch (error) {
      console.error("Error loading source breakdown:", error);
      setSourceBreakdown([]);
    }
  };

  const loadSourceConversion = async () => {
    try {
      const leads = await db.leads.getAll();
      const leadsArray = Array.isArray(leads) ? leads : [];
      
      // Debug logging
      console.log("🔍 DEBUG: Total leads fetched:", leadsArray.length);
      if (leadsArray.length > 0) {
        console.log("🔍 DEBUG: Sample lead structure:", leadsArray[0]);
        console.log("🔍 DEBUG: Lead[0] source object:", leadsArray[0].source);
        console.log("🔍 DEBUG: Lead[0] source.name:", leadsArray[0].source?.name);
      }
      
      // 🔍 DEBUG: Log all lead statuses to check format
      console.log("🔍 DEBUG: All lead statuses:", leadsArray.map(l => ({ 
        id: l.id, 
        name: l.name, 
        status: l.status,
        statusType: typeof l.status,
        statusTrimmed: l.status?.trim(),
        statusLower: l.status?.toLowerCase()
      })));
      
      const sourceMap = new Map<string, { total: number; deals: number }>();
      leadsArray.forEach(lead => {
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
      setSourceConversion([]);
    }
  };

  const loadMonthlyDayAnalytics = async () => {
    try {
      const leads = await db.leads.getAll();
      const leadsArray = Array.isArray(leads) ? leads : [];
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Helper to check if date is in current month
      const isCurrentMonth = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      };

      // Filter leads for current month
      const monthLeads = leadsArray.filter(l => isCurrentMonth(l.created_at));
      const monthDeals = leadsArray.filter(l => 
        l.status?.trim().toLowerCase() === "deal" && 
        isCurrentMonth(l.updated_at)
      );

      // Indonesian day names
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      
      // 1. Count leads per day
      const leadsPerDayMap = new Map<string, number>();
      monthLeads.forEach(lead => {
        const date = new Date(lead.created_at);
        const dayName = dayNames[date.getDay()];
        leadsPerDayMap.set(dayName, (leadsPerDayMap.get(dayName) || 0) + 1);
      });
      
      // 2. Count deals per day
      const dealsPerDayMap = new Map<string, number>();
      monthDeals.forEach(lead => {
        const date = new Date(lead.updated_at);
        const dayName = dayNames[date.getDay()];
        dealsPerDayMap.set(dayName, (dealsPerDayMap.get(dayName) || 0) + 1);
      });
      
      // 3. Get Top 2 Days for Leads
      const topDaysLeads = Array.from(leadsPerDayMap.entries())
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2);
      
      // 4. Get Top 2 Days for Deals
      const topDaysDeals = Array.from(dealsPerDayMap.entries())
        .map(([day, count]) => ({ day, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 2);
      
      // 5. Monthly Stage Distribution (Where are this month's leads now?)
      const stages = await db.stages.getAll();
      const stagesArray = Array.isArray(stages) ? stages : [];
      const stageDistribution: { stage: string; count: number }[] = [];
      
      // Group by funnel type and stage number
      const followUpStages = stagesArray.filter(s => s.funnel_type === "follow_up").sort((a, b) => a.stage_number - b.stage_number);
      const broadcastStages = stagesArray.filter(s => s.funnel_type === "broadcast").sort((a, b) => a.stage_number - b.stage_number);
      
      // Check distribution of monthLeads
      followUpStages.forEach(stage => {
        const count = monthLeads.filter(l => l.current_stage_id === stage.id).length;
        if (count > 0) {
          stageDistribution.push({
            stage: `FU ${stage.stage_number}: ${stage.stage_name}`,
            count
          });
        }
      });
      
      broadcastStages.forEach(stage => {
        const count = monthLeads.filter(l => l.current_stage_id === stage.id).length;
        if (count > 0) {
          stageDistribution.push({
            stage: `BC ${stage.stage_number}: ${stage.stage_name}`,
            count
          });
        }
      });
      
      const totalMonthLeads = monthLeads.length;
      
      const stageDistributionWithPercentage = stageDistribution.map(s => ({
        ...s,
        percentage: totalMonthLeads > 0 ? (s.count / totalMonthLeads) * 100 : 0
      }));
      
      // Convert maps to arrays for graphs if needed (optional)
      const leadsPerDayArray = Array.from(leadsPerDayMap.entries()).map(([day, count]) => ({ day, count }));
      const dealsPerDayArray = Array.from(dealsPerDayMap.entries()).map(([day, count]) => ({ day, count }));
      
      setMonthlyDayAnalytics({
        topDaysLeads,
        topDaysDeals,
        stageDistribution: stageDistributionWithPercentage,
        leadsPerDay: leadsPerDayArray,
        dealsPerDay: dealsPerDayArray
      });
    } catch (error) {
      console.error("Error loading monthly day analytics:", error);
      setMonthlyDayAnalytics(null);
    }
  };

  const loadMonthlyAnalytics = async () => {
    try {
      const leads = await db.leads.getAll();
      const leadsArray = Array.isArray(leads) ? leads : [];
      
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonth = lastMonthDate.getMonth();
      const lastMonthYear = lastMonthDate.getFullYear();

      // Helper to check if date is in specific month/year
      const isInMonth = (dateStr: string, month: number, year: number) => {
        const d = new Date(dateStr);
        return d.getMonth() === month && d.getFullYear() === year;
      };

      // 1. Filter Leads & Deals for Current Month
      const thisMonthLeads = leadsArray.filter(l => isInMonth(l.created_at, currentMonth, currentYear));
      const thisMonthDeals = leadsArray.filter(l => 
        l.status?.trim().toLowerCase() === "deal" && 
        isInMonth(l.updated_at, currentMonth, currentYear)
      );

      // 2. Filter Leads & Deals for Last Month
      const lastMonthLeadsData = leadsArray.filter(l => isInMonth(l.created_at, lastMonth, lastMonthYear));
      const lastMonthDealsData = leadsArray.filter(l => 
        l.status?.trim().toLowerCase() === "deal" && 
        isInMonth(l.updated_at, lastMonth, lastMonthYear)
      );

      // 3. Weekly Trends (Current Month)
      const weeklyDealsMap = new Map<number, number>();
      
      // Initialize 4 weeks
      for(let i=1; i<=4; i++) {
        weeklyDealsMap.set(i, 0);
      }

      thisMonthDeals.forEach(deal => {
        const date = new Date(deal.updated_at);
        const day = date.getDate();
        const week = Math.min(Math.ceil(day / 7), 4); // Clamp to 4 weeks
        weeklyDealsMap.set(week, (weeklyDealsMap.get(week) || 0) + 1);
      });

      // 4. Conversion Rates
      const thisMonthRate = thisMonthLeads.length > 0 
        ? (thisMonthDeals.length / thisMonthLeads.length) * 100 
        : 0;
        
      const lastMonthRate = lastMonthLeadsData.length > 0 
        ? (lastMonthDealsData.length / lastMonthLeadsData.length) * 100 
        : 0;

      // 5. Top Sources (Current Month Deals)
      const sourceMap = new Map<string, number>();
      thisMonthDeals.forEach(deal => {
        const sourceName = deal.source?.name || "Unknown";
        sourceMap.set(sourceName, (sourceMap.get(sourceName) || 0) + 1);
      });

      const topSources = Array.from(sourceMap.entries())
        .map(([source, count]) => ({
          source,
          deals: count,
          percentage: thisMonthDeals.length > 0 ? (count / thisMonthDeals.length) * 100 : 0
        }))
        .sort((a, b) => b.deals - a.deals)
        .slice(0, 3);

      // 6. Growth Metrics
      const leadsGrowth = lastMonthLeadsData.length > 0
        ? ((thisMonthLeads.length - lastMonthLeadsData.length) / lastMonthLeadsData.length) * 100
        : 0;

      const dealsGrowth = lastMonthDealsData.length > 0
        ? ((thisMonthDeals.length - lastMonthDealsData.length) / lastMonthDealsData.length) * 100
        : 0;

      const monthName = now.toLocaleString("id-ID", { month: "long" });

      setMonthlyAnalytics({
        weeklyDeals: Array.from(weeklyDealsMap.entries()).map(([week, count]) => ({ week, count })),
        weeklyLeads: [], // Not used in UI but required by interface
        monthlyDeals: thisMonthDeals.length,
        monthlyLeads: thisMonthLeads.length,
        month: monthName,
        lastMonthDeals: lastMonthDealsData.length,
        lastMonthLeads: lastMonthLeadsData.length,
        conversionRate: thisMonthRate,
        lastMonthConversionRate: lastMonthRate,
        topSources,
        leadsGrowth,
        dealsGrowth
      });

    } catch (error) {
      console.error("Error loading monthly analytics:", error);
      setMonthlyAnalytics(null);
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
      {/* Daily Movement Trends */}
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-500" />
            Daily Movement Trends (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyMovements.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Movements</p>
                  <p className="text-2xl font-bold">
                    {dailyMovements.reduce((sum, day) => sum + day.total_movements, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Funnel Switches</p>
                  <p className="text-2xl font-bold">
                    {dailyMovements.reduce((sum, day) => sum + day.funnel_switches, 0)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Top 5 Movement Patterns:</p>
                {dailyMovements
                  .sort((a, b) => b.total_movements - a.total_movements)
                  .slice(0, 5)
                  .map((day, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {new Date(day.movement_date).toLocaleDateString("id-ID", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <div className="flex items-center gap-4">
                        <span>
                          {day.total_movements} moves
                        </span>
                        {day.funnel_switches > 0 && (
                          <span className="text-orange-500">
                            {day.funnel_switches} switches
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Tidak ada data pergerakan</p>
          )}
        </CardContent>
      </Card>

      {/* Lead Masuk by Source */}
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
              Analisa Lead Bulanan
            </CardTitle>
            <CardDescription className="text-xs">Data harian dalam bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!monthlyDayAnalytics ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
            ) : (
              <>
                {/* Top 2 Days Lead Masuk */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">📅 Lead Masuk Terbanyak</p>
                    <span className="text-xs text-slate-500">Bulan Ini</span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 space-y-2">
                    {monthlyDayAnalytics.topDaysLeads.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center">Belum ada data</p>
                    ) : (
                      monthlyDayAnalytics.topDaysLeads.map((item, idx) => (
                        <div key={item.day} className="flex items-center justify-between p-2 bg-white/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-800 w-4">{idx + 1}.</span>
                            <span className="text-sm font-medium text-slate-700">{item.day}</span>
                          </div>
                          <span className="text-xs font-bold text-blue-600">{item.count} leads</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top 2 Days Closing */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">💰 Closing Terbanyak</p>
                    <span className="text-xs text-slate-500">Bulan Ini</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 space-y-2">
                    {monthlyDayAnalytics.topDaysDeals.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center">Belum ada deals</p>
                    ) : (
                      monthlyDayAnalytics.topDaysDeals.map((item, idx) => (
                        <div key={item.day} className="flex items-center justify-between p-2 bg-white/50 rounded">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-green-800 w-4">{idx + 1}.</span>
                            <span className="text-sm font-medium text-slate-700">{item.day}</span>
                          </div>
                          <span className="text-xs font-bold text-green-600">{item.count} deals</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Stage Distribution */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">📍 Distribusi Stage (Bulan Ini)</p>
                  {monthlyDayAnalytics.stageDistribution.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-2">Tidak ada leads bulan ini</p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {monthlyDayAnalytics.stageDistribution.map((stage, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate max-w-[150px]" title={stage.stage}>{stage.stage}</span>
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
              Analisa Lead Bulanan
            </CardTitle>
            <CardDescription className="text-xs">Data lead bulan ini</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!monthlyAnalytics ? (
              <p className="text-sm text-slate-500 text-center py-4">Loading...</p>
            ) : (
              <>
                {/* 1. Weekly Deals Trend */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-slate-600">📈 Trend Deals Mingguan</p>
                    <span className="text-xs text-slate-500">{monthlyAnalytics.month}</span>
                  </div>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-lg border border-blue-200">
                    {monthlyAnalytics.weeklyDeals.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center">Belum ada deals bulan ini</p>
                    ) : (
                      <>
                        {monthlyAnalytics.weeklyDeals.map((week) => {
                          const maxDeals = Math.max(...monthlyAnalytics.weeklyDeals.map(w => w.count));
                          const barWidth = maxDeals > 0 ? (week.count / maxDeals) * 100 : 0;
                          return (
                            <div key={week.week} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-slate-600 font-medium">Week {week.week}</span>
                                <span className="text-slate-900 font-semibold">{week.count} deals</span>
                              </div>
                              <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-500"
                                  style={{ width: `${barWidth}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-2 mt-2 border-t border-blue-300">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-slate-700">Total Deals:</span>
                            <span className="font-bold text-green-600">{monthlyAnalytics.monthlyDeals}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 2. Conversion Rate Comparison */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">💯 Tingkat Konversi Bulanan</p>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Bulan Ini:</span>
                      <span className="text-lg font-bold text-blue-900">{monthlyAnalytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Bulan Lalu:</span>
                      <span className="text-sm font-semibold text-slate-700">{monthlyAnalytics.lastMonthConversionRate.toFixed(1)}%</span>
                    </div>
                    {monthlyAnalytics.lastMonthConversionRate > 0 && (
                      <div className="pt-2 border-t border-blue-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-slate-600">Growth:</span>
                          <span className={`text-sm font-bold ${
                            monthlyAnalytics.conversionRate > monthlyAnalytics.lastMonthConversionRate 
                              ? "text-green-600" 
                              : monthlyAnalytics.conversionRate < monthlyAnalytics.lastMonthConversionRate
                              ? "text-red-600"
                              : "text-slate-600"
                          }`}>
                            {monthlyAnalytics.conversionRate > monthlyAnalytics.lastMonthConversionRate ? "↑" : 
                             monthlyAnalytics.conversionRate < monthlyAnalytics.lastMonthConversionRate ? "↓" : "→"}
                            {" "}
                            {(monthlyAnalytics.conversionRate - monthlyAnalytics.lastMonthConversionRate).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Top 3 Lead Sources */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">🏆 Top 3 Lead Source (Deals)</p>
                  <div className="space-y-2">
                    {monthlyAnalytics.topSources.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-2">Belum ada deals dari source manapun</p>
                    ) : (
                      monthlyAnalytics.topSources.map((source, index) => {
                        const medals = ["🥇", "🥈", "🥉"];
                        const colors = ["text-yellow-600", "text-slate-400", "text-orange-600"];
                        return (
                          <div key={source.source} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{medals[index]}</span>
                              <span className={`text-xs font-medium ${colors[index]}`}>{source.source}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-bold text-slate-900">{source.deals} deals</span>
                              <span className="text-xs text-slate-500 ml-2">({source.percentage.toFixed(1)}%)</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* 4. Month-over-Month Comparison */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-slate-600">📊 Perbandingan dengan Bulan Lalu</p>
                  <div className="space-y-3 bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Leads Masuk:</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Bulan Ini: <strong>{monthlyAnalytics.monthlyLeads}</strong></span>
                        {monthlyAnalytics.lastMonthLeads > 0 && (
                          <span className={`text-xs font-bold ${
                            monthlyAnalytics.leadsGrowth > 0 ? "text-green-600" : 
                            monthlyAnalytics.leadsGrowth < 0 ? "text-red-600" : "text-slate-600"
                          }`}>
                            {monthlyAnalytics.leadsGrowth > 0 ? "↑" : monthlyAnalytics.leadsGrowth < 0 ? "↓" : "→"}
                            {" "}
                            {Math.abs(monthlyAnalytics.leadsGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">Bulan Lalu: {monthlyAnalytics.lastMonthLeads}</span>
                    </div>
                    
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Deals Closed:</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">Bulan Ini: <strong>{monthlyAnalytics.monthlyDeals}</strong></span>
                        {monthlyAnalytics.lastMonthDeals > 0 && (
                          <span className={`text-xs font-bold ${
                            monthlyAnalytics.dealsGrowth > 0 ? "text-green-600" : 
                            monthlyAnalytics.dealsGrowth < 0 ? "text-red-600" : "text-slate-600"
                          }`}>
                            {monthlyAnalytics.dealsGrowth > 0 ? "↑" : monthlyAnalytics.dealsGrowth < 0 ? "↓" : "→"}
                            {" "}
                            {Math.abs(monthlyAnalytics.dealsGrowth).toFixed(1)}%
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">Bulan Lalu: {monthlyAnalytics.lastMonthDeals}</span>
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
                            <p className="text-xs text-slate-600 mb-1">Leads Masuk</p>
                            <p className="text-lg font-bold text-slate-900">{stage.leads_entered}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Progressed</p>
                            <p className="text-lg font-bold text-green-600">{stage.leads_progressed}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-600 mb-1">Stuck</p>
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
              {topPerformers.map((stage) => {
                const badge = getConversionBadge(stage.conversion_rate);
                const Icon = badge.icon;
                
                return (
                  <div key={stage.stage_id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
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
                      {stage.conversion_rate.toFixed(1)}%
                    </Badge>
                  </div>
                );
              })}
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
                      <h4 className="font-semibold text-slate-900">
                        {stage.stage_name}
                      </h4>
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