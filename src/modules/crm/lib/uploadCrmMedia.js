/**
 * Upload de midia (imagem, documento, audio) pro bucket Storage
 * 'crm-whatsapp-media'. Retorna URL publica.
 *
 * O path eh randomico (UUID) pra evitar collision e tornar URL nao-enumeravel.
 */

import { supabase } from '../../../lib/supabase';

const BUCKET = 'crm-whatsapp-media';

/**
 * Detecta o mediaType a partir do MIME do arquivo.
 */
export function detectMediaType(mime) {
  if (!mime) return 'document';
  if (mime.startsWith('image/'))  return 'image';
  if (mime.startsWith('video/'))  return 'video';
  if (mime.startsWith('audio/'))  return 'audio';
  return 'document';
}

/**
 * Faz upload de um File/Blob e retorna `{ ok, url, path, mediaType, error }`.
 *
 * @param {File|Blob} file
 * @param {object}    opts
 * @param {string}    opts.prefix - prefixo do path (ex: 'contact-123' ou 'general')
 */
export async function uploadCrmMedia(file, opts = {}) {
  if (!file) return { ok: false, error: 'Arquivo vazio' };

  const prefix = (opts.prefix || 'general').replace(/[^a-zA-Z0-9-_]/g, '_');
  const ext = (file.name?.split('.').pop() || 'bin').toLowerCase().slice(0, 8);
  const uuid = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const path = `${prefix}/${uuid}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) {
    return { ok: false, error: error.message };
  }

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return {
    ok: true,
    url: pub.publicUrl,
    path,
    mediaType: detectMediaType(file.type),
    mime: file.type,
    filename: file.name,
  };
}
