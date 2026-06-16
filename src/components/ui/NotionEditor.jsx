/**
 * Editor rico estilo Notion baseado em TipTap.
 * Extraido de TaskTable.jsx para reutilizacao em OS, EAP, etc.
 */
import { useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import { Image } from '@tiptap/extension-image';
import { Highlight } from '@tiptap/extension-highlight';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Youtube } from '@tiptap/extension-youtube';
import { TextAlign } from '@tiptap/extension-text-align';
import { FULL_BRIEFINGS, TABLE_SNIPPETS } from '../../lib/briefingTemplates';
import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details';
import { SlashCommand } from './SlashCommand';
import { uploadOSImage } from '../../lib/uploadOSImage';

const CALLOUT_HTML = `<blockquote><p>&#128161; <strong>Dica:</strong> </p></blockquote>`;

// Teto de tamanho por imagem. Com Storage o normal nem inflaria o registro,
// mas o fallback base64 (quando o Storage falha) ficaria inline — entao o teto
// limita o pior caso. 5MB cobre print de tela tranquilo.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// ==================== HELPERS ====================

export function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

/** Troca o src de UM no de imagem (do base64 recem-colado pra URL do Storage)
 *  sem mexer no resto do documento — preserva posicao, ordem e demais atributos.
 *  Casa pelo proprio base64 (unico por colagem), entao funciona ate com a mesma
 *  imagem colada 2x (cada upload troca o no base64 que ainda restou). */
function replaceImageSrc(editor, oldSrc, newSrc) {
  if (!editor || editor.isDestroyed) return;
  const { state, view } = editor;
  let found = null;
  state.doc.descendants((node, pos) => {
    if (found !== null) return false;
    if (node.type.name === 'image' && node.attrs?.src === oldSrc) { found = { node, pos }; return false; }
    return true;
  });
  if (found === null) return;
  const tr = state.tr.setNodeMarkup(found.pos, undefined, { ...found.node.attrs, src: newSrc });
  view.dispatch(tr);
}

