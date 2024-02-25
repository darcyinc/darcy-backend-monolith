import { db } from '@/helpers/db';

export const getUserByEmail = async (email: string) => {
  return db.user.findFirst({
    where: {
      auth: {
        email
      }
    }
  });
};

export const getUserByHandle = async (handle: string) => {
  return db.user.findFirst({
    where: {
      handle: {
        mode: 'insensitive',
        equals: handle
      }
    }
  });
};
