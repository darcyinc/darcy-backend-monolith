import { z } from 'zod';

export const FollowingPageDto = z.number().min(1).optional().default(1);
export const FollowingLimitDto = z.number().min(1).max(50).optional().default(50);
