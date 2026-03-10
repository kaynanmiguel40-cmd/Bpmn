import { createCRUDService } from './serviceFactory';
import { contentPostSchema } from './validation';
import { publishToInstagram, publishImageToInstagram, publishToFacebook, getMetaStatus } from './metaSocialService';

// ==================== TRANSFORMADOR ====================

export function dbToPost(row) {
  if (!row) return null;
  return {
    id: row.id,
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
    thumbnailUrl: 'thumbnail_url',
    externalId: 'external_id',
    publishError: 'publish_error',
  },
});

export const getContentPosts = postService.getAll;
export const createContentPost = (post) => postService.create(post);
export const updateContentPost = (id, updates) => postService.update(id, updates);
export const deleteContentPost = (id) => postService.remove(id);

// ==================== PUBLICACAO ====================

/**
 * Publica um post na rede social correspondente
 * @param {Object} post - Post a ser publicado
 * @returns {Object} Resultado da publicacao
 */
export async function publishPost(post) {
  if (!post.mediaUrl) {
    throw new Error('URL da midia e obrigatoria para publicar');
  }

  const platform = post.platform || 'instagram';
  let result;

  try {
    if (platform === 'instagram') {
      const caption = `${post.title}\n\n${post.description || ''}`.trim();

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
    } else if (platform === 'facebook') {
      result = await publishToFacebook({
        videoUrl: post.mediaUrl,
        title: post.title,
        description: post.description,
      });
    } else {
      throw new Error(`Plataforma ${platform} nao suportada ainda`);
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
 * Verifica se a publicacao esta disponivel
 */
export async function canPublish() {
  const status = await getMetaStatus();
  return status?.connected || false;
}
