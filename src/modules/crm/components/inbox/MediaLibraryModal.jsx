/**
 * MediaLibraryModal — banco de vídeos/imagens pré-prontos.
 *
 * O vendedor filtra (categoria + tipo + busca) e clica pra MANDAR na conversa
 * (o envio é por URL, sem reupload). Admin adiciona/remove itens.
 */

import { useMemo, useState } from 'react';
import { Search, Plus, Trash2, Play, Image as ImageIcon, Video as VideoIcon, X, Loader2, Send } from 'lucide-react';
import { CrmModal } from '../ui/CrmModal';
import { useMediaLibrary, useAddMediaLibraryItem, useDeleteMediaLibraryItem } from '../../hooks/useCrmQueries';
import { useCrmAccess } from '../../hooks/useCrmAccess';

const TIPOS = [
  { key: 'all', label: 'Tudo' },
  { key: 'video', label: 'Vídeos' },
  { key: 'image', label: 'Imagens' },
];

function AddForm({ onDone }) {
  const add = useAddMediaLibraryItem();
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    const item = await add.mutateAsync({ file, title, category });
    if (item) { setFile(null); setTitle(''); setCategory(''); onDone?.(); }
  };

  return (
    <form onSubmit={submit} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-slate-50/60 dark:bg-slate-800/40">
      <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Adicionar à biblioteca</div>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full text-[13px] text-slate-600 dark:text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[13px] file:font-medium file:bg-fyness-primary/10 file:text-fyness-primary hover:file:bg-fyness-primary/20"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <input
          type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ex.: Como fazer um lançamento)"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        />
        <input
          type="text" value={category} onChange={(e) => setCategory(e.target.value)}
          placeholder="Categoria (ex.: Contas a pagar e receber)"
          list="media-cats"
          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        />
      </div>
      <button
        type="submit"
        disabled={add.isPending || !file || !title.trim()}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold bg-fyness-primary hover:bg-fyness-secondary text-white disabled:opacity-50"
      >
        {add.isPending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        {add.isPending ? 'Enviando…' : 'Adicionar'}
      </button>
    </form>
  );
}

function MediaCard({ item, onSelect, onDelete, canDelete, sending }) {
  const isVideo = item.mediaType === 'video';
  return (
    <div className="group relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-fyness-primary/50 transition-colors">
      <button
        type="button"
        onClick={() => onSelect(item)}
        disabled={sending}
        title="Enviar na conversa"
        className="block w-full text-left disabled:opacity-60"
      >
        <div className="relative aspect-video bg-slate-100 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
          {isVideo ? (
            <>
              <video src={item.mediaUrl} preload="metadata" muted playsInline className="w-full h-full object-cover pointer-events-none" />
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="w-9 h-9 rounded-full bg-black/55 flex items-center justify-center">
                  <Play size={16} className="text-white ml-0.5" />
                </span>
              </span>
            </>
          ) : (
            <img src={item.mediaUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
          )}
          {/* Overlay de "enviar" no hover */}
          <span className="absolute inset-0 bg-fyness-primary/0 group-hover:bg-fyness-primary/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-fyness-primary text-white text-[12px] font-semibold shadow">
              <Send size={12} /> Enviar
            </span>
          </span>
        </div>
        <div className="p-2">
          <div className="text-[13px] font-medium text-slate-800 dark:text-slate-100 line-clamp-2">{item.title}</div>
          {item.category && (
            <div className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.category}</div>
          )}
        </div>
      </button>
      {canDelete && (
        <button
          type="button"
          onClick={() => onDelete(item)}
          title="Remover da biblioteca"
          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 text-slate-500 hover:text-rose-600 shadow opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function MediaLibraryModal({ open, onClose, onSelect, sending }) {
  const { data: items = [], isLoading } = useMediaLibrary();
  const del = useDeleteMediaLibraryItem();
  const { isAdmin } = useCrmAccess();

  const [search, setSearch] = useState('');
  const [tipo, setTipo] = useState('all');
  const [cat, setCat] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const categorias = useMemo(
    () => [...new Set(items.map((i) => i.category).filter(Boolean))].sort((a, b) => a.localeCompare(b)),
    [items],
  );

  const filtrados = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((i) => {
      if (tipo !== 'all' && i.mediaType !== tipo) return false;
      if (cat && i.category !== cat) return false;
      if (q && !(`${i.title} ${i.category}`.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, search, tipo, cat]);

  return (
    <CrmModal open={open} onClose={onClose} title="Biblioteca de mídias" size="lg">
      <datalist id="media-cats">
        {categorias.map((c) => <option key={c} value={c} />)}
      </datalist>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por título ou categoria"
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          />
        </div>
        <select
          value={cat} onChange={(e) => setCat(e.target.value)}
          className="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        >
          <option value="">Todas as categorias</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800">
          {TIPOS.map((t) => (
            <button
              key={t.key} type="button" onClick={() => setTipo(t.key)}
              className={`px-2.5 py-1 text-[13px] font-medium rounded-md transition-colors ${tipo === t.key ? 'bg-white dark:bg-slate-700 text-fyness-primary shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        {isAdmin && (
          <button
            type="button" onClick={() => setShowAdd((v) => !v)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-semibold border border-fyness-primary/40 text-fyness-primary hover:bg-fyness-primary/10"
          >
            {showAdd ? <X size={15} /> : <Plus size={15} />} {showAdd ? 'Fechar' : 'Adicionar'}
          </button>
        )}
      </div>

      {isAdmin && showAdd && <div className="mb-3"><AddForm onDone={() => setShowAdd(false)} /></div>}

      {/* Grade */}
      {isLoading ? (
        <div className="py-12 text-center text-sm text-slate-400"><Loader2 size={20} className="animate-spin mx-auto mb-2" /> Carregando…</div>
      ) : filtrados.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2">
            {tipo === 'image' ? <ImageIcon size={22} className="text-slate-400" /> : <VideoIcon size={22} className="text-slate-400" />}
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {items.length === 0 ? 'Nenhuma mídia ainda.' : 'Nada com esse filtro.'}
          </p>
          {isAdmin && items.length === 0 && (
            <p className="text-[12px] text-slate-400 mt-1">Clique em “Adicionar” pra subir o primeiro vídeo/imagem.</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-[55vh] overflow-y-auto p-0.5">
          {filtrados.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onSelect={onSelect}
              onDelete={(it) => del.mutate(it.id)}
              canDelete={isAdmin}
              sending={sending}
            />
          ))}
        </div>
      )}
    </CrmModal>
  );
}

export default MediaLibraryModal;
