import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "material_inventory",
  title: "Material inventory balance",
  description: "Compute current material stock per site as (purchased - consumed) for each material.",
  inputSchema: {
    site_id: z.string().uuid().nullable().describe("Optional site UUID to scope inventory. Null for all sites."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ site_id }, ctx) => {
    if (!ctx.isAuthenticated())
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      {
        global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
        auth: { persistSession: false, autoRefreshToken: false },
      },
    );
    let pq = supabase.from("material_purchases").select("site_id,material,unit,qty");
    let uq = supabase.from("material_usage").select("site_id,material,unit,qty");
    if (site_id) {
      pq = pq.eq("site_id", site_id);
      uq = uq.eq("site_id", site_id);
    }
    const [pRes, uRes] = await Promise.all([pq, uq]);
    if (pRes.error) return { content: [{ type: "text", text: pRes.error.message }], isError: true };
    if (uRes.error) return { content: [{ type: "text", text: uRes.error.message }], isError: true };
    const bal = new Map<string, { site_id: string; material: string; unit: string; balance: number }>();
    for (const r of pRes.data ?? []) {
      const k = `${r.site_id}|${r.material}|${r.unit}`;
      const cur = bal.get(k) ?? { site_id: r.site_id, material: r.material, unit: r.unit, balance: 0 };
      cur.balance += Number(r.qty);
      bal.set(k, cur);
    }
    for (const r of uRes.data ?? []) {
      const k = `${r.site_id}|${r.material}|${r.unit}`;
      const cur = bal.get(k) ?? { site_id: r.site_id, material: r.material, unit: r.unit, balance: 0 };
      cur.balance -= Number(r.qty);
      bal.set(k, cur);
    }
    const inventory = Array.from(bal.values());
    return {
      content: [{ type: "text", text: JSON.stringify(inventory, null, 2) }],
      structuredContent: { inventory },
    };
  },
});
