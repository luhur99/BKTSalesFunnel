import { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layers, FileText, Tag, User } from "lucide-react";
import { FunnelStagesManager } from "@/components/settings/FunnelStagesManager";
import { ScriptTemplatesManager } from "@/components/settings/ScriptTemplatesManager";
import { CustomLabelsManager } from "@/components/settings/CustomLabelsManager";
import { ProfileSecurity } from "@/components/settings/ProfileSecurity";

export default function SettingsPage() {
  return (
    <>
      <Head>
        <title>Settings - BKT Leads</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link href="/">
                <Button variant="ghost" className="mb-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali ke Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Pengaturan
              </h1>
              <p className="text-muted-foreground mt-1">
                Kelola funnel stages, script templates, dan preferensi sistem
              </p>
            </div>
          </div>

          {/* Settings Tabs */}
          <Tabs defaultValue="stages" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
              <TabsTrigger value="stages" className="gap-2">
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Funnel Stages</span>
              </TabsTrigger>
              <TabsTrigger value="scripts" className="gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Script Templates</span>
              </TabsTrigger>
              <TabsTrigger value="labels" className="gap-2">
                <Tag className="w-4 h-4" />
                <span className="hidden sm:inline">Custom Labels</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile & Security</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stages">
              <FunnelStagesManager />
            </TabsContent>

            <TabsContent value="scripts">
              <ScriptTemplatesManager />
            </TabsContent>

            <TabsContent value="labels">
              <CustomLabelsManager />
            </TabsContent>

            <TabsContent value="profile">
              <ProfileSecurity />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}