import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2,
  ArrowRight,
  Zap,
  TrendingUp,
  Users,
  Target
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  useEffect(() => {
    // Redirect already-authenticated users
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { user, error: authError } = await authService.signIn(formData.email, formData.password);

    if (authError || !user) {
      setError("Email atau password salah. Silakan coba lagi.");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: "Dual-Funnel Management",
      description: "Kelola leads melalui Follow Up & Broadcast funnel dengan 10 stage masing-masing"
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-600" />,
      title: "Smart Lead Routing",
      description: "Auto-switch antara funnel berdasarkan respons lead untuk optimalisasi konversi"
    },
    {
      icon: <Target className="w-6 h-6 text-purple-600" />,
      title: "Bottleneck Analytics",
      description: "Identifikasi hambatan di setiap stage dengan analytics real-time dan actionable insights"
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-600" />,
      title: "Script Management",
      description: "Template script untuk setiap stage dengan support text, media, dan visual content"
    }
  ];

  return (
    <>
      <Head>
        <title>BKT-Leads - CRM Lead Management System</title>
        <meta name="description" content="Sistem CRM untuk mengelola lead journey dengan dual-funnel: Follow Up & Broadcast" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 bg-blue-100 rounded-full">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-blue-700">Budi Karya Teknologi</span>
                </div>

                <div className="space-y-4">
                  <h1 className="text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                    Kelola Lead Journey dengan{" "}
                    <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Dual-Funnel
                    </span>
                  </h1>
                  <p className="text-xl text-slate-600 leading-relaxed">
                    Sistem CRM profesional untuk mengoptimalkan konversi leads melalui Follow Up & Broadcast funnel dengan analytics mendalam
                  </p>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">10 Stage per Funnel</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Auto Lead Routing</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Real-time Analytics</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-200">
                  <div>
                    <div className="text-3xl font-bold text-slate-900">20+</div>
                    <div className="text-sm text-slate-600">Total Stages</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">2</div>
                    <div className="text-sm text-slate-600">Funnel Types</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-slate-900">∞</div>
                    <div className="text-sm text-slate-600">Custom Scripts</div>
                  </div>
                </div>
              </div>

              {/* Right Column - Login Form */}
              <div className="relative">
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-8 -left-4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                
                <Card className="relative bg-white/90 backdrop-blur-lg shadow-2xl border-0 p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-2xl shadow-lg mb-4">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Login ke BKT-Leads</h2>
                    <p className="text-slate-600">Akses dashboard CRM Anda</p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="nama@perusahaan.com"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setError("");
                          }}
                          className="pl-11 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={(e) => {
                            setFormData({ ...formData, password: e.target.value });
                            setError("");
                          }}
                          className="pl-11 pr-11 h-12 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                        <span className="text-slate-600">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Lupa password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Masuk ke Dashboard
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-6 text-center text-sm text-slate-600">
                    Belum punya akses?{" "}
                    <button className="text-blue-600 hover:text-blue-700 font-semibold">
                      Hubungi Administrator
                    </button>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Fitur Utama BKT-Leads CRM
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Sistem lengkap untuk mengelola lead journey dari first contact hingga deal closed
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, idx) => (
                <Card key={idx} className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-slate-200 bg-white/80 backdrop-blur">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl flex items-center justify-center mb-4 ring-1 ring-slate-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                Cara Kerja Dual-Funnel System
              </h2>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                Sistem otomatis yang mengoptimalkan lead journey berdasarkan respons
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  1
                </div>
                <Card className="pt-10 p-6 bg-blue-50/50 border-blue-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Lead Masuk</h3>
                  <p className="text-slate-600">
                    Lead dari berbagai source (Facebook Ads, Google Ads, Social Media, Manual) masuk ke Follow Up Funnel
                  </p>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  2
                </div>
                <Card className="pt-10 p-6 bg-indigo-50/50 border-indigo-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Auto-Switch</h3>
                  <p className="text-slate-600">
                    Jika lead tidak merespon → pindah ke Broadcast. Jika lead membalas → kembali ke Follow Up
                  </p>
                </Card>
              </div>

              <div className="relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  3
                </div>
                <Card className="pt-10 p-6 bg-purple-50/50 border-purple-200">
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Deal Closed</h3>
                  <p className="text-slate-600">
                    Lead bergerak melalui 10 stage hingga Deal atau Lost (auto-lost jika Stage 10 Broadcast tanpa respon)
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="font-bold text-lg">BKT-Leads</div>
                  <div className="text-sm text-slate-400">Budi Karya Teknologi</div>
                </div>
              </div>
              <div className="text-slate-400 text-sm">
                © 2025 Budi Karya Teknologi. All rights reserved.
              </div>
            </div>
          </div>
        </footer>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .bg-grid-slate-200 {
          background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </>
  );
}