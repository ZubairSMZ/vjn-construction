import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "create_site",
  title: "Create a construction site",
  description: "Create a new construction site with name, location, and status.",
  inputSchema: {
    name: z.string().min(1).describe("Site name"),
    location: z.string().default("").describe("Site location or address"),
    status: z.enum(["active", "on-hold", "completed"]).default("active"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
  handler: async ({ name, location, status }, ctx) => {
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
    const { data, error } = await supabase
      .from("sites")
      .insert({ name, location, status, created_by: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Site created: ${data.name} (${data.id})` }],
      structuredContent: { site: data },
    };
  },
});
