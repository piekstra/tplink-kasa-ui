import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { Navigate, Outlet, useNavigate, useOutletContext } from 'react-router';

import { useHttp } from '@/api/services';
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
  const http = useHttp();

  const signOut = useCallback(() => {
    logout();
    queryClient.clear();
    void navigate('/login', { replace: true });
  }, [navigate, queryClient]);

  useEffect(() => {
    // A 401 on any authed request (expired token) tears down the session and
    // returns to login. Registering the handler here keeps the transport free
    // of router/auth knowledge — it just calls back on 401.
    http.setOnUnauthorized(signOut);
    return () => http.setOnUnauthorized(null);
  }, [http, signOut]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet context={{ signOut }} />;
}
