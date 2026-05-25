import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const AuthContext = createContext();

const API = '/api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pollingRef = useRef(null);

  // Silent session recovery on mount
  useEffect(() => {
    checkSession().finally(() => setLoading(false));
  }, []);

  // Poll user session when the drawer panel is open
  useEffect(() => {
    if (drawerOpen && user && user.role !== 'admin') {
      pollingRef.current = setInterval(() => {
        checkSession(true);
      }, 8000);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [drawerOpen, user]);

  const checkSession = async (silent = false) => {
    try {
      const res = await fetch(`${API}/me`, { credentials: 'include' });
      if (res.ok) {
        const result = await res.json();
        setUser(result.data);
      } else {
        setUser(null);
      }
    } catch (err) {
      if (!silent) console.error('[AuthContext] Session verification failed:', err);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Login failed.');

    setUser(result.data);
    await checkSession(true); // force reload full details (reservations & orders history)
    return result;
  };

  const signup = async (name, email, password) => {
    const res = await fetch(`${API}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Signup failed.');

    setUser(result.data);
    await checkSession(true); // force reload full details (reservations & orders history)
    return result;
  };

  const logout = async () => {
    try {
      await fetch(`${API}/logout`, { method: 'POST', credentials: 'include' });
    } catch (err) {
      console.warn('[AuthContext] Logout warning:', err);
    } finally {
      setUser(null);
      setDrawerOpen(false);
    }
  };

  const deleteAccount = async (password) => {
    const res = await fetch(`${API}/delete-account`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ password }),
    });

    const result = await res.json();
    if (!res.ok) throw new Error(result.message || 'Account deletion failed.');

    setUser(null);
    setDrawerOpen(false);
    return result;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        loading,
        drawerOpen,
        setDrawerOpen,
        login,
        signup,
        logout,
        deleteAccount,
        refreshSession: () => checkSession(true),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
