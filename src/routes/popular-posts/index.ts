import * as PopularPostsController from '@/controllers/popular-posts';
import type { AppInstance } from '@/index';

export async function popularPostsRouter(app: AppInstance) {
  app.register(PopularPostsController.getPopularPosts);
}
