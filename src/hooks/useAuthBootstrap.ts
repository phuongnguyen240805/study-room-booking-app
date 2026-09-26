import { useEffect } from 'react';
import { supabase } from '../services/supabase';
import { authService } from '../services/authService';
import { useBookingStore } from '../stores/useBookingStore';

export function useAuthBootstrap() {
  const setSession = useBookingStore((s) => s.setSession);
  const setProfile = useBookingStore((s) => s.setProfile);
  const setAuthLoading = useBookingStore((s) => s.setAuthLoading);
  const clearUserState = useBookingStore((s) => s.clearUserState);
  const loadSavedFilters = useBookingStore((s) => s.loadSavedFilters);

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      try {
        await loadSavedFilters();
        const { data } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(data.session);
          if (data.session?.user) {
            const profile = await authService.getProfile(data.session.user.id);
            if (isMounted) setProfile(profile);
          }
        }
      } catch (err) {
        console.warn('Lỗi bootstrap auth:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

        setSession(session);
        if (session?.user) {
          const profile = await authService.getProfile(session.user.id);
          if (isMounted) setProfile(profile);
        } else {
          clearUserState();
        }
        setAuthLoading(false);
      }
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);
}
