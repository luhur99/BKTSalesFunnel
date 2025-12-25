import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User, Mail, Shield, Key, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Admin credentials
const ADMIN_CREDENTIALS = {
  email: "luhur@budikaryateknologi.com",
  password: "BisnisBerkah",
  name: "Luhur Budi Karya",
  role: "Super Admin",
};

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
    // Get user info from localStorage
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");
    const userName = localStorage.getItem("userName");

    if (!isLoggedIn || isLoggedIn !== "true") {
      router.push("/");
      return;
    }

    setUserInfo({
      name: userName || ADMIN_CREDENTIALS.name,
      email: userEmail || ADMIN_CREDENTIALS.email,
      role: ADMIN_CREDENTIALS.role,
      joinDate: "January 2025",
    });
  }, [router]);

  const handleChangePassword = () => {
    // Validate all fields filled
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      toast({
        title: "Error",
        description: "Semua field password harus diisi",
        variant: "destructive",
      });
      return;
    }

    // Validate current password
    if (passwordForm.current !== ADMIN_CREDENTIALS.password) {
      toast({
        title: "Error",
        description: "Password saat ini salah",
        variant: "destructive",
      });
      return;
    }

    // Validate new password match
    if (passwordForm.new !== passwordForm.confirm) {
      toast({
        title: "Error",
        description: "Password baru tidak cocok",
        variant: "destructive",
      });
      return;
    }

    // Validate password length
    if (passwordForm.new.length < 8) {
      toast({
        title: "Error",
        description: "Password minimal 8 karakter",
        variant: "destructive",
      });
      return;
    }

    // Update admin password (in real app, this would update database)
    ADMIN_CREDENTIALS.password = passwordForm.new;

    toast({
      title: "Success",
      description: "Password berhasil diubah. Silakan login kembali dengan password baru.",
    });

    // Clear form and close
    setPasswordForm({ current: "", new: "", confirm: "" });
    setIsChangingPassword(false);

    // Logout after password change
    setTimeout(() => {
      handleLogout();
    }, 2000);
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
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