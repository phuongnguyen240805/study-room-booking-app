import { useEffect } from 'react';
import * as Linking from 'expo-linking';
import { supabase } from '../services/supabase';
import { authService, isAuthCallbackUrl } from '../services/authService';
import { useBookingStore } from '../stores/useBookingStore';

export function useAuthBootstrap() {
  const setSession = useBookingStore((s) => s.setSession);
  const setProfile = useBookingStore((s) => s.setProfile);
  const setAuthLoading = useBookingStore((s) => s.setAuthLoading);
  const clearUserState = useBookingStore((s) => s.clearUserState);
  const loadSavedFilters = useBookingStore((s) => s.loadSavedFilters);

  useEffect(() => {
    let isMounted = true;

    function applyProfile(userId: string) {
      setTimeout(() => {
        if (!isMounted) return;
        authService.getProfile(userId).then((profile) => {
          if (isMounted) setProfile(profile);
        });
      }, 0);
    }

    async function bootstrap() {
      try {
        await loadSavedFilters();
        const { data } = await supabase.auth.getSession();

        if (isMounted) {
          setSession(data.session);
          if (data.session?.user) {
            applyProfile(data.session.user.id);
          }
        }
      } catch (err) {
        console.warn('Lỗi bootstrap auth:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    }

    bootstrap();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_OUT') {
        clearUserState();
        setAuthLoading(false);
        return;
      }

      setSession(session);
      setAuthLoading(false);
      if (session?.user) {
        applyProfile(session.user.id);
      }
    });

    async function handleIncomingUrl(url: string | null) {
      if (!isMounted || !isAuthCallbackUrl(url)) return;
      try {
        const result = await authService.completeSessionFromUrl(url as string);
        if (result.session && isMounted) {
          setSession(result.session);
          if (result.session.user) applyProfile(result.session.user.id);
        }
      } catch (err) {
        console.warn('Lỗi xử lý đường dẫn đăng nhập:', err);
      }
    }

    Linking.getInitialURL().then(handleIncomingUrl).catch(console.warn);
    const linkSub = Linking.addEventListener('url', ({ url }) => {
      handleIncomingUrl(url);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
      linkSub.remove();
    };
  }, []);
}
