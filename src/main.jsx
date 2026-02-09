import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'

// Remover badge do Supabase
const removeSupabaseBadge = () => {
  const checkAndRemove = () => {
    // Procurar em TODAS as divs, não só fora do root
    document.querySelectorAll('div').forEach(div => {
      const textContent = div.textContent || '';
      const className = div.className || '';

      // Verificar se contém "Supabase" no texto ou classes específicas
      if (
        textContent.trim().toLowerCase() === 'supabase' ||
        (textContent.toLowerCase().includes('supabase') && textContent.length < 50)
      ) {
        console.log('Removendo badge do Supabase:', div);
        div.style.display = 'none !important';
        div.remove();
      }
    });

    // Procurar também por links e elementos com href supabase
    document.querySelectorAll('a[href*="supabase"]').forEach(el => {
      console.log('Removendo link Supabase:', el);
      el.style.display = 'none';
      el.remove();
    });
  };

  // Observer para mudanças no DOM
  const observer = new MutationObserver(checkAndRemove);
  observer.observe(document.body, {
    childList: true,
    subtree: true // IMPORTANTE: true para pegar mudanças dentro do root
  });

  // Executar periodicamente
  setInterval(checkAndRemove, 500);

  // Executar várias vezes no início
  setTimeout(checkAndRemove, 50);
  setTimeout(checkAndRemove, 200);
  setTimeout(checkAndRemove, 500);
  setTimeout(checkAndRemove, 1000);
  setTimeout(checkAndRemove, 2000);
};

removeSupabaseBadge();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
