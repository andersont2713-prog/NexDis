import {createClient, type SupabaseClient} from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** Cliente para React (solo anon key). Útil para Auth y consultas públicas cuando habilites RLS. */
export const supabaseBrowser: SupabaseClient | null =
  url && anon ? createClient(url, anon) : null;

export function hasSupabaseBrowser(): boolean {
  return supabaseBrowser !== null;
}
