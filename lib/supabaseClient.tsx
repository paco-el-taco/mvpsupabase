import { createClient } from "@supabase/supabase-js";


const supabaseUrl = "https://somwrrmvltaofdrdfnbz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbXdycm12bHRhb2ZkcmRmbmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4MDY0OTcsImV4cCI6MjA5NTM4MjQ5N30.XMFJEBPjtt0QAnGsyZ0BpH3cp7yRXRqyzVBLGpcgFOo";


export const supabase = createClient(supabaseUrl, supabaseKey);