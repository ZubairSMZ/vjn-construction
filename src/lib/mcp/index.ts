import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listSites from "./tools/list-sites";
import createSite from "./tools/create-site";
import listDailyEntries from "./tools/list-daily-entries";
import createDailyEntry from "./tools/create-daily-entry";
import listExpenses from "./tools/list-expenses";
import logExpense from "./tools/log-expense";
import materialInventory from "./tools/material-inventory";

// Direct Supabase host (not the .lovable.cloud proxy) — required for OAuth issuer match.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "vjn-construction-mcp",
  title: "VJN Construction Site Tracker",
  version: "0.1.0",
  instructions:
    "Tools for the VJN Construction daily site tracker: list and create sites, log and read daily labor/progress entries, log and read expenses, and check material inventory balances. All calls act as the signed-in user under row-level security.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listSites,
    createSite,
    listDailyEntries,
    createDailyEntry,
    listExpenses,
    logExpense,
    materialInventory,
  ],
});
