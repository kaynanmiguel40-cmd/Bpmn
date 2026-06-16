/**
 * Upload de imagem (print/foto) dos briefings/entregas de O.S. pro bucket
 * Storage 'os-uploads'. Retorna a URL publica (string) ou null se falhar.
 *
 * Por que existe: antes os prints viravam base64 dentro de os_orders.checklist
 * (JSONB), inchando o registro — payload pesado a cada save, refetch lento e
 * realtime descartado por exceder o teto de payload. Guardar so a URL deixa o
 * checklist leve.
 *
 * O path eh randomico (UUID) pra nao ser enumeravel — mesmo padrao do CRM.
 * Em QUALQUER falha retorna null; o chamador cai num fallback base64 pra nunca
 * perder a imagem que a pessoa colou.
 */

import { supabase } from './supabase';

const BUCKET = 'os-uploads';

export async function uploadOSImage(file, opts = {}) {
  if (!file) return null;
  try {
    const prefix = (opts.prefix || 'briefing').replace(/[^a-zA-Z0-9-_]/g, '_');
    const ext = (file.type?.split('/')?.[1] || file.name?.split('.').pop() || 'png')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .slice(0, 8) || 'png';
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
      console.warn('[uploadOSImage] upload falhou, usando fallback base64:', error.message);
      return null;
    }

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data?.publicUrl || null;
  } catch (e) {
    console.warn('[uploadOSImage] excecao, usando fallback base64:', e?.message || e);
    return null;
  }
}
