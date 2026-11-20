import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default from environment variables or empty string
const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
const envAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let cachedClient: SupabaseClient | null = null;
let currentConfig = {
  url: envUrl,
  anonKey: envAnonKey,
};

export const getSupabaseClient = (customUrl?: string, customKey?: string): SupabaseClient | null => {
  const url = customUrl !== undefined ? customUrl : currentConfig.url;
  const key = customKey !== undefined ? customKey : currentConfig.anonKey;

  if (!url || !key) {
    return null;
  }

  // If already instantiated with same credentials, return cached
  if (cachedClient && currentConfig.url === url && currentConfig.anonKey === key) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    currentConfig = { url, anonKey: key };
    return cachedClient;
  } catch (error) {
    console.error('Supabase klientini yaratishda xatolik:', error);
    return null;
  }
};

export const testSupabaseConnection = async (url: string, key: string): Promise<{ success: boolean; message: string }> => {
  if (!url || !key) {
    return { success: false, message: 'URL yoki Anon Key kiritilmagan' };
  }

  try {
    const tempClient = createClient(url, key);
    // Test query on sdelkalar table
    const { error } = await tempClient.from('sdelkalar').select('id').limit(1);
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('relation "sdelkalar" does not exist')) {
        return {
          success: false,
          message: 'Supabase ga ulandi, lekin "sdelkalar" jadvali topilmadi. SQL skriptni bajaring!',
        };
      }
      return { success: false, message: `Xatolik: ${error.message}` };
    }

    return { success: true, message: 'Supabase bazasiga muvaffaqiyatli ulandi!' };
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    return { success: false, message: `Ulanish xatosi: ${errMsg}` };
  }
};
