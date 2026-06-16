/**
 * Slash command ("/") para o NotionEditor.
 * Digite "/" e escolha um bloco (titulo, lista, tabela, etc.).
 *
 * O popup e renderizado no <body> (position: fixed) — assim escapa do
 * overflow-hidden do container do editor.
 */
import { Extension } from '@tiptap/core';
import Suggestion from '@tiptap/suggestion';
import { ReactRenderer } from '@tiptap/react';
import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

// ---- Lista de comandos ----
function buildItems(query) {
  const items = [
    { title: 'Titulo 1', hint: 'Secao grande', kw: 'h1 titulo heading', run: (e, r) => e.chain().focus().deleteRange(r).toggleHeading({ level: 1 }).run() },
    { title: 'Titulo 2', hint: 'Subsecao', kw: 'h2 titulo heading', run: (e, r) => e.chain().focus().deleteRange(r).toggleHeading({ level: 2 }).run() },
    { title: 'Titulo 3', hint: 'Subsecao menor', kw: 'h3 titulo heading', run: (e, r) => e.chain().focus().deleteRange(r).toggleHeading({ level: 3 }).run() },
    { title: 'Lista', hint: 'Com marcadores', kw: 'bullet lista', run: (e, r) => e.chain().focus().deleteRange(r).toggleBulletList().run() },
    { title: 'Lista numerada', hint: '1. 2. 3.', kw: 'numerada ordered ordenada', run: (e, r) => e.chain().focus().deleteRange(r).toggleOrderedList().run() },
    { title: 'Checklist', hint: 'Caixas de selecao', kw: 'task checklist tarefa caixa', run: (e, r) => e.chain().focus().deleteRange(r).toggleTaskList().run() },
    { title: 'Tabela', hint: '3 x 3', kw: 'table tabela', run: (e, r) => e.chain().focus().deleteRange(r).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { title: 'Citacao', hint: 'Bloco destacado', kw: 'quote citacao blockquote', run: (e, r) => e.chain().focus().deleteRange(r).toggleBlockquote().run() },
    { title: 'Callout', hint: 'Caixa de aviso', kw: 'callout aviso dica', run: (e, r) => e.chain().focus().deleteRange(r).insertContent('<blockquote><p>&#128161; <strong>Dica:</strong> </p></blockquote>').run() },
    { title: 'Bloco de codigo', hint: 'Trecho de codigo', kw: 'code codigo bloco', run: (e, r) => e.chain().focus().deleteRange(r).toggleCodeBlock().run() },
    { title: 'Divisoria', hint: 'Linha horizontal', kw: 'hr divisoria linha separador', run: (e, r) => e.chain().focus().deleteRange(r).setHorizontalRule().run() },
    { title: 'Toggle', hint: 'Secao recolhivel', kw: 'toggle details recolhivel acordeao', run: (e, r) => e.chain().focus().deleteRange(r).setDetails().run() },
  ];
  const q = (query || '').toLowerCase().trim();
  if (!q) return items;
  return items.filter((i) => (`${i.title} ${i.kw}`).toLowerCase().includes(q));
}

// ---- Popup (lista) ----
const SlashList = forwardRef(function SlashList(props, ref) {
  const [selected, setSelected] = useState(0);
  useEffect(() => setSelected(0), [props.items]);

  const pick = (index) => {
    const item = props.items[index];
    if (item) props.command(item);
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (!props.items.length) return false;
      if (event.key === 'ArrowDown') { setSelected((s) => (s + 1) % props.items.length); return true; }
      if (event.key === 'ArrowUp') { setSelected((s) => (s - 1 + props.items.length) % props.items.length); return true; }
      if (event.key === 'Enter') { pick(selected); return true; }
      return false;
    },
  }));

  if (!props.items.length) {
    return (
      <div className="w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg px-3 py-2 text-sm text-slate-400">
        Nenhum bloco
      </div>
    );
  }

  return (
    <div className="w-60 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg py-1">
      {props.items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          onMouseEnter={() => setSelected(i)}
          onClick={() => pick(i)}
          className={`w-full text-left px-3 py-1.5 transition-colors ${i === selected ? 'bg-fyness-primary/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
        >
          <div className={`text-sm font-medium ${i === selected ? 'text-fyness-primary' : 'text-slate-700 dark:text-slate-200'}`}>{item.title}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">{item.hint}</div>
        </button>
      ))}
    </div>
  );
});

// ---- Extensao ----
export const SlashCommand = Extension.create({
  name: 'slashCommand',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        startOfLine: false,
        command: ({ editor, range, props }) => { props.run(editor, range); },
        items: ({ query }) => buildItems(query),
        render: () => {
          let renderer;
          let popup;
          const place = (rect) => {
            if (!popup || !rect) return;
            const top = rect.bottom + 6;
            popup.style.left = `${Math.round(rect.left)}px`;
            // se nao couber pra baixo, abre pra cima
            popup.style.top = top + 300 > window.innerHeight ? `${Math.round(rect.top - 306)}px` : `${Math.round(top)}px`;
          };
          return {
            onStart: (props) => {
              renderer = new ReactRenderer(SlashList, { props, editor: props.editor });
              popup = document.createElement('div');
              popup.style.position = 'fixed';
              popup.style.zIndex = '9999';
              popup.appendChild(renderer.element);
              document.body.appendChild(popup);
              place(props.clientRect && props.clientRect());
            },
            onUpdate: (props) => {
              renderer && renderer.updateProps(props);
              place(props.clientRect && props.clientRect());
            },
            onKeyDown: (props) => {
              if (props.event.key === 'Escape') { popup && (popup.style.display = 'none'); return true; }
              return (renderer && renderer.ref && renderer.ref.onKeyDown(props)) || false;
            },
            onExit: () => {
              if (popup) popup.remove();
              if (renderer) renderer.destroy();
            },
          };
        },
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export default SlashCommand;
