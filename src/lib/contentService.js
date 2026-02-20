import { createCRUDService } from './serviceFactory';
import { contentPostSchema } from './validation';

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
  },
});

export const getContentPosts = postService.getAll;
export const createContentPost = (post) => postService.create(post);
export const updateContentPost = (id, updates) => postService.update(id, updates);
export const deleteContentPost = (id) => postService.remove(id);
