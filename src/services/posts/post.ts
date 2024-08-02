import { db } from '@/helpers/db';
import type { Post } from '@prisma/client';

interface GetPostByIdData {
  postId: string;
  ignoreDeleted?: boolean;
  authorId?: string;
}

export const getPostById = async (data: GetPostByIdData) => {
  const post = await db.post.findUnique({
    where: {
      id: data.postId,
      deleted: data.ignoreDeleted ? false : undefined,
      authorId: data.authorId
    },
    include: {
      author: true
    }
  });

  return post;
};

type CreatePostData = Pick<Post, 'authorId' | 'content' | 'mediaUrls' | 'replyingToId' | 'repostingPostId' | 'replyPrivacy'>;

export const createPost = async (data: CreatePostData) => {
  const post = await db.post.create({
    data: {
      authorId: data.authorId,
      content: data.content,
      mediaUrls: data.mediaUrls,
      replyingToId: data.replyingToId,
      repostingPostId: data.repostingPostId,
      replyPrivacy: data.replyPrivacy
    }
  });

  return post;
};

export const deletePost = async (data: Pick<Post, 'id' | 'authorId'>) => {
  const post = await getPostById({ postId: data.id });
  if (!post) throw new Error('Unknown post.');

  if (post.repliesCount === 0) {
    await deletePost({ id: post.id, authorId: post.authorId });
  } else {
    await db.$transaction([
      // Soft delete because we still want to keep replies alive
      db.post.update({
        where: {
          id: data.id
        },
        data: {
          content: '',
          mediaUrls: [],
          likesCount: 0,
          repliesCount: 0,
          deleted: true
        }
      }),
      db.postLike.deleteMany({
        where: {
          postId: data.id
        }
      }),
      db.post.deleteMany({
        where: {
          repostingPostId: data.id
        }
      })
    ]);
  }
};
