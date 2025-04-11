import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Get the Supabase URL and service role key from environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create a Supabase client with the service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the SQL migration file
    const migrationSql = fs.readFileSync(
      path.join(process.cwd(), 'migrations', 'create_teams_tables.sql'),
      'utf8'
    );
    
    console.log('Running migration...');
    
    // Execute the SQL migration
    const { error } = await supabase.rpc('pgmigrate', { query: migrationSql });
    
    if (error) {
      console.error('Migration error:', error);
      return;
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Error running migration:', err);
  }
}

// Run the migration
runMigration(); 