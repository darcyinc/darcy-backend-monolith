import { db } from '@/helpers/db';
import type { Post } from '@prisma/client';
import { deletePost } from './post';

interface RepostPostData {
  postId: string;
  authorId: string;
  content?: string;
  mediaUrls?: string[];
}

export const repostPost = async (data: RepostPostData) => {
  const post = await db.post.create({
    data: {
      authorId: data.authorId,
      content: data.content ?? '',
      mediaUrls: data.mediaUrls,
      repostingPostId: data.postId
    }
  });

  return post;
};

export const deleteRepost = async (data: Pick<Post, 'id' | 'authorId'>) => {
  const post = await db.post.findUnique({
    where: {
      id: data.id,
      authorId: data.authorId
    }
  });

  if (!post || post.deleted) throw new Error('Unknown post.');

  await deletePost({ authorId: data.authorId, id: data.id });
};
