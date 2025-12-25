import { useState, useEffect } from "react";
import Head from "next/head";
import { BarChart3, Users, TrendingUp, DollarSign, Filter, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    total_leads: 0,
    active_leads: 0,
    deals_closed: 0,
    lost_leads: 0,
    follow_up_leads: 0,
    broadcast_leads: 0,
    conversion_rate: 0,
    total_deal_value: 0
  });

  return (
    <>
      <Head>
        <title>BKT-Leads - Dashboard</title>
        <meta name="description" content="Lead Management Dashboard for Budi Karya Teknologi" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">BKT-Leads</h1>
                  <p className="text-sm text-slate-500">Budi Karya Teknologi CRM</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                  Settings
                </button>
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors">
                  + Add Lead
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600">Total Leads</CardDescription>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.total_leads}</div>
                <div className="flex items-center gap-1 mt-2 text-sm">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-green-600 font-medium">+12%</span>
                  <span className="text-slate-500">from last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600">Active Leads</CardDescription>
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.active_leads}</div>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                  <span className="font-medium">{metrics.follow_up_leads}</span>
                  <span>Follow Up</span>
                  <span className="text-slate-400">•</span>
                  <span className="font-medium">{metrics.broadcast_leads}</span>
                  <span>Broadcast</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600">Deals Closed</CardDescription>
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{metrics.deals_closed}</div>
                <div className="text-sm text-slate-600 mt-2">
                  <span className="font-medium">{metrics.conversion_rate.toFixed(1)}%</span>
                  <span className="ml-1">conversion rate</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-slate-600">Total Value</CardDescription>
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  ${metrics.total_deal_value.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 mt-2">
                  Closed deals value
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList className="bg-white border border-slate-200">
                <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="follow-up" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Follow Up Funnel
                </TabsTrigger>
                <TabsTrigger value="broadcast" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Broadcast Funnel
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Analytics
                </TabsTrigger>
              </TabsList>

              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-white border border-slate-200 rounded-lg transition-colors">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>

            <TabsContent value="overview" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Lead Pipeline Overview</CardTitle>
                  <CardDescription>Track your leads across both funnels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Pipeline visualization coming soon</p>
                    <p className="text-sm mt-2">Connect to Supabase to see your lead data</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="follow-up" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Follow Up Funnel</CardTitle>
                  <CardDescription>10-stage follow up process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Follow Up funnel will appear here</p>
                    <p className="text-sm mt-2">Stages 1-10 with lead details</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="broadcast" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Broadcast Funnel</CardTitle>
                  <CardDescription>Re-engagement sequence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Broadcast funnel will appear here</p>
                    <p className="text-sm mt-2">Stages 1-10 with re-engagement tracking</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-xl">Bottleneck Analytics</CardTitle>
                  <CardDescription>Identify conversion bottlenecks across stages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-slate-500">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                    <p className="text-lg font-medium">Analytics dashboard coming soon</p>
                    <p className="text-sm mt-2">Stage-by-stage conversion analysis</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white">
            <div className="max-w-3xl">
              <h2 className="text-2xl font-bold mb-2">Connect to Supabase</h2>
              <p className="text-blue-100 mb-6">
                To start managing your leads, connect your Supabase database using the connection button in the navbar.
                The database schema is ready and waiting for you!
              </p>
              <div className="flex gap-4">
                <button className="px-6 py-3 bg-white text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors">
                  View Setup Guide
                </button>
                <button className="px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-400 transition-colors">
                  Documentation
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}