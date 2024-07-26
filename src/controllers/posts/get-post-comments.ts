import { GetPostCommentsDto } from '@/dtos/posts/get-post-comments';
import { db } from '@/helpers/db';
import { notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { filterFields } from '@/utils/filter-fields';
import type { Post, PostLike, UserFollow } from '@prisma/client';
import { object, string } from 'zod';
import { allowedPostFields } from './create-post';
import { allowedPostAuthorFields } from './get-post';

export async function getPostComments(app: AppInstance) {
  app.get(
    '/:postId/comments',
    {
      schema: {
        params: object({
          postId: string()
        }),
        querystring: GetPostCommentsDto
      },
      onRequest: [optionalAuthorization] as never
    },
    async (request, reply) => {
      const post = await db.post.findUnique({
        where: {
          id: request.params.postId
        },
        include: {
          author: true
        }
      });

      if (!post) return notFound(reply, 'unknown_post', 'Unknown post.');

      if (post.author.privacy === 'PRIVATE') {
        if (!request.authorization.authorized) return notFound(reply, 'unknown_post', 'Unknown post.');

        const following = await db.userFollow.findUnique({
          where: {
            followerId_targetId: {
              followerId: request.authorization.user.id,
              targetId: post.authorId
            }
          }
        });

        if (!following) return notFound(reply, 'unknown_post', 'Unknown post.');
      }

      const rawComments = await db.post.findMany({
        where: {
          replyingToId: post.id
        },
        include: {
          author: true
        },
        take: request.query.limit,
        skip: (request.query.page - 1) * request.query.limit,
        orderBy: {
          createdAt: 'desc'
        }
      });

      let likedComments = [] as PostLike[];
      let repostedComments = [] as Post[];
      let followingCommentAuthors = [] as UserFollow[];

      if (request.authorization.authorized) {
        [likedComments, repostedComments, followingCommentAuthors] = await db.$transaction([
          db.postLike.findMany({
            where: {
              userId: request.authorization.user.id,
              postId: {
                in: rawComments.map((comment) => comment.id)
              }
            }
          }),
          db.post.findMany({
            where: {
              authorId: request.authorization.user.id,
              repostingPostId: {
                in: rawComments.map((comment) => comment.id)
              }
            }
          }),
          db.userFollow.findMany({
            where: {
              followerId: request.authorization.user.id,
              targetId: {
                in: rawComments.map((comment) => comment.authorId)
              }
            }
          })
        ]);
      }

      const comments = rawComments.map((comment) => {
        const has_liked = !!likedComments.find((likedComment) => likedComment.postId === comment.id);
        const has_reposted = !!repostedComments.find((repostedComment) => repostedComment.id === comment.id);
        const is_following_post_owner = !!followingCommentAuthors.find((reply) => reply.targetId === comment.authorId);

        if (comment.author.privacy === 'PRIVATE' && !is_following_post_owner) {
          return {
            id: comment.id,
            comment_visible_to_user: false
          };
        }

        return {
          ...filterFields(allowedPostFields, comment),
          author: filterFields(allowedPostAuthorFields, comment.author),
          has_liked,
          has_reposted,
          is_following_comment_author: is_following_post_owner,
          can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && is_following_post_owner),
          comment_visible_to_user: true
        };
      });

      ok(reply, comments);
    }
  );
}
