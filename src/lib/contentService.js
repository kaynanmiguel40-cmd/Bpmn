import { createCRUDService } from './serviceFactory';
import { contentPostSchema } from './validation';
import {
  publishToInstagram,
  publishImageToInstagram,
  publishCarouselToInstagram,
  getMetaStatus,
  publishTextToFacebook,
  publishImageToFacebook,
  publishVideoToFacebook,
  getFacebookStatus,
} from './metaSocialService';
import {
  publishToTikTok,
  getTikTokStatus,
} from './tiktokService';
import { supabase } from './supabaseClient';

// ==================== TRANSFORMADOR ====================

export function dbToPost(row) {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id || null,
    title: row.title,
    description: row.description || '',
    scheduledDate: row.scheduled_date,
    scheduledTime: row.scheduled_time || '12:00',
    platform: row.platform || 'instagram',
    status: row.status || 'scheduled',
    publishedAt: row.published_at || null,
    assignee: row.assignee || null,
    mediaType: row.media_type || null,
    recurrenceGroupId: row.recurrence_group_id || null,
    mediaUrl: row.media_url || null,
    carouselUrls: row.carousel_urls ? JSON.parse(row.carousel_urls) : null,
    thumbnailUrl: row.thumbnail_url || null,
    externalId: row.external_id || null,
    publishError: row.publish_error || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==================== CRUD (via factory) ====================

const postService = createCRUDService({
  table: 'content_posts',
  localKey: 'content_posts',
  idPrefix: 'post',
  transform: dbToPost,
  schema: contentPostSchema,
  orderBy: 'scheduled_date',
  fieldMap: {
    title: 'title',
    description: 'description',
    scheduledDate: 'scheduled_date',
    scheduledTime: 'scheduled_time',
    platform: 'platform',
    status: 'status',
    publishedAt: 'published_at',
    assignee: 'assignee',
    mediaType: 'media_type',
    recurrenceGroupId: 'recurrence_group_id',
    mediaUrl: 'media_url',
    carouselUrls: 'carousel_urls',
    thumbnailUrl: 'thumbnail_url',
    externalId: 'external_id',
    publishError: 'publish_error',
  },
});

export const getContentPosts = postService.getAll;

/** Cria post incluindo user_id automaticamente */
export async function createContentPost(post) {
  const { data: { user } } = await supabase.auth.getUser();
  const userId = user?.id || null;
  return postService.create(post, { user_id: userId });
}

export const updateContentPost = (id, updates) => postService.update(id, updates);
export const deleteContentPost = (id) => postService.remove(id);

// ==================== PUBLICACAO ====================

/**
 * Publica um post na rede social correspondente
 * @param {Object} post - Post a ser publicado
 * @returns {Object} Resultado da publicacao
 */
export async function publishPost(post) {
  // Carrossel precisa de carouselUrls, outros tipos precisam de mediaUrl
  if (post.mediaType === 'carousel') {
    if (!post.carouselUrls || post.carouselUrls.length < 2) {
      throw new Error('Carrossel precisa de pelo menos 2 itens');
    }
  } else if (!post.mediaUrl) {
    throw new Error('URL da midia e obrigatoria para publicar');
  }

  const platform = post.platform || 'instagram';
  let result;

  try {
    if (platform === 'instagram') {
      const caption = `${post.title}\n\n${post.description || ''}`.trim();

      if (post.mediaType === 'carousel') {
        // Publicar carrossel
        result = await publishCarouselToInstagram({
          mediaUrls: post.carouselUrls,
          caption,
        });
      } else {
        // Verificar se e imagem ou video
        const isImage = post.mediaType === 'image' ||
                       /\.(jpg|jpeg|png|gif|webp)$/i.test(post.mediaUrl);

        if (isImage) {
          // Publicar imagem
          result = await publishImageToInstagram({
            imageUrl: post.mediaUrl,
            caption,
          });
        } else {
          // Publicar video/reel
          const mediaType = post.mediaType === 'reel' ? 'REELS' :
                           post.mediaType === 'story' ? 'STORIES' : 'REELS';

          result = await publishToInstagram({
            videoUrl: post.mediaUrl,
            caption,
            mediaType,
            coverUrl: post.thumbnailUrl,
          });
        }
      }
    } else if (platform === 'facebook') {
      const message = `${post.title}\n\n${post.description || ''}`.trim();

      // Verificar tipo de midia
      if (post.mediaUrl) {
        const isImage = post.mediaType === 'image' ||
                       /\.(jpg|jpeg|png|gif|webp)$/i.test(post.mediaUrl);
        const isVideo = post.mediaType === 'video' || post.mediaType === 'reel' ||
                       /\.(mp4|mov|avi|webm)$/i.test(post.mediaUrl);

        if (isImage) {
          result = await publishImageToFacebook({
            imageUrl: post.mediaUrl,
            caption: message,
          });
        } else if (isVideo) {
          result = await publishVideoToFacebook({
            videoUrl: post.mediaUrl,
            title: post.title,
            description: post.description || '',
          });
        } else {
          // Tipo desconhecido, tentar como imagem
          result = await publishImageToFacebook({
            imageUrl: post.mediaUrl,
            caption: message,
          });
        }
      } else {
        // Post apenas de texto
        result = await publishTextToFacebook({ message });
      }
    } else if (platform === 'tiktok') {
      // TikTok só aceita vídeo
      const isVideo = post.mediaType === 'video' || post.mediaType === 'reel' ||
                     /\.(mp4|mov|avi|webm)$/i.test(post.mediaUrl);

      if (!isVideo) {
        throw new Error('TikTok só aceita vídeos. Imagens e carrosséis não são suportados.');
      }

      const title = `${post.title}\n\n${post.description || ''}`.trim();

      result = await publishToTikTok({
        videoUrl: post.mediaUrl,
        title,
        privacyLevel: 'private', // SELF_ONLY - funciona em sandbox mode
      });
    } else {
      throw new Error(`Plataforma ${platform} não suportada.`);
    }

    // Atualizar post com resultado
    await updateContentPost(post.id, {
      status: 'published',
      publishedAt: new Date().toISOString(),
      externalId: result.id,
      publishError: null,
    });

    return { success: true, ...result };
  } catch (err) {
    // Salvar erro no post
    await updateContentPost(post.id, {
      publishError: err.message,
    });

    throw err;
  }
}

/**
 * Verifica se a publicacao esta disponivel para uma plataforma
 */
export async function canPublish(platform = 'instagram') {
  if (platform === 'facebook') {
    const status = await getFacebookStatus();
    return status?.connected || false;
  }
  if (platform === 'tiktok') {
    const status = await getTikTokStatus();
    return status?.connected || false;
  }
  const status = await getMetaStatus();
  return status?.connected || false;
}

/**
 * Verifica status de todas as plataformas
 */
export async function getAllPlatformStatus() {
  const [instagram, facebook, tiktok] = await Promise.all([
    getMetaStatus(),
    getFacebookStatus(),
    getTikTokStatus(),
  ]);

  return {
    instagram,
    facebook,
    tiktok,
  };
}
