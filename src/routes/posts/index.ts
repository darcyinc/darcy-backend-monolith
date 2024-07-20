import * as PostsController from '@/controllers/posts';
import * as RepostsController from '@/controllers/posts/reposts';
import type { AppInstance } from '@/index';

export async function postsRouter(app: AppInstance) {
  app.register(PostsController.createPost);

  // Reposts
  app.register(RepostsController.deleteRepost);
  app.register(RepostsController.repostPost);
}
