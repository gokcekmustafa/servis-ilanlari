import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://urdqgkkjiblhmcmgnmlu.supabase.co';
const supabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZHFna2tqaWJsaG1jbWdubWx1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2OTE2NjcsImV4cCI6MjA4OTI2NzY2N30.zahyGPWPOfEQoYumRX_yrhL9i5n55pW5yLk1bkTuRMk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
