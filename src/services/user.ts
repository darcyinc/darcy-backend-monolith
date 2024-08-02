import { db } from '@/helpers/db';

export const getUserById = async (userId: string) => {
  const user = await db.user.findUnique({
    where: {
      id: userId
    }
  });

  return user;
};

export const getUserByHandle = async (handle: string) => {
  const user = await db.user.findUnique({
    where: {
      handle
    }
  });

  return user;
};

export const getUserByEmail = async (email: string) => {
  const user = await db.user.findFirst({
    where: {
      auth: {
        email
      }
    }
  });

  return user;
};

export const isFollowingUser = async (followerId: string, targetId: string) => {
  const isFollowing = await db.userFollow.findUnique({
    where: {
      followerId_targetId: {
        followerId,
        targetId
      }
    }
  });

  return isFollowing;
};

interface GetUserLikesData {
  userId: string;
  requestedByUserId?: string;
  afterId?: string;
  limit: number;
  page: number;
}

export const getUserLikes = async (data: GetUserLikesData) => {
  const likes = await db.postLike.findMany({
    where: {
      userId: data.userId
    },
    cursor: data.afterId ? { id: data.afterId } : undefined,
    take: data.limit,
    skip: (data.page - 1) * data.limit + (data.afterId ? 1 : 0),
    orderBy: {
      createdAt: 'desc'
    }
  });

  // TODO: handle privacy

  return likes;
};
