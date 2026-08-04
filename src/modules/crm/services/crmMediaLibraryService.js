/**
 * crmMediaLibraryService — biblioteca de mídias pré-prontas do Inbox.
 *
 * Admin sobe vídeos/imagens com título + categoria; o vendedor filtra e escolhe
 * pra mandar na conversa. O arquivo vai pro bucket crm-whatsapp-media (prefixo
 * 'library/') e a URL pública é enviada direto pelo evolution-send (sem reupload
 * a cada envio).
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { uploadCrmMedia } from '../lib/uploadCrmMedia';

function dbToMediaItem(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    mediaType: row.media_type,        // 'image' | 'video'
    mediaUrl: row.media_url,
    mediaMime: row.media_mime || null,
    category: row.category || '',
    createdAt: row.created_at,
  };
}

/** Todos os itens ativos (o modal filtra por categoria/tipo/busca no cliente). */
export async function getMediaLibrary() {
  const { data, error } = await supabase
    .from('crm_media_library')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });
  if (error) {
    toast(`Erro ao carregar a biblioteca: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToMediaItem);
}

/**
 * Adiciona um item: sobe o arquivo e grava a linha. Só imagem/vídeo.
 * @returns {Promise<object|null>} o item criado, ou null se falhar.
 */
export async function addMediaLibraryItem({ file, title, category = '', description = '' }) {
  if (!file) { toast('Escolha um arquivo.', 'error'); return null; }
  if (!title?.trim()) { toast('Dê um título ao item.', 'error'); return null; }

  // Rejeita não-mídia ANTES de subir — senão o arquivo vai pro storage e só depois
  // é recusado, virando órfão. (O tipo definitivo ainda é confirmado no up.)
  const mime = file.type || '';
  if (mime && !mime.startsWith('image/') && !mime.startsWith('video/')) {
    toast('A biblioteca aceita só imagem ou vídeo.', 'error');
    return null;
  }

  const up = await uploadCrmMedia(file, { prefix: 'library' });
  if (!up.ok) { toast(`Falha no upload: ${up.error}`, 'error'); return null; }
  if (up.mediaType !== 'image' && up.mediaType !== 'video') {
    toast('A biblioteca aceita só imagem ou vídeo.', 'error');
    return null;
  }

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id || null;

  const { data, error } = await supabase
    .from('crm_media_library')
    .insert({
      title: title.trim(),
      description: description?.trim() || null,
      media_type: up.mediaType,
      media_url: up.url,
      media_mime: up.mime || null,
      category: category?.trim() || null,
      created_by: userId,
    })
    .select('*')
    .single();

  if (error) { toast(`Erro ao salvar na biblioteca: ${error.message}`, 'error'); return null; }
  return dbToMediaItem(data);
}

/** Remove um item (soft-delete — o arquivo no storage fica, mas some da lista). */
export async function deleteMediaLibraryItem(id) {
  if (!id) return false;
  const { error } = await supabase
    .from('crm_media_library')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null);
  if (error) { toast(`Erro ao remover: ${error.message}`, 'error'); return false; }
  return true;
}
