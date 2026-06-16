/**
 * LoginPage - Pagina de autenticacao
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
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

  const from = location.state?.from?.pathname || '/financial';

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

  const busy = isSubmitting || loading;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 app-mesh px-4 py-12">
      {/* Orbs decorativos — profundidade/atmosfera */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-24 w-96 h-96 rounded-full bg-fyness-primary/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -right-24 w-[28rem] h-[28rem] rounded-full bg-violet-500/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center mb-5">
            <div aria-hidden className="absolute inset-0 rounded-2xl bg-fyness-primary/40 blur-2xl" />
            <img src={logoFyness} alt="Fyness" className="relative w-16 h-16 object-contain drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Fyness OS</h1>
          <p className="mt-1.5 text-sm text-slate-400">Sistema Operacional da Empresa</p>
        </div>

        {/* Card */}
        <div
          className="rounded-3xl border border-white/10 bg-white/[0.06] backdrop-blur-2xl p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.6)]"
          role="region"
          aria-label="Formulario de login"
        >
          <form onSubmit={handleSubmit} className="space-y-5" role="form" aria-label="Login">
            {/* Error Alert */}
            {(localError || error) && (
              <div role="alert" className="p-3.5 bg-red-500/15 border border-red-500/40 rounded-xl text-red-200 text-sm animate-fade-up">
                {localError || error}
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
              <div className="relative">
                <Mail aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  aria-required="true"
                  className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fyness-primary/70 focus:border-transparent focus:bg-white/[0.07] transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1.5">Senha</label>
              <div className="relative">
                <Lock aria-hidden className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  aria-required="true"
                  className="w-full pl-11 pr-12 py-3 bg-white/[0.04] border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fyness-primary/70 focus:border-transparent focus:bg-white/[0.07] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-200 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label htmlFor="remember" className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer select-none">
                <input
                  id="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-fyness-primary focus:ring-fyness-primary/70 focus:ring-offset-0"
                />
                Lembrar de mim
              </label>
              <a href="#" className="text-sm font-medium text-fyness-accent hover:text-white transition-colors">
                Esqueceu a senha?
              </a>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={busy}
              className="group w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-fyness-primary to-fyness-secondary shadow-glow-blue hover:shadow-[0_12px_40px_-8px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:ring-offset-2 focus:ring-offset-slate-950 transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {busy ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Entrando...</>
              ) : (
                <>Entrar <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" /></>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-500">
          Nao tem uma conta?{' '}
          <span className="text-slate-300 font-medium">Fale com o administrador</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
