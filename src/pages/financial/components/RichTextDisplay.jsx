import { sanitizeRichText } from '../../../lib/validation';

/** Renderiza conteudo rich text (HTML do TipTap) ou texto puro (backward compatible). */
export default function RichTextDisplay({ content, className = '' }) {
  if (!content) return null;
  if (/<[a-z][\s\S]*>/i.test(content)) {
    return (
      <div
        className={`notion-editor-content ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
      />
    );
  }
  return <p className={`whitespace-pre-wrap ${className}`}>{content}</p>;
}
