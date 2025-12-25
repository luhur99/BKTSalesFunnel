import { useState } from "react";
import { useRouter } from "next/router";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  BookOpen, 
  UserPlus, 
  GitBranch, 
  BarChart3, 
  Settings, 
  MessageSquare,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Video,
  FileText,
  Users,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";

export default function GuidePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <>
      <SEO 
        title="Panduan Penggunaan - BKT-Leads CRM"
        description="Panduan lengkap penggunaan aplikasi BKT-Leads untuk mengelola lead dan meningkatkan konversi penjualan"
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
        {/* Header */}
        <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/dashboard")}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Dashboard
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Panduan Penggunaan
                  </h1>
                  <p className="text-sm text-slate-600">BKT-Leads CRM System</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-2">
                <BookOpen className="w-3 h-3" />
                Dokumentasi v1.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-2 lg:grid-cols-6 w-full">
              <TabsTrigger value="overview" className="gap-2">
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="getting-started" className="gap-2">
                <Zap className="w-4 h-4" />
                <span className="hidden sm:inline">Memulai</span>
              </TabsTrigger>
              <TabsTrigger value="lead-management" className="gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Kelola Lead</span>
              </TabsTrigger>
              <TabsTrigger value="funnel-system" className="gap-2">
                <GitBranch className="w-4 h-4" />
                <span className="hidden sm:inline">Funnel</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    Tentang BKT-Leads CRM
                  </CardTitle>
                  <CardDescription>
                    Sistem manajemen lead yang dirancang khusus untuk sales Budi Karya Teknologi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Fitur Utama</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex gap-3 p-4 bg-blue-50 rounded-lg">
                        <GitBranch className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">Dual-Funnel System</h4>
                          <p className="text-sm text-slate-600">
                            Follow Up (10 stage) dan Broadcast (10 stage) untuk maksimalkan konversi
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 bg-purple-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">Script Management</h4>
                          <p className="text-sm text-slate-600">
                            Template script untuk setiap stage dengan media support
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 bg-green-50 rounded-lg">
                        <BarChart3 className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">Bottleneck Analytics</h4>
                          <p className="text-sm text-slate-600">
                            Identifikasi hambatan konversi di setiap stage
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-3 p-4 bg-orange-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-orange-600 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="font-medium mb-1">Real-time Tracking</h4>
                          <p className="text-sm text-slate-600">
                            Monitor pergerakan lead dan progress tim secara real-time
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="font-semibold text-lg mb-3">Konsep Dasar</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Lead</span>
                          <p className="text-sm text-slate-600">Prospek potensial dari berbagai sumber (FB Ads, Google Ads, Social Media, Manual)</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Stage</span>
                          <p className="text-sm text-slate-600">Tahapan dalam funnel (Stage 1-10) yang dilalui lead menuju closing</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Funnel</span>
                          <p className="text-sm text-slate-600">Jalur perjalanan lead: Follow Up (aktif merespon) atau Broadcast (perlu reaktivasi)</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-medium">Conversion Rate</span>
                          <p className="text-sm text-slate-600">Persentase lead yang berhasil maju ke stage berikutnya</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Getting Started Tab */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-600" />
                    Memulai Menggunakan BKT-Leads
                  </CardTitle>
                  <CardDescription>
                    Langkah-langkah awal untuk menggunakan aplikasi dengan efektif
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Login ke Sistem</h3>
                      <p className="text-slate-600 mb-3">
                        Gunakan credentials admin yang telah diberikan untuk mengakses dashboard.
                      </p>
                      <div className="bg-slate-50 p-4 rounded-lg border">
                        <p className="text-sm font-medium mb-2">Credentials Administrator:</p>
                        <div className="space-y-1 text-sm text-slate-600">
                          <p><span className="font-medium">Email:</span> luhur@budikaryateknologi.com</p>
                          <p><span className="font-medium">Password:</span> BisnisBerkah</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Setup Supabase Database</h3>
                      <p className="text-slate-600 mb-3">
                        Koneksikan aplikasi ke database Supabase untuk menyimpan data lead secara permanen.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Klik tombol "Supabase" di navbar Softgen</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Buat project baru atau connect existing project</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Copy SQL dari file <code className="bg-slate-100 px-2 py-0.5 rounded">supabase-schema.sql</code></p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Paste dan run di SQL Editor Supabase</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Refresh preview - siap digunakan!</p>
                        </div>
                      </div>
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800">
                          <span className="font-medium">Mock Mode:</span> Tanpa Supabase, aplikasi berjalan dengan data demo di localStorage (tidak permanen)
                        </p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Kustomisasi Settings</h3>
                      <p className="text-slate-600 mb-3">
                        Sesuaikan funnel stages, script templates, dan labels sesuai kebutuhan bisnis.
                      </p>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Settings className="w-5 h-5 text-blue-600 mb-2" />
                          <p className="font-medium text-sm mb-1">Funnel Stages</p>
                          <p className="text-xs text-slate-600">Atur nama & deskripsi 20 stages</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-5 h-5 text-purple-600 mb-2" />
                          <p className="font-medium text-sm mb-1">Script Templates</p>
                          <p className="text-xs text-slate-600">Buat template pesan per stage</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <MessageSquare className="w-5 h-5 text-green-600 mb-2" />
                          <p className="font-medium text-sm mb-1">Custom Labels</p>
                          <p className="text-xs text-slate-600">Tag untuk kategorisasi lead</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">Mulai Menambahkan Lead</h3>
                      <p className="text-slate-600 mb-3">
                        Tambahkan lead baru dari berbagai sumber dan mulai tracking perjalanan mereka.
                      </p>
                      <Button className="gap-2" onClick={() => router.push("/dashboard")}>
                        <UserPlus className="w-4 h-4" />
                        Buka Dashboard
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lead Management Tab */}
            <TabsContent value="lead-management" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-green-600" />
                    Mengelola Lead
                  </CardTitle>
                  <CardDescription>
                    Panduan lengkap untuk menambah, mengedit, dan melacak lead
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Menambah Lead */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <UserPlus className="w-5 h-5 text-blue-600" />
                      Menambah Lead Baru
                    </h3>
                    <div className="space-y-3 ml-7">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          1
                        </div>
                        <p className="text-sm text-slate-600 pt-0.5">Klik tombol <span className="font-medium">"+ Tambah Lead"</span> di dashboard</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          2
                        </div>
                        <div className="pt-0.5">
                          <p className="text-sm text-slate-600 mb-2">Isi informasi lead:</p>
                          <div className="bg-slate-50 p-3 rounded-lg space-y-1 text-xs">
                            <p><span className="font-medium">Nama:</span> Nama lengkap prospek</p>
                            <p><span className="font-medium">Email:</span> Alamat email (optional)</p>
                            <p><span className="font-medium">Telepon:</span> Nomor WhatsApp/HP</p>
                            <p><span className="font-medium">Source:</span> FB Ads, Google Ads, Social Media, atau Manual</p>
                            <p><span className="font-medium">Funnel:</span> Follow Up (default) atau Broadcast</p>
                            <p><span className="font-medium">Stage:</span> Stage 1-10 (default: Stage 1)</p>
                            <p><span className="font-medium">Deal Value:</span> Estimasi nilai deal (optional)</p>
                            <p><span className="font-medium">Labels:</span> Tag untuk kategorisasi (optional)</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0">
                          3
                        </div>
                        <p className="text-sm text-slate-600 pt-0.5">Klik <span className="font-medium">"Simpan Lead"</span></p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Memindahkan Lead */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-purple-600" />
                      Memindahkan Lead Antar Stage
                    </h3>
                    <div className="space-y-3 ml-7">
                      <div>
                        <p className="font-medium text-sm mb-2">Metode 1: Drag & Drop (Kanban View)</p>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                          <p className="text-sm text-slate-600">Drag card lead ke kolom stage yang diinginkan</p>
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-sm mb-2">Metode 2: Detail Modal</p>
                        <div className="space-y-1">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-600">Klik card lead untuk buka detail</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-600">Pilih stage baru dari dropdown</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                            <p className="text-sm text-slate-600">Klik "Simpan Perubahan"</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Lead Detail */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-orange-600" />
                      Informasi Detail Lead
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 ml-7">
                      Klik card lead untuk melihat informasi lengkap:
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 ml-7">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Tab Informasi</p>
                        <p className="text-xs text-slate-600">Data kontak, source, deal value</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Tab Activity</p>
                        <p className="text-xs text-slate-600">Riwayat perpindahan stage & notes</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Tab Script</p>
                        <p className="text-xs text-slate-600">Template pesan untuk stage saat ini</p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg">
                        <p className="font-medium text-sm mb-1">Edit/Delete</p>
                        <p className="text-xs text-slate-600">Update data atau hapus lead</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Tips */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-2">Tips Manajemen Lead</p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Update notes setiap kali komunikasi dengan lead</li>
                          <li>• Gunakan labels untuk kategorisasi (Hot Lead, Cold Lead, dll)</li>
                          <li>• Set deal value sejak awal untuk tracking revenue</li>
                          <li>• Monitor activity log untuk review follow-up history</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Funnel System Tab */}
            <TabsContent value="funnel-system" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-purple-600" />
                    Sistem Dual-Funnel
                  </CardTitle>
                  <CardDescription>
                    Memahami logika perpindahan lead antara Follow Up dan Broadcast
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Funnel Diagram */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg font-medium text-center">
                          Follow Up Funnel
                        </div>
                        <div className="bg-white p-4 rounded-b-lg border border-t-0">
                          <p className="text-sm text-slate-600 mb-3">Lead yang aktif merespon komunikasi</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">1</div>
                              <span className="text-slate-700">Initial Contact</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">2</div>
                              <span className="text-slate-700">Qualification</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">3</div>
                              <span className="text-slate-700">Needs Analysis</span>
                            </div>
                            <div className="text-center text-xs text-slate-500 py-1">...</div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold">10</div>
                              <span className="text-slate-700">Closing</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <div className="bg-purple-600 text-white px-4 py-2 rounded-t-lg font-medium text-center">
                          Broadcast Funnel
                        </div>
                        <div className="bg-white p-4 rounded-b-lg border border-t-0">
                          <p className="text-sm text-slate-600 mb-3">Lead yang perlu reaktivasi</p>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">1</div>
                              <span className="text-slate-700">Re-engagement</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">2</div>
                              <span className="text-slate-700">Value Reminder</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">3</div>
                              <span className="text-slate-700">Special Offer</span>
                            </div>
                            <div className="text-center text-xs text-slate-500 py-1">...</div>
                            <div className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded bg-purple-100 flex items-center justify-center text-purple-600 text-xs font-bold">10</div>
                              <span className="text-slate-700">Final Attempt</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Logika Perpindahan */}
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Logika Perpindahan Funnel</h3>
                    
                    <div className="space-y-4">
                      {/* Flow 1 */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Lead Baru Masuk</h4>
                            <p className="text-sm text-slate-600">Dari sumber manapun → Masuk ke <span className="font-medium text-blue-600">Follow Up Stage 1</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Flow 2 */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-yellow-600" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Lead Tidak Merespon di Follow Up</h4>
                            <p className="text-sm text-slate-600 mb-2">Sales mencatat respon terakhir → Pindahkan ke <span className="font-medium text-purple-600">Broadcast Stage 1</span></p>
                            <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
                              <p className="font-medium">Cara Pindahkan:</p>
                              <p className="text-slate-600">1. Buka detail lead</p>
                              <p className="text-slate-600">2. Pilih funnel "Broadcast" & stage yang sesuai</p>
                              <p className="text-slate-600">3. Tambahkan notes tentang alasan pindah</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Flow 3 */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Lead di Broadcast Membalas</h4>
                            <p className="text-sm text-slate-600">Lead reaktif → Pindahkan kembali ke <span className="font-medium text-blue-600">Follow Up</span> (lanjut dari stage terakhir atau mulai dari awal)</p>
                          </div>
                        </div>
                      </div>

                      {/* Flow 4 */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Lead Melewati Broadcast Stage 10</h4>
                            <p className="text-sm text-slate-600">Tidak ada respon sampai stage terakhir → Status otomatis menjadi <span className="font-medium text-red-600">"LOST"</span></p>
                          </div>
                        </div>
                      </div>

                      {/* Flow 5 */}
                      <div className="border rounded-lg p-4 bg-green-50 border-green-200">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium mb-1">Lead Berhasil Closing</h4>
                            <p className="text-sm text-slate-600">Deal tercapai di Follow Up → Update status menjadi <span className="font-medium text-green-600">"DEAL"</span></p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Best Practices */}
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex gap-3">
                      <Lightbulb className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-2">Best Practices</p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Pindahkan ke Broadcast setelah 3-5 follow up tanpa respon</li>
                          <li>• Catat detail last response sebelum pindah funnel</li>
                          <li>• Review lead di Broadcast setiap minggu untuk reaktivasi</li>
                          <li>• Jangan langsung mark LOST - coba semua stage Broadcast dulu</li>
                          <li>• Update deal value saat lead menunjukkan buying signal</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-600" />
                    Bottleneck Analytics
                  </CardTitle>
                  <CardDescription>
                    Mengidentifikasi hambatan konversi dan mengoptimalkan funnel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Penjelasan Analytics */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Apa itu Bottleneck Analytics?</h3>
                    <p className="text-slate-600 mb-4">
                      Analytics yang menunjukkan persentase konversi antar stage untuk mengidentifikasi 
                      di mana lead paling banyak stuck atau drop off.
                    </p>
                    
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-600 mb-1">85%</div>
                        <p className="text-sm font-medium mb-1">Conversion Rate Tinggi</p>
                        <p className="text-xs text-slate-600">Stage berjalan lancar, lead bergerak maju</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-600 mb-1">45%</div>
                        <p className="text-sm font-medium mb-1">Conversion Rate Sedang</p>
                        <p className="text-xs text-slate-600">Perlu review script/approach di stage ini</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                        <div className="text-2xl font-bold text-red-600 mb-1">15%</div>
                        <p className="text-sm font-medium mb-1">Bottleneck Terdeteksi</p>
                        <p className="text-xs text-slate-600">URGENT: Banyak lead stuck di stage ini!</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Cara Membaca Analytics */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Cara Membaca Analytics</h3>
                    <div className="space-y-3">
                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
                          1
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Leads Entered</p>
                          <p className="text-sm text-slate-600">Jumlah total lead yang masuk ke stage tersebut</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
                          2
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Leads Progressed</p>
                          <p className="text-sm text-slate-600">Jumlah lead yang berhasil maju ke stage berikutnya</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
                          3
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Leads Stuck</p>
                          <p className="text-sm text-slate-600">Jumlah lead yang masih berada di stage ini (belum maju)</p>
                        </div>
                      </div>
                      <div className="flex gap-3 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-bold flex-shrink-0 mt-0.5">
                          4
                        </div>
                        <div>
                          <p className="font-medium text-sm mb-1">Conversion Rate</p>
                          <p className="text-sm text-slate-600">Persentase lead yang berhasil maju = (Progressed / Entered) × 100%</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Action Items */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Action Items Berdasarkan Analytics</h3>
                    
                    <div className="space-y-3">
                      <div className="border-l-4 border-red-500 pl-4 py-2">
                        <p className="font-medium text-sm mb-1">Jika Conversion Rate {"<"} 30%</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Review script template untuk stage tersebut</li>
                          <li>• Identifikasi objection patterns dari lead</li>
                          <li>• Update approach atau value proposition</li>
                          <li>• Training sales team untuk stage ini</li>
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-yellow-500 pl-4 py-2">
                        <p className="font-medium text-sm mb-1">Jika Banyak Lead Stuck {">"} 7 Hari</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Follow up lebih agresif dengan variasi approach</li>
                          <li>• Pertimbangkan pindah ke Broadcast funnel</li>
                          <li>• Cek apakah timing komunikasi sudah optimal</li>
                          <li>• Review kualitas lead dari source tersebut</li>
                        </ul>
                      </div>
                      
                      <div className="border-l-4 border-green-500 pl-4 py-2">
                        <p className="font-medium text-sm mb-1">Jika Conversion Rate {">"} 70%</p>
                        <ul className="text-sm text-slate-600 space-y-1">
                          <li>• Dokumentasikan best practices dari stage ini</li>
                          <li>• Replikasi approach ke stage lain yang lemah</li>
                          <li>• Share success stories dengan tim</li>
                          <li>• Maintain consistency dalam execution</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Tips Optimasi */}
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-sm mb-2">Tips Optimasi Funnel</p>
                        <ul className="space-y-1 text-sm text-slate-700">
                          <li>• Review analytics setiap minggu untuk track improvement</li>
                          <li>• A/B test script templates pada stage dengan bottleneck</li>
                          <li>• Segment lead by source untuk identifikasi source terbaik</li>
                          <li>• Set target conversion rate minimal per stage (misal 50%)</li>
                          <li>• Monitor perubahan trend setelah implementasi improvement</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-slate-600" />
                    Pengaturan Aplikasi
                  </CardTitle>
                  <CardDescription>
                    Kustomisasi funnel stages, scripts, labels, dan profile
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Funnel Stages */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <GitBranch className="w-5 h-5 text-blue-600" />
                      Funnel Stages Manager
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 ml-7">
                      Sesuaikan nama dan deskripsi untuk 20 stages (10 Follow Up + 10 Broadcast)
                    </p>
                    <div className="ml-7 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Buka Settings → Funnel Stages tab</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Edit nama stage sesuai sales journey Anda</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Tambahkan deskripsi detail untuk setiap stage</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Klik Save Changes untuk apply</p>
                      </div>
                    </div>
                    <div className="mt-3 ml-7 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm"><span className="font-medium">Contoh:</span> Stage 1 Follow Up = "Initial Contact & Greeting"</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Script Templates */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-purple-600" />
                      Script Templates Manager
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 ml-7">
                      Buat template pesan untuk setiap stage dengan support media links
                    </p>
                    <div className="ml-7 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Buka Settings → Script Templates tab</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Pilih funnel (Follow Up/Broadcast) dan stage</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Tulis template text message</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Tambahkan link media (video, image, PDF, dll)</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Save template - akan muncul di Lead Detail modal</p>
                      </div>
                    </div>
                    <div className="mt-3 ml-7 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm font-medium mb-2">Contoh Script Template:</p>
                      <p className="text-xs text-slate-700 mb-2">
                        "Halo [Nama], perkenalkan saya dari BKT. Kami melihat Anda tertarik dengan [Produk]. 
                        Ada yang bisa kami bantu?"
                      </p>
                      <p className="text-xs text-slate-600">
                        Media: https://drive.google.com/presentation-bkt-produk
                      </p>
                    </div>
                  </div>

                  <Separator />

                  {/* Custom Labels */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                      Custom Labels Manager
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 ml-7">
                      Buat labels untuk kategorisasi dan filtering lead
                    </p>
                    <div className="ml-7 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Buka Settings → Custom Labels tab</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Klik "Add Label" untuk buat label baru</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Pilih nama & warna label</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Apply labels ke lead dari detail modal</p>
                      </div>
                    </div>
                    <div className="mt-3 ml-7">
                      <p className="text-sm font-medium mb-2">Contoh Labels:</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-red-500">Hot Lead</Badge>
                        <Badge className="bg-blue-500">Cold Lead</Badge>
                        <Badge className="bg-green-500">High Budget</Badge>
                        <Badge className="bg-yellow-500">Perlu Follow Up</Badge>
                        <Badge className="bg-purple-500">VIP Client</Badge>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Profile & Security */}
                  <div>
                    <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      Profile & Security
                    </h3>
                    <p className="text-sm text-slate-600 mb-3 ml-7">
                      Kelola informasi profile dan keamanan akun
                    </p>
                    <div className="ml-7 space-y-2">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Buka Settings → Profile & Security tab</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Review informasi profile Anda</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Change password untuk keamanan</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Monitor active sessions</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mt-1 flex-shrink-0" />
                        <p className="text-sm text-slate-600">Logout dari aplikasi dengan aman</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tips & FAQ */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                    Tips & FAQ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="font-medium text-sm mb-2">Q: Bagaimana cara backup data?</p>
                    <p className="text-sm text-slate-600">A: Data tersimpan di Supabase dengan auto-backup. Export manual dapat dilakukan dari Supabase dashboard.</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Q: Apakah bisa multiple users/sales?</p>
                    <p className="text-sm text-slate-600">A: Saat ini single admin. Multi-user dapat diimplementasikan dengan menambahkan user management di Supabase.</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Q: Data lead hilang setelah refresh?</p>
                    <p className="text-sm text-slate-600">A: Pastikan Supabase sudah terkoneksi. Tanpa Supabase, data hanya di localStorage (tidak permanen).</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="font-medium text-sm mb-2">Q: Bagaimana cara reset password?</p>
                    <p className="text-sm text-slate-600">A: Buka Settings → Profile & Security → Change Password. Masukkan password lama dan password baru.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Footer CTA */}
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Siap Memaksimalkan Konversi Lead?</h3>
              <p className="text-blue-100 mb-4">Terapkan panduan ini dan lihat peningkatan performa sales Anda</p>
              <Button 
                onClick={() => router.push("/dashboard")}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                Kembali ke Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}