import * as PostsController from '@/controllers/posts';
import type { AppInstance } from '@/index';

export async function postsRouter(app: AppInstance) {
  app.register(PostsController.createPost);
}
