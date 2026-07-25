import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import { mockCategories } from "@/lib/mock-data";
import type { Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = isSupabaseConfigured ? await createServerSupabase() : null;
  if (!supabase) return mockCategories;

  const { data } = await supabase
    .from("categories")
    .select("id,name,slug,image,created_at")
    .order("name");

  return (data ?? []) as Category[];
}
