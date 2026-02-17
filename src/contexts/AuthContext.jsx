import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Buscar perfil do usuario (com timeout de 5s)
  const fetchProfile = async (userId) => {
    try {
      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout ao buscar perfil')), 5000)
      );

      const query = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([query, timeout]);

      if (error) throw error;
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      return null;
    }
  };

  // Verificar sessao inicial
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Verificar se ha sessao ativa
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        }
      } catch (err) {
        console.error('Erro ao inicializar auth:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listener para mudancas de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login com email/senha
  const signIn = async (email, password) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      const msg = err.message || 'Erro ao fazer login';
      // Traduzir erros comuns do Supabase para portugues
      const translated =
        msg.includes('Invalid login credentials') ? 'Email ou senha incorretos' :
        msg.includes('Email not confirmed') ? 'Email ainda nao confirmado. Verifique sua caixa de entrada.' :
        msg.includes('Too many requests') ? 'Muitas tentativas. Aguarde alguns minutos.' :
        msg.includes('User not found') ? 'Usuario nao encontrado' :
        msg.includes('Network') || msg.includes('fetch') ? 'Erro de conexao. Verifique sua internet.' :
        msg;
      setError(translated);
      return { success: false, error: translated };
    }
  };

  // Registrar novo usuario
  const signUp = async (email, password, fullName) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Login com Google
  const signInWithGoogle = async () => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Logout
  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Atualizar perfil
  const updateProfile = async (updates) => {
    try {
      setError(null);
      if (!user) throw new Error('Usuario nao autenticado');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const value = {
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    isManager: profile?.role === 'manager' || profile?.role === 'admin',
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
    resetPassword,
    refreshProfile: () => user && fetchProfile(user.id)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
