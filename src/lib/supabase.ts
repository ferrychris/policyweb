import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://vgedgxfxhiiilzqydfxu.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZnZWRneGZ4aGlpaWx6cXlkZnh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwMDk1NjksImV4cCI6MjA1NzU4NTU2OX0.sw3jQaUrMz6_Iv2ezz1hQbXtOqzWOlT9DSzRkt3W-DM";

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);