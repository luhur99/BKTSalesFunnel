import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle2, Clock, Users } from "lucide-react";
import { db } from "@/lib/supabase";
import { BottleneckAnalytics as BottleneckData } from "@/types/lead";

interface BottleneckAnalyticsProps {
  key?: string;
}

export function BottleneckAnalytics({ key }: BottleneckAnalyticsProps) {
  const [analytics, setAnalytics] = useState<BottleneckData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [key]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const data = await db.analytics.getBottleneckAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConversionColor = (rate: number) => {
    if (rate >= 70) return "text-green-600";
    if (rate >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getConversionBadge = (rate: number) => {
    if (rate >= 70) return { color: "bg-green-100 text-green-700 border-green-200", icon: TrendingUp };
    if (rate >= 50) return { color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: TrendingUp };
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
    const totalEntered = analytics.reduce((sum, s) => sum + s.leads_entered, 0);
    const totalProgressed = analytics.reduce((sum, s) => sum + s.leads_progressed, 0);
    const totalStuck = analytics.reduce((sum, s) => sum + s.leads_stuck, 0);
    
    // Get lost leads count from database
    const allLeads = await db.leads.getAll();
    const lostLeadsCount = allLeads.filter(lead => lead.status === "lost").length;

    return { totalEntered, totalProgressed, totalStuck, lostLeadsCount };
  };

  const [stats, setStats] = useState({ totalEntered: 0, totalProgressed: 0, totalStuck: 0, lostLeadsCount: 0 });

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
        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total Leads Masuk</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalEntered}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Leads Progressing</p>
                <p className="text-3xl font-bold text-green-600">{stats.totalProgressed}</p>
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
                          {stage.conversion_rate.toFixed(1)}%
                        </Badge>
                        <p className="text-xs text-slate-500">Conversion</p>
                      </div>
                    </div>
                    
                    <Progress value={stage.conversion_rate} className="h-2" />
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
              return (
                <div key={stage.stage_id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-900">{stage.stage_name}</h4>
                      <Badge className="text-xs bg-slate-100 text-slate-700">
                        {stage.funnel_type === "follow_up" ? "Follow Up" : "Broadcast"} #{stage.stage_number}
                      </Badge>
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
    </div>
  );
}