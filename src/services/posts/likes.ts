import { db } from '@/helpers/db';

interface LikePostData {
  postId: string;
  userId: string;
}

export const likePost = async (data: LikePostData) => {
  const post = await db.postLike.findUnique({
    where: {
      postId_userId: {
        postId: data.postId,
        userId: data.userId
      }
    }
  });

  if (post) throw new Error('Post already liked by user.');

  await db.postLike.create({
    data: {
      postId: data.postId,
      userId: data.userId
    }
  });
};

export const unlikePost = async (data: LikePostData) => {
  const post = await db.postLike.findUnique({
    where: {
      postId_userId: {
        postId: data.postId,
        userId: data.userId
      }
    }
  });

  if (!post) throw new Error('Post not liked by user.');

  await db.postLike.delete({
    where: {
      postId_userId: {
        postId: data.postId,
        userId: data.userId
      }
    }
  });
};