function buildExtensions(placeholderText) {
  return [
    StarterKit.configure({
      heading: { levels: [1, 2, 3] },
      bulletList: { keepMarks: true },
      orderedList: { keepMarks: true },
    }),
    Placeholder.configure({
      placeholder: placeholderText || 'Escreva aqui...',
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    Image.configure({ inline: false, allowBase64: true }),
    Highlight.configure({ multicolor: true }),
    TextStyle,
    Color,
    Youtube.configure({ width: 480, height: 270, nocookie: true }),
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Details.configure({ persist: true, HTMLAttributes: { class: 'editor-details' } }),
    DetailsSummary,
    DetailsContent,
    SlashCommand,
  ];
}

// ==================== TOOLBAR ====================

function NotionToolbar({ editor, onPickImage }) {
  const [tplOpen, setTplOpen] = useState(false);
  if (!editor) return null;

  const Btn = ({ active, onClick, title, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200'}`}
    >
      {children}
    </button>
  );

  const insertTpl = (html) => { editor.chain().focus().insertContent(html).run(); setTplOpen(false); };
  const Sep = () => <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />;

  return (
    <div className="border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-0.5 px-2 py-1.5 flex-wrap">
        {/* Text style */}
        <Btn active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="Titulo 1">
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H1</span>
        </Btn>
        <Btn active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="Titulo 2">
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H2</span>
        </Btn>
        <Btn active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="Titulo 3">
          <span className="text-xs font-bold w-5 h-5 flex items-center justify-center">H3</span>
        </Btn>

        <Sep />

        {/* Formatting */}
        <Btn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Negrito (Ctrl+B)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
        </Btn>
        <Btn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italico (Ctrl+I)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>
        </Btn>
        <Btn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Sublinhado (Ctrl+U)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>
        </Btn>
        <Btn active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} title="Riscado">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="12" x2="20" y2="12"/><path d="M17.5 7.5A4.5 4.5 0 008 7.5c0 3 9 3 9 7.5a4.5 4.5 0 01-9 0"/></svg>
        </Btn>
        <Btn active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()} title="Codigo inline">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
        </Btn>
        <Btn active={editor.isActive('link')} onClick={() => {
          if (editor.isActive('link')) { editor.chain().focus().unsetLink().run(); return; }
          const url = window.prompt('URL do link:');
          if (url) editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
        }} title="Link">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
        </Btn>
        <Btn active={editor.isActive('highlight')} onClick={() => editor.chain().focus().toggleHighlight({ color: '#fde047' }).run()} title="Marca-texto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 11l-4 4v3h3l4-4"/><path d="M15 5l4 4-7 7-4-4z"/></svg>
        </Btn>
        <label className="p-1.5 rounded transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200" title="Cor do texto">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M4 20h16"/><path d="M7 16l4-10 4 10"/><path d="M8.5 13h5"/></svg>
          <input type="color" className="sr-only" onChange={(e) => editor.chain().focus().setColor(e.target.value).run()} />
        </label>

        <Sep />

        {/* Lists */}
        <Btn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Lista">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="5" cy="6" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/></svg>
        </Btn>
        <Btn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Lista numerada">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="3" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">1</text><text x="3" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">2</text><text x="3" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="bold">3</text></svg>
        </Btn>
        <Btn active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()} title="Checklist">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="5" width="6" height="6" rx="1"/><path d="M4.5 8l1.5 1.5L8 7"/><line x1="13" y1="8" x2="21" y2="8"/><rect x="3" y="14" width="6" height="6" rx="1"/><line x1="13" y1="17" x2="21" y2="17"/></svg>
        </Btn>

        <Sep />

        {/* Alinhamento */}
        <Btn active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()} title="Alinhar a esquerda">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="18" y2="18"/></svg>
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()} title="Centralizar">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="7" y1="12" x2="17" y2="12"/><line x1="5" y1="18" x2="19" y2="18"/></svg>
        </Btn>
        <Btn active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()} title="Alinhar a direita">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="4" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="6" y1="18" x2="20" y2="18"/></svg>
        </Btn>

        <Sep />

        {/* Block */}
        <Btn active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="Citacao">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C9.591 11.681 11 13.166 11 15a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.917-1.179zM14.583 17.321C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311C19.591 11.681 21 13.166 21 15a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.917-1.179z"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().insertContent(CALLOUT_HTML).run()} title="Callout / aviso">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="8"/><line x1="12" y1="11" x2="12" y2="16"/></svg>
        </Btn>
        <Btn active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} title="Bloco de codigo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="9 8 5 12 9 16"/><polyline points="15 8 19 12 15 16"/></svg>
        </Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Linha divisoria">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/></svg>
        </Btn>
        <Btn active={editor.isActive('details')} onClick={() => editor.chain().focus().setDetails().run()} title="Toggle (secao recolhivel)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
        </Btn>

        <Sep />

        {/* Tabela */}
        {editor.isActive('table') ? (
          <>
            <Btn onClick={() => editor.chain().focus().addColumnAfter().run()} title="Adicionar coluna">
              <span className="text-[11px] font-semibold px-1">+Col</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().addRowAfter().run()} title="Adicionar linha">
              <span className="text-[11px] font-semibold px-1">+Lin</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteColumn().run()} title="Remover coluna">
              <span className="text-[11px] font-semibold px-1">&minus;Col</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteRow().run()} title="Remover linha">
              <span className="text-[11px] font-semibold px-1">&minus;Lin</span>
            </Btn>
            <Btn onClick={() => editor.chain().focus().deleteTable().run()} title="Excluir tabela">
              <span className="text-[11px] font-semibold px-1 text-red-500">&times;</span>
            </Btn>
          </>
        ) : (
          <Btn onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} title="Inserir tabela">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>
          </Btn>
        )}

        {/* Imagem — sobe arquivo (ou cole com Ctrl+V / arraste pra dentro) */}
        <label className="p-1.5 rounded transition-colors cursor-pointer text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200" title="Inserir imagem (ou cole com Ctrl+V)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (!file) return;
              // Mesmo caminho do paste/drop: Storage primeiro, base64 de fallback.
              onPickImage?.(file);
            }}
          />
        </label>
        <Btn onClick={() => {
          const url = window.prompt('URL do video (YouTube):');
          if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
        }} title="Inserir video (YouTube)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="2" y="4" width="20" height="16" rx="3"/><polygon points="10 9 16 12 10 15" fill="currentColor" stroke="none"/></svg>
        </Btn>

        <Sep />

        {/* Botao Template — abre a linha de modelos abaixo */}
        <Btn active={tplOpen} onClick={() => setTplOpen((o) => !o)} title="Modelos de briefing">
          <span className="text-[11px] font-semibold px-1 inline-flex items-center gap-1">
            Template
            <svg className={`w-3 h-3 transition-transform ${tplOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
          </span>
        </Btn>
      </div>

      {/* Painel de modelos (inline, nao flutua sobre o conteudo) */}
      {tplOpen && (
        <div className="px-2.5 py-2 border-t border-slate-100 dark:border-slate-700/60 bg-slate-50/70 dark:bg-slate-800/40 space-y-2">
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Briefings prontos</div>
            <div className="flex flex-wrap gap-1.5">
              {FULL_BRIEFINGS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insertTpl(t.html)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md border border-fyness-primary/30 bg-fyness-primary/10 text-fyness-primary hover:bg-fyness-primary/20 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">Tabelas (inserir)</div>
            <div className="flex flex-wrap gap-1.5">
              {TABLE_SNIPPETS.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  onClick={() => insertTpl(t.html)}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-fyness-primary hover:text-fyness-primary hover:bg-fyness-primary/5 transition-colors"
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== EDITOR ====================

export default function NotionEditor({ content, onChange, placeholder, minHeight = '200px', fill = false }) {
  const editorRef = useRef(null);
  const insertImageFile = (file) => {
    if (!file || !file.type?.startsWith('image/')) return;
    if (file.size > MAX_IMAGE_BYTES) { alert('Imagem muito grande (max 5MB).'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      const ed = editorRef.current;
      if (!ed || ed.isDestroyed || !dataUrl) return;
      // 1) Insere o base64 NA HORA: preview instantaneo, posicao e ordem corretas,
      //    e mata o paste duplicado (a pessoa ve a imagem aparecer no ato).
      ed.chain().focus().setImage({ src: dataUrl }).run();
      // 2) Sobe pro Storage em background e troca o src pela URL (deixa o registro
      //    leve). Se o upload falhar, o base64 permanece como fallback.
      uploadOSImage(file).then((url) => {
        if (url) replaceImageSrc(editorRef.current, dataUrl, url);
      });
    };
    reader.readAsDataURL(file);
  };
  const editor = useEditor({
    extensions: buildExtensions(placeholder),
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `notion-editor-content prose prose-sm dark:prose-invert max-w-none focus:outline-none px-4 py-3`,
        style: fill ? 'min-height: 100%' : `min-height: ${minHeight}`,
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of items) {
          if (item.type?.startsWith('image/')) { insertImageFile(item.getAsFile()); return true; }
        }
        return false;
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files;
        if (files?.length && files[0].type?.startsWith('image/')) { event.preventDefault(); insertImageFile(files[0]); return true; }
        return false;
      },
    },
  });
  editorRef.current = editor;

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content]);

  return (
    <div className={`border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 overflow-hidden ${fill ? 'flex flex-col h-full' : ''}`}>
      <NotionToolbar editor={editor} onPickImage={insertImageFile} />
      <div className={fill ? 'flex-1 min-h-0 overflow-y-auto' : 'max-h-[50vh] overflow-y-auto'}>
        <EditorContent editor={editor} className={fill ? 'h-full' : ''} />
      </div>
    </div>
  );
}
