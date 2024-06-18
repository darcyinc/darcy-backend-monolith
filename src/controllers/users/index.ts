import { PatchUserDto } from '@/dtos/users';
import { db } from '@/helpers/db';
import { badRequest, notFound, ok } from '@/helpers/response';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import type { UserFollow } from '@prisma/client';
import { z } from 'zod';

export * from './follow';
export * from './followers';
export * from './following';
export * from './posts';

export async function getSelfUser(app: AppInstance) {
  app.get(
    '/@me',
    {
      onRequest: [enforceAuthorization] as never
    },
    async (request, reply) => {
      const { authorized, email } = request.authorization;
      if (!authorized) return;

      const user = await getUserByEmail(email);
      if (!user) return notFound(reply);

      return ok(reply, {
        ...user,
        id: undefined
      });
    }
  );
}

export async function getUser(app: AppInstance) {
  app.get(
    '/:handle',
    {
      onRequest: [optionalAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        })
      }
    },
    async (request, reply) => {
      const { email } = request.authorization;

      const user = await getUserByHandle(request.params.handle);
      if (!user) return notFound(reply);

      // get follower count and check if current user follows target user
      const currentUser = await db.user.findFirst({
        where: { auth: { email: email } }
      });

      let isFollowing: UserFollow | null = null;

      if (currentUser) {
        isFollowing = await db.userFollow.findFirst({
          where: {
            followerId: user.id,
            followingId: currentUser.id
          }
        });
      }

      return ok(reply, {
        ...user,
        isFollowing: Boolean(isFollowing),
        onboardingComplete: undefined,
        id: undefined
      });
    }
  );
}

export async function editUser(app: AppInstance) {
  app.patch(
    '/:handle',
    {
      onRequest: [enforceAuthorization] as never,
      schema: {
        params: z.object({
          handle: z.string()
        }),
        body: PatchUserDto
      }
    },
    async (request, reply) => {
      // for typings
      if (!request.authorization.authorized) return;

      const data = request.body;
      const user = await getUserByEmail(request.authorization.email);
      if (!user) return notFound(reply);

      if (data.completedOnboarding === false) {
        if (user.completedOnboarding) {
          return badRequest(reply, 'onboarding_already_completed', 'User has already completed onboarding.');
        }
      }

      if (data.handle) {
        const handleExists = await getUserByHandle(data.handle);
        if (handleExists && handleExists.id !== user.id) {
          return badRequest(reply, 'handle_already_user', 'Handle is being used by another user.');
        }
      }

      const newUser = await db.user.update({
        where: { id: user.id },
        data: {
          displayName: data.displayName || user.displayName,
          handle: data.handle || user.handle,
          bio: data.bio || user.bio,
          completedOnboarding: data.completedOnboarding || user.completedOnboarding
        }
      });

      return ok(reply, { ...newUser, id: undefined });
    }
  );
}
