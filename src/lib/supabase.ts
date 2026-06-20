import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  client = createClient(supabaseUrl, supabaseAnonKey);
  return client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});

export type MenuItem = {
  id: string;
  name: string;
  price: number;
  category: string;
  status: "available" | "unavailable";
  image_url?: string;
  created_at: string;
};

export type Order = {
  id: string;
  items_json: CartItem[];
  total_amount: number;
  payment_received: number;
  change: number;
  created_at: string;
};

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
};

export type OrderInsert = Omit<Order, "id" | "created_at">;
