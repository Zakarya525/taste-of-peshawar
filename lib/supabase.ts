import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL || "https://your-project.supabase.co";
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Check if environment variables are properly set
if (
  !process.env.EXPO_PUBLIC_SUPABASE_URL ||
  !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
) {
  console.warn(
    "⚠️ Supabase environment variables not set. Please configure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Enums<T extends keyof Database["public"]["Enums"]> =
  Database["public"]["Enums"][T];

// Common types
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type MenuItem = Tables<"menu_items">;
export type MenuCategory = Tables<"menu_categories">;
export type Branch = Tables<"branches">;
export type BranchUser = Tables<"branch_users">;
export type Notification = Tables<"notifications">;
export type OrderStatus = Enums<"order_status">;
export type BranchName = Enums<"branch_name">;
