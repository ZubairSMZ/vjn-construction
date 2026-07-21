import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "list_daily_entries",
  title: "List daily site entries",
  description: "List recent daily site entries (labor, progress) with optional site filter.",
  inputSchema: {
    site_id: z.string().uuid().nullable().describe("Optional site UUID to filter by. Null for all sites."),
    limit: z.number().int().min(1).max(200).default(50),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ site_id, limit }, ctx) => {
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
    let q = supabase
      .from("daily_entries")
      .select("id,site_id,date,supervisor,skilled,unskilled,labor_total,percent,progress_note,remarks")
      .order("date", { ascending: false })
      .limit(limit);
    if (site_id) q = q.eq("site_id", site_id);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { entries: data ?? [] },
    };
  },
});
