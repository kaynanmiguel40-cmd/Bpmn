/**
 * LoginPage - Pagina de autenticacao
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import logoFyness from '../../assets/logo-fyness.png';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, loading, error } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    const result = await signIn(email, password);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setLocalError(result.error || 'Erro ao fazer login');
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div className="text-center">
          <img src={logoFyness} alt="Fyness" className="mx-auto w-20 h-20 mb-4 object-contain" />
          <h2 className="text-3xl font-bold text-white">
            Fyness OS
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Sistema Operacional da Empresa
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl" role="region" aria-label="Formulario de login">
          <form onSubmit={handleSubmit} className="space-y-6" role="form" aria-label="Login">
            {/* Error Alert */}
            {(localError || error) && (
              <div role="alert" className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {localError || error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-slate-400">
                  Lembrar de mim
                </label>
              </div>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-700 text-white font-medium rounded-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Entrando...
                </span>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          Nao tem uma conta?{' '}
          <span className="text-blue-400 font-medium">
            Fale com o administrador
          </span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
