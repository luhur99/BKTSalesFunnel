import { ProfileSecurity } from "@/components/settings/ProfileSecurity";
import { UserManagement } from "@/components/admin/UserManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Shield, Users } from "lucide-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { useRole } from "@/hooks/useRole";

export default function SettingsPage() {
  const router = useRouter();
  const { isAdmin } = useRole();
  const defaultTab = router.query.tab === "users" && isAdmin ? "users" : "security";

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="p-8 max-w-6xl mx-auto space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Global Settings</h1>
            <p className="text-muted-foreground">
              Manage your account security and preferences
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security & Account
                </TabsTrigger>
                {isAdmin && (
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Manage Users
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="security">
                <ProfileSecurity />
              </TabsContent>

              {isAdmin && (
                <TabsContent value="users">
                  <UserManagement />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
