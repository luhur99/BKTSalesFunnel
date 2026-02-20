import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Pencil, Trash2 } from "lucide-react";

interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

async function getAuthToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

async function apiFetch(path: string, options?: RequestInit) {
  const token = await getAuthToken();
  return fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });
}

export function UserManagement() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Add dialog state
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", password: "", full_name: "", role: "sales" as "admin" | "sales" });
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog state
  const [editUser, setEditUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ full_name: "", role: "sales" as "admin" | "sales", is_active: true });
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirmation state
  const [deleteUser, setDeleteUser] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    const res = await apiFetch("/api/admin/users");
    if (!res.ok) {
      toast({ title: "Error", description: "Gagal memuat daftar pengguna", variant: "destructive" });
      setLoading(false);
      return;
    }
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --- Add User ---
  const handleAddOpen = () => {
    setAddForm({ email: "", password: "", full_name: "", role: "sales" });
    setAddOpen(true);
  };

  const handleAddSubmit = async () => {
    if (!addForm.email || !addForm.password) {
      toast({ title: "Error", description: "Email dan password wajib diisi", variant: "destructive" });
      return;
    }
    setAddLoading(true);
    const res = await apiFetch("/api/admin/users", {
      method: "POST",
      body: JSON.stringify(addForm),
    });
    setAddLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast({ title: "Error", description: error ?? "Gagal membuat pengguna", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: `Pengguna ${addForm.email} berhasil dibuat` });
    setAddOpen(false);
    loadUsers();
  };

  // --- Edit User ---
  const handleEditOpen = (user: UserProfile) => {
    setEditUser(user);
    setEditForm({ full_name: user.full_name ?? "", role: (user.role as "admin" | "sales") ?? "sales", is_active: user.is_active });
  };

  const handleEditSubmit = async () => {
    if (!editUser) return;
    setEditLoading(true);
    const res = await apiFetch(`/api/admin/users/${editUser.id}`, {
      method: "PUT",
      body: JSON.stringify(editForm),
    });
    setEditLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast({ title: "Error", description: error ?? "Gagal mengupdate pengguna", variant: "destructive" });
      return;
    }
    toast({ title: "Berhasil", description: "Data pengguna berhasil diupdate" });
    setEditUser(null);
    loadUsers();
  };

  // --- Delete User ---
  const handleDeleteConfirm = async () => {
    if (!deleteUser) return;
    setDeleteLoading(true);
    const res = await apiFetch(`/api/admin/users/${deleteUser.id}`, { method: "DELETE" });
    setDeleteLoading(false);
    if (!res.ok) {
      const { error } = await res.json();
      toast({ title: "Error", description: error ?? "Gagal menghapus pengguna", variant: "destructive" });
      setDeleteUser(null);
      return;
    }
    toast({ title: "Berhasil", description: `Pengguna ${deleteUser.email} berhasil dihapus` });
    setDeleteUser(null);
    loadUsers();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Kelola Pengguna</h3>
          <p className="text-sm text-muted-foreground">Tambah, edit, atau hapus akun pengguna</p>
        </div>
        <Button onClick={handleAddOpen}>
          <UserPlus className="w-4 h-4 mr-2" />
          Tambah Pengguna
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Memuat data pengguna...</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Nama</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Terdaftar</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Belum ada pengguna
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email ?? "-"}</TableCell>
                  <TableCell>{user.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Sales"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "outline" : "destructive"}>
                      {user.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEditOpen(user)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteUser(user)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Add User Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Pengguna Baru</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-email">Email *</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="email@example.com"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password *</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-name">Nama Lengkap</Label>
              <Input
                id="add-name"
                placeholder="Nama lengkap"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={addForm.role}
                onValueChange={(value) => setAddForm({ ...addForm, role: value as "admin" | "sales" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={handleAddSubmit} disabled={addLoading}>
              {addLoading ? "Menyimpan..." : "Tambah Pengguna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={editUser?.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama Lengkap</Label>
              <Input
                id="edit-name"
                placeholder="Nama lengkap"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value as "admin" | "sales" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Sales</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="edit-active"
                checked={editForm.is_active}
                onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
              />
              <Label htmlFor="edit-active">Akun Aktif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Batal</Button>
            <Button onClick={handleEditSubmit} disabled={editLoading}>
              {editLoading ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
            <AlertDialogDescription>
              Akun <strong>{deleteUser?.email}</strong> akan dihapus permanen. Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
