import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest, NextApiResponse } from "next";

// Server-only admin client — uses service role key, never exposed to browser
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

  if (req.method === "GET") {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  if (req.method === "POST") {
    const { email, password, full_name, role } = req.body as {
      email: string;
      password: string;
      full_name?: string;
      role?: "admin" | "sales";
    };

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name: full_name ?? "", role: role ?? "sales" },
      email_confirm: true,
    });

    if (error) return res.status(400).json({ error: error.message });
    return res.status(201).json(data.user);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
