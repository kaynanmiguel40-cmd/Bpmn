import { useState, useEffect } from 'react';
import { canInstall, promptInstall, onInstallChange, isRunningAsPWA } from '../../lib/pwaUtils';
import logoFyness from '../../assets/logo-fyness.png';

/**
 * InstallPrompt - Banner para instalacao do PWA
 *
 * Aparece quando o navegador detecta que o app pode ser instalado.
 * Pode ser dispensado e nao aparece se ja estiver rodando como PWA.
 */
export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Nao mostrar se ja e PWA ou se foi dispensado antes
    if (isRunningAsPWA()) return;
    if (localStorage.getItem('pwa_dismissed') === 'true') return;

    // Verificar se ja pode instalar
    if (canInstall()) setShowPrompt(true);

    // Escutar mudancas
    onInstallChange((available) => {
      setShowPrompt(available);
    });
  }, []);

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (!showPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 animate-in slide-in-from-bottom">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex items-start gap-3">
          <img src={logoFyness} alt="Fyness" className="w-10 h-10 object-contain shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Instalar Fyness OS?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Acesse rapidamente a partir da tela inicial do seu dispositivo.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Instalar
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Agora nao
          </button>
        </div>
      </div>
    </div>
  );
}

export default InstallPrompt;
