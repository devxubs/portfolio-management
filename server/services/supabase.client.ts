import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;
let isConfigured = false;

const SUPABASE_SERVICE_ROLE_KEY =
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenhmcGhtaGxxcGVrd2lpdm54Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzUxMTA3OSwiZXhwIjoyMTAzMDg3MDc5fQ.WYUz_5NaLhIveiOJiTscn9-wQH3n3LdejcrvvJ3SZPA";

const SUPABASE_ANON_KEY =
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpenhmcGhtaGxxcGVrd2lpdm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1MTEwNzksImV4cCI6MjEwMzA4NzA3OX0.D-lgaSA_UdF1IEhBKIk--izRKgS8iddY9Q1moQd7rYU";
export function getSupabaseClient(): SupabaseClient | null {
   if (supabaseClient) {
      return supabaseClient;
   }

   const supabaseUrl = "https://eizxfphmhlqpekwiivnx.supabase.co";
   const supabaseKey = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;

   if (supabaseUrl && supabaseKey && supabaseUrl.startsWith("http")) {
      try {
         supabaseClient = createClient(supabaseUrl, supabaseKey, {
            auth: {
               persistSession: false,
               autoRefreshToken: false,
            },
         });
         isConfigured = true;
         console.log(
            "Supabase client initialized successfully with URL:",
            supabaseUrl,
         );
         return supabaseClient;
      } catch (err) {
         console.warn("Failed to initialize Supabase client:", err);
         return null;
      }
   }

   return null;
}

export function isSupabaseReady(): boolean {
   return !!getSupabaseClient();
}
