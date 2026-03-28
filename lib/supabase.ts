
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://roqhysljzhzcsyuiumpw.supabase.co';
const supabaseAnonKey = 'sb_publishable_aacObqyjDy6kaNpON981Hg_DooRIZ-o';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
