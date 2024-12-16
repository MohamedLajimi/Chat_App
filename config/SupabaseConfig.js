import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    'https://ctszgcbwwsotjcgwpqjh.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0c3pnY2J3d3NvdGpjZ3dwcWpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2NzgzMDYsImV4cCI6MjA0OTI1NDMwNn0.rREigtpb6D5VooanYuZTBph6UUE-Vi1gZyQfdohtIOA'
);


export default supabase;