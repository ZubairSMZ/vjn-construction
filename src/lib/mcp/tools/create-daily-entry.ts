import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "create_daily_entry",
  title: "Log a daily site entry",
  description: "Create a daily entry for a site with labor counts, progress %, supervisor and notes.",
  inputSchema: {
    site_id: z.string().uuid(),
    date: z.string().describe("ISO date YYYY-MM-DD"),
    supervisor: z.string().default(""),
    skilled: z.number().int().min(0).default(0),
    unskilled: z.number().int().min(0).default(0),
    percent: z.number().min(0).max(100).default(0),
    progress_note: z.string().default(""),
    remarks: z.string().nullable().default(null),
  },
  annotations: { readOnlyHint: false, destructiveHint: false },
  handler: async (input, ctx) => {
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
    const labor_total = input.skilled + input.unskilled;
    const { data, error } = await supabase
      .from("daily_entries")
      .insert({ ...input, labor_total, created_by: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Entry logged for ${data.date} (${data.id})` }],
      structuredContent: { entry: data },
    };
  },
});
