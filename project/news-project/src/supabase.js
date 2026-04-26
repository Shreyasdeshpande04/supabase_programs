import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://wlllahhkrpkwyhypdken.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsbGxhaGhrcnBrd3loeXBka2VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDI2NTUsImV4cCI6MjA5MTcxODY1NX0.x3te9BoICCaW5W8O7evK5xZYMn6cFfpVq6mbuoSCRq0'

export const supabase = createClient(supabaseUrl, supabaseKey)