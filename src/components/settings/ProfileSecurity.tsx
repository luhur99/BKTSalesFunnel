import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Shield, Key, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { authService } from "@/services/authService";

export function ProfileSecurity() {
  const router = useRouter();
  const { toast } = useToast();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    role: "",
    joinDate: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/");
        return;
      }
      const user = session.user;
      setUserInfo({
        name: user.user_metadata?.name || user.email?.split("@")[0] || "Administrator",
        email: user.email || "",
        role: "Super Admin",
        joinDate: new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    });
  }, [router]);

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast({ title: "Error", description: "Semua field password harus diisi", variant: "destructive" });
      return;
    }

    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: "Error", description: "Password baru tidak cocok", variant: "destructive" });
      return;
    }

    if (passwordForm.new.length < 8) {
      toast({ title: "Error", description: "Password minimal 8 karakter", variant: "destructive" });
      return;
    }

    // Verify current password by re-authenticating
    const { error: verifyError } = await authService.signIn(userInfo.email, passwordForm.current);
    if (verifyError) {
      toast({ title: "Error", description: "Password saat ini salah", variant: "destructive" });
      return;
    }

    // Update to new password via Supabase
    const { error: updateError } = await supabase.auth.updateUser({ password: passwordForm.new });
    if (updateError) {
      toast({ title: "Error", description: "Gagal mengubah password: " + updateError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Success", description: "Password berhasil diubah. Silakan login kembali." });
    setPasswordForm({ current: "", new: "", confirm: "" });
    setIsChangingPassword(false);

    setTimeout(() => handleLogout(), 2000);
  };

  const handleLogout = async () => {
    await authService.signOut();
    router.push("/");
  };

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Informasi Profil
          </CardTitle>
          <CardDescription>Detail akun dan informasi login Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <Avatar className="w-20 h-20">
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-600 text-white text-2xl">
                {userInfo.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <div>
                <Label className="text-sm text-muted-foreground">Nama Lengkap</Label>
                <p className="text-lg font-medium">{userInfo.name}</p>
              </div>
              <div>
                <Label className="text-sm text-muted-foreground">Email</Label>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  {userInfo.email}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Role</Label>
                  <p className="font-medium">{userInfo.role}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Bergabung Sejak</Label>
                  <p className="font-medium">{userInfo.joinDate}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Keamanan Akun
          </CardTitle>
          <CardDescription>Kelola password dan pengaturan keamanan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">Terakhir diubah 30 hari yang lalu</p>
              </div>
            </div>
            <Button
              variant={isChangingPassword ? "outline" : "default"}
              onClick={() => setIsChangingPassword(!isChangingPassword)}
            >
              {isChangingPassword ? "Batal" : "Ubah Password"}
            </Button>
          </div>

          {isChangingPassword && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
              <div className="space-y-2">
                <Label>Password Saat Ini</Label>
                <Input
                  type="password"
                  placeholder="Masukkan password saat ini"
                  value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Password Baru</Label>
                <Input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Konfirmasi Password Baru</Label>
                <Input
                  type="password"
                  placeholder="Ketik ulang password baru"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ current: "", new: "", confirm: "" });
                  }}
                >
                  Batal
                </Button>
                <Button onClick={handleChangePassword}>
                  Simpan Password
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/20">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">Tambah lapisan keamanan ekstra (Coming Soon)</p>
            </div>
            <Button variant="outline" disabled>
              Enable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Session Info */}
      <Card>
        <CardHeader>
          <CardTitle>Session Aktif</CardTitle>
          <CardDescription>Perangkat yang sedang login dengan akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Chrome - Windows</p>
                <p className="text-sm text-muted-foreground">Jakarta, Indonesia • Aktif sekarang</p>
              </div>
              <span className="text-xs text-green-600 font-medium">Current</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logout Section */}
      <Card className="border-red-200 bg-red-50/50">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Keluar dari akun Anda</CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={handleLogout}
            className="w-full sm:w-auto"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout dari Akun
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}