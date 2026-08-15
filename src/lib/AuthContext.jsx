import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { base44, supabase } from '@/api/base44Client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [appPublicSettings] = useState(null);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setAuthError(null);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setAuthError(null);
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  const checkAppState = useCallback(async () => {
    await checkUserAuth();
  }, [checkUserAuth]);

  useEffect(() => {
    let mounted = true;
    checkUserAuth();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      const nextUser = session?.user || null;
      setUser(nextUser ? {
        id: nextUser.id,
        email: nextUser.email,
        full_name: nextUser.user_metadata?.full_name || nextUser.user_metadata?.name || '',
        ...nextUser.user_metadata,
      } : null);
      setIsAuthenticated(!!nextUser);
      setAuthChecked(true);
      setIsLoadingAuth(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [checkUserAuth]);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/login';
  };

  const navigateToLogin = () => {
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      authChecked,
      logout,
      navigateToLogin,
      checkUserAuth,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
