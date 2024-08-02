import { db } from '@/helpers/db';
import type { Post, PostLike, User, UserFollow } from '@prisma/client';
import { getPostById } from './post';
import { filterFields } from '@/utils/filter-fields';
import { allowedPostAuthorFields, allowedPostFields } from '@/controllers/posts';

interface GetAllRecentPostsData {
  userId?: string;
  afterId?: string;
  limit: number;
  page: number;
}

export const getAllRecentPosts = async (data: GetAllRecentPostsData) => {
  const rawPosts = await db.post.findMany({
    include: {
      author: true
    },
    cursor: data.afterId ? { id: data.afterId } : undefined,
    skip: (data.page - 1) * data.limit + (data.afterId ? 1 : 0),
    take: data.limit,
    orderBy: {
      createdAt: 'desc'
    }
  });

  let likedPosts = [] as PostLike[];
  let repostedPosts = [] as Post[];
  let followingPostAuthors = [] as UserFollow[];

  if (data.userId) {
    [likedPosts, repostedPosts, followingPostAuthors] = await db.$transaction([
      db.postLike.findMany({
        where: {
          userId: data.userId,
          postId: {
            in: rawPosts.map((post) => post.id)
          }
        }
      }),
      db.post.findMany({
        where: {
          authorId: data.userId,
          repostingPostId: {
            in: rawPosts.map((post) => post.id)
          }
        }
      }),
      db.userFollow.findMany({
        where: {
          followerId: data.userId,
          targetId: {
            in: rawPosts.map((post) => post.authorId)
          }
        }
      })
    ]);
  }

  const posts = await Promise.all(
    rawPosts.map(async (post) => {
      let originalPost: (Post & { author: User }) | null = null;

      if (post.repostingPostId) {
        originalPost = await getPostById({ postId: post.repostingPostId });
        if (originalPost?.author.privacy === 'PRIVATE' || originalPost?.deleted)
          return {
            id: post.id,
            post_visible_to_user: false
          };
      }

      const has_liked = !!likedPosts.find((likedPost) => likedPost.postId === (originalPost ?? post).id);
      const has_reposted = !!repostedPosts.find((repostedPost) => repostedPost.repostingPostId === (originalPost ?? post).id);
      const is_following_post_owner = !!followingPostAuthors.find((follow) => follow.targetId === (originalPost ?? post).authorId);

      // Check if reposted post author (not the original) has a private account, if it has, check if current user is following
      if (post.author.privacy === 'PRIVATE' && !is_following_post_owner) {
        return {
          id: post.id,
          post_visible_to_user: false
        };
      }

      return {
        ...filterFields(allowedPostFields, originalPost ?? post),
        author: filterFields(allowedPostAuthorFields, (originalPost ?? post).author),
        reposted_by: originalPost ? filterFields(allowedPostAuthorFields, post.author) : null,
        has_liked,
        has_reposted,
        is_following_post_owner,
        post_visible_to_user: true,
        can_reply: post.replyPrivacy === 'PUBLIC' || (post.replyPrivacy === 'ONLY_FOLLOWERS' && is_following_post_owner)
      };
    })
  );

  return posts.filter((post) => post !== undefined);
};
