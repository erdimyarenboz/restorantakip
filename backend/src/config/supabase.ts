import 'dotenv/config'; // Load env vars FIRST
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://uknxkabllvbmkwanawvf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

console.log('🔧 Supabase Config:');
console.log('   URL:', supabaseUrl);
console.log('   Key loaded:', supabaseServiceKey ? `Yes (${supabaseServiceKey.substring(0, 20)}...)` : 'No');

if (!supabaseServiceKey) {
    console.error('⚠️  SUPABASE_SERVICE_KEY not found in environment variables');
    console.error('   Available env keys:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
    throw new Error('Supabase service key is required');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

console.log('✅ Supabase client initialized successfully');
