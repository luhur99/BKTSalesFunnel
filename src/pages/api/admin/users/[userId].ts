import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function verifyAdmin(req: NextApiRequest): Promise<{ userId: string } | null> {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;

  const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !user) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if ((profile as any)?.role !== "admin") return null;
  return { userId: user.id };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const caller = await verifyAdmin(req);
  if (!caller) return res.status(401).json({ error: "Unauthorized" });

  const { userId } = req.query as { userId: string };

  if (req.method === "PUT") {
    const { full_name, role, is_active } = req.body as {
      full_name?: string;
      role?: "admin" | "sales";
      is_active?: boolean;
    };

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = full_name;
    if (role !== undefined) updates.role = role;
    if (is_active !== undefined) updates.is_active = is_active;
    updates.updated_at = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("profiles")
      .update(updates)
      .eq("id", userId);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  if (req.method === "DELETE") {
    // Prevent admin from deleting themselves
    if (userId === caller.userId) {
      return res.status(400).json({ error: "Cannot delete your own account" });
    }

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
