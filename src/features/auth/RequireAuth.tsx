import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useOutletContext } from 'react-router';

import { AUTH_EXPIRED_EVENT } from '@/api/http';
import { isAuthenticated, logout } from './auth';

export interface SessionContext {
  signOut: () => void;
}

/** Read the session context, throwing at the seam if used outside RequireAuth. */
export function useSession(): SessionContext {
  const context = useOutletContext<SessionContext | null>();
  if (!context) {
    throw new Error('useSession must be used inside a RequireAuth route');
  }
  return context;
}

/**
 * Route guard that owns the whole session lifecycle: the token gate and the
 * global 401 -> sign-out subscription. Wrapping the app routes with this keeps
 * AppShell responsible for layout only.
 */
export function RequireAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const signOut = useCallback(() => {
    logout();
    queryClient.clear();
    void navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  useEffect(() => {
    // A 401 anywhere (expired token) tears down the session and returns to login
    window.addEventListener(AUTH_EXPIRED_EVENT, signOut);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, signOut);
  }, [signOut]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ signOut }} />;
}
