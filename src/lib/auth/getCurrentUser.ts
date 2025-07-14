import 'server-only';
import { createServerSideClient } from '@/lib/supabase/server';

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const supabase = await createServerSideClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      name:
        user.user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown',
      email: user.email || '',
      isAdmin: user.user_metadata?.is_admin || false,
    };
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
}
