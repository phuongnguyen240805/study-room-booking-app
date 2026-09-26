import type { Session, User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  student_code: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
}
