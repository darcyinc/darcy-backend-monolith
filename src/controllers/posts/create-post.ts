import { CreatePostDto } from '@/dtos/posts/create-post';
import { db } from '@/helpers/db';
import { badRequest, ok, unauthorized } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import type { Post } from '@prisma/client';

export const allowedPostFields: [string, keyof Post][] = [
  ['id', 'id'],
  ['content', 'content'],
  ['media_urls', 'mediaUrls'],
  ['likes_count', 'likesCount'],
  ['replies_count', 'repliesCount'],
  ['reposts_count', 'repostsCount'],
  ['reposting_post_id', 'repostingPostId'],
  ['reply_privacy', 'replyPrivacy'],
  ['replying_to_id', 'replyingToId'],
  ['created_at', 'createdAt'],
  ['updated_at', 'updatedAt']
];

export const getAllowedPostFields = (post: Post) => {
  const data = {} as Record<string, unknown>;

  for (const [key, value] of allowedPostFields) {
    data[key] = post[value];
  }

  return data;
};

export async function createPost(app: AppInstance) {
  app.post(
    '/',
    {
      schema: {
        body: CreatePostDto
      },
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      if (!request.authorization.authorized) return unauthorized(reply);

      const data = request.body;

      if (!data.content && data.mediaUrls.length === 0)
        return badRequest(reply, 'provide_content_or_media', 'Missing content or media URLs. Please, provide content or media URLs.');

      const newPost = await db.post.create({
        data: {
          authorId: request.authorization.user.id,
          content: data.content ?? '',
          mediaUrls: data.mediaUrls,
          replyingToId: data.replyingTo,
          replyPrivacy: data.replyPrivacy
        }
      });

      ok(reply, getAllowedPostFields(newPost));
    }
  );
}
