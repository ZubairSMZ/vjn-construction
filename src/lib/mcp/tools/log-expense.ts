import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

export default defineTool({
  name: "log_expense",
  title: "Log a site expense",
  description: "Record a site expense with amount, category, description and payment method.",
  inputSchema: {
    site_id: z.string().uuid(),
    date: z.string().describe("ISO date YYYY-MM-DD"),
    category: z.string().default("General"),
    description: z.string().default(""),
    amount: z.number().min(0),
    method: z.string().default("Cash"),
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
    const { data, error } = await supabase
      .from("expenses")
      .insert({ ...input, created_by: ctx.getUserId() })
      .select()
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Expense logged: ${data.category} ₹${data.amount}` }],
      structuredContent: { expense: data },
    };
  },
});
