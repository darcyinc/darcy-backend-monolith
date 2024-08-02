import { db } from '@/helpers/db';
import type { Post, PostLike, UserFollow } from '@prisma/client';
import { isFollowingUser } from '../user';
import { getPostById } from './post';
import { filterFields } from '@/utils/filter-fields';
import { allowedPostAuthorFields, allowedPostFields } from '@/controllers/posts';

interface GetPostCommentsData {
  postId: string;
  requestedByUserId?: string;
  afterId?: string;
  limit: number;
  page: number;
}

export const getPostComments = async (data: GetPostCommentsData) => {
  const post = await getPostById({ postId: data.postId });

  if (!post) throw new Error('Unknown post.');

  if (post.author.privacy === 'PRIVATE') {
    if (!data.requestedByUserId) throw new Error('Unknown post.');

    const following = await isFollowingUser(data.requestedByUserId, post.authorId);
    if (!following) throw new Error('Unknown post.');
  }

  const rawComments = await db.post.findMany({
    where: {
      replyingToId: post.id
    },
    include: {
      author: true
    },
    cursor: data.afterId ? { id: data.afterId } : undefined,
    take: data.limit,
    skip: (data.page - 1) * data.limit + (data.afterId ? 1 : 0),
    orderBy: {
      createdAt: 'desc'
    }
  });

  let likedComments = [] as PostLike[];
  let repostedComments = [] as Post[];
  let followingCommentAuthors = [] as UserFollow[];

  if (data.requestedByUserId) {
    [likedComments, repostedComments, followingCommentAuthors] = await db.$transaction([
      db.postLike.findMany({
        where: {
          userId: data.requestedByUserId,
          postId: {
            in: rawComments.map((comment) => comment.id)
          }
        }
      }),
      db.post.findMany({
        where: {
          authorId: data.requestedByUserId,
          repostingPostId: {
            in: rawComments.map((comment) => comment.id)
          }
        }
      }),
      db.userFollow.findMany({
        where: {
          followerId: data.requestedByUserId,
          targetId: {
            in: rawComments.map((comment) => comment.authorId)
          }
        }
      })
    ]);
  }

  const comments = rawComments.map((comment) => {
    const has_liked = !!likedComments.find((likedComment) => likedComment.postId === comment.id);
    const has_reposted = !!repostedComments.find((repostedComment) => repostedComment.repostingPostId === comment.id);
    const is_following_comment_author = !!followingCommentAuthors.find((reply) => reply.targetId === comment.authorId);

    if (comment.author.privacy === 'PRIVATE' && !is_following_comment_author) {
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
      is_following_comment_author,
      can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && is_following_comment_author),
      comment_visible_to_user: true
    };
  });

  return comments;
};
