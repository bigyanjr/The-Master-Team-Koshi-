import {
  createContext, useContext, useState, useEffect, useCallback, useMemo,
} from 'react';
import {
  subscribeToAuth,
  registerUser,
  loginUser,
  logoutUser,
  validateRegistration,
  updateUserProfile,
  ROLES,
} from '../services/authService';
import {
  canAccessAdmin,
  getUserHomeRoute,
  isApprovedWardAdmin,
  isWardAdminProfile,
} from '../utils/permissions';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextProfile) => {
      setProfile(nextProfile);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const register = useCallback(async (payload) => {
    const nextProfile = await registerUser(payload);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const login = useCallback(async (email, password) => {
    const nextProfile = await loginUser(email, password);
    setProfile(nextProfile);
    return nextProfile;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates) => {
    const nextProfile = await updateUserProfile(profile?.uid, updates);
    setProfile(nextProfile);
    return nextProfile;
  }, [profile?.uid]);

  const value = useMemo(() => ({
    profile,
    user: profile,
    loading,
    isAuthenticated: Boolean(profile?.uid && profile?.email),
    isWardAdmin: isWardAdminProfile(profile),
    isApprovedWardAdmin: isApprovedWardAdmin(profile),
    canAccessAdminPortal: canAccessAdmin(profile),
    register,
    login,
    logout,
    updateProfile,
    validateRegistration,
    getPostLoginPath: () => getUserHomeRoute(profile),
    ROLES,
  }), [profile, loading, register, login, logout, updateProfile]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
