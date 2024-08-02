import { db } from '@/helpers/db';
import { notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getPostById } from '@/services/posts/post';
import { getUserById, isFollowingUser } from '@/services/user';
import { filterFields } from '@/utils/filter-fields';
import type { User } from '@prisma/client';
import { object, string } from 'zod';
import { allowedPostFields } from './create-post';

export const allowedPostAuthorFields: [string, keyof User][] = [
  ['id', 'id'],
  ['handle', 'handle'],
  ['full_name', 'fullName'],
  ['avatar_url', 'avatarUrl'],
  ['banner_url', 'bannerUrl'],
  ['bio', 'bio'],
  ['post_count', 'postCount'],
  ['privacy', 'privacy'],
  ['verification_state', 'verificationState'],
  ['following_count', 'followingCount'],
  ['followers_count', 'followersCount'],
  ['created_at', 'createdAt'],
  ['updated_at', 'updatedAt']
];

export async function getPost(app: AppInstance) {
  app.get(
    '/:postId',
    {
      schema: {
        params: object({
          postId: string()
        })
      },
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const post = await getPostById({ postId: request.params.postId, ignoreDeleted: true });
      if (!post) return notFound(reply, 'unknown_post', 'Unknown post');

      if (post.author.privacy === 'PRIVATE') {
        if (!request.authorization.authorized) return notFound(reply, 'unknown_post', 'Unknown post');

        const following = await isFollowingUser(request.authorization.user.id, post.authorId);
        if (!following) return notFound(reply, 'unknown_post', 'Unknown post');
      }

      let additionalFields: Record<string, unknown> = {};

      if (request.authorization.authorized) {
        const [isPostLiked, repostedByUser] = await db.$transaction([
          db.postLike.findUnique({
            where: {
              postId_userId: {
                postId: post.id,
                userId: request.authorization.user.id
              }
            }
          }),
          db.post.findUnique({
            where: {
              authorId_repostingPostId: {
                authorId: request.authorization.user.id,
                repostingPostId: post.id
              }
            },
            include: {
              repostingPost: true
            }
          })
        ]);

        const isFollowingPostOwner = await isFollowingUser(request.authorization.user.id, post.authorId);

        additionalFields = {
          has_liked: !!isPostLiked,
          has_reposted: !!repostedByUser,
          is_following_post_owner: !!isFollowingPostOwner,
          can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && !!isFollowingPostOwner)
        };

        if (repostedByUser) {
          const originalAuthor = await getUserById(repostedByUser.authorId);
          additionalFields.author = filterFields(allowedPostAuthorFields, originalAuthor);
          additionalFields.reposted_by = filterFields(allowedPostAuthorFields, post.author);

          // if (post.author.privacy === 'PRIVATE') return forbidden(reply, 'repost_not_available', 'The original post author has a private account, so the repost is unavaiable.');
          if (post.author.privacy === 'PRIVATE') return notFound(reply, 'unknown_post', 'Unknown post.');
        }
      }

      ok(reply, {
        ...filterFields(allowedPostFields, post),
        author: filterFields(allowedPostAuthorFields, post.author),
        // spread this later because if the post is reposted, the author field will be overwritten
        ...additionalFields
      });
    }
  );
}
