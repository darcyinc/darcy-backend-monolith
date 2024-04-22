import { PatchUserDto } from '@/dtos/users';
import { db } from '@/helpers/db';
import type { AppInstance } from '@/index';
import { enforceAuthorization } from '@/middlewares/enforce-authorization';
import { optionalAuthorization } from '@/middlewares/optional-authorization';
import { getUserByEmail, getUserByHandle } from '@/services/users';
import { z } from 'zod';

export * from './follow';
export * from './followers';
export * from './following';
export * from './posts';

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
      const { authorized, email } = request.authorization;

      if (request.params.handle === '@me') {
        if (!authorized)
          return reply.status(401).send({
            error: 'Unauthorized'
          });

        const user = await getUserByEmail(email);
        if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

        const followersCount = await db.user.count({
          where: {
            followingIds: {
              has: user.id
            }
          }
        });

        return reply.send({
          ...user,
          followersCount,
          followingCount: user.followingIds.length,
          followingIds: undefined,
          id: undefined
        });
      }

      const user = await getUserByHandle(request.params.handle);
      if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

      // get follower count and check if current user follows target user
      const [currentUser, followersCount] = await Promise.all([
        authorized
          ? db.user.findFirst({
              where: { auth: { email: email } }
            })
          : null,
        db.user.count({
          where: {
            followingIds: {
              has: user.id
            }
          }
        })
      ]);

      return reply.send({
        ...user,
        followersCount,
        followingCount: user.followingIds.length,
        isFollowing: currentUser?.followingIds.includes(user.id) ?? false,
        onboardingComplete: undefined,
        followingIds: undefined,
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
      if (!request.authorization.authorized) {
        return reply.status(401).send({
          error: 'Unauthorized'
        });
      }

      // Only allow updating the @me user
      if (request.params.handle !== '@me') {
        return reply.status(401).send({
          error: 'update_user_with_at_handle',
          message: 'To update a user, you must use the @me handle'
        });
      }

      const data = request.body;

      const user = await getUserByEmail(request.authorization.email);
      if (!user) return reply.status(404).send({ error: 'user_not_found', message: 'User not found.' });

      if (data.completedOnboarding === false) {
        if (user.completedOnboarding) {
          return reply.status(409).send({ error: 'onboarding_already_completed', message: 'User has already completed onboarding.' });
        }
      }

      if (data.handle) {
        const handleExists = await getUserByHandle(data.handle);
        if (handleExists && handleExists.id !== user.id) {
          return reply.status(409).send({ error: 'handle_already_user', message: 'Handle is being used by another user.' });
        }
      }

      const [newUser, followersCount] = await Promise.all([
        db.user.update({
          where: { id: user.id },
          data: {
            displayName: data.displayName || user.displayName,
            handle: data.handle || user.handle,
            bio: data.bio || user.bio,
            completedOnboarding: data.completedOnboarding || user.completedOnboarding
          }
        }),
        db.user.count({
          where: {
            followingIds: {
              has: user.id
            }
          }
        })
      ]);

      return reply.send({ ...newUser, followersCount, followingCount: user.followingIds.length, followingIds: undefined, id: undefined });
    }
  );
}
