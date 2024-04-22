import * as PostController from '@/controllers/post';
import type { AppInstance } from '@/index';

export async function postsRouter(app: AppInstance) {
  app.register(PostController.createPost);
  app.register(PostController.getPost);
  app.register(PostController.getPostComments);
  app.register(PostController.likePost);
  app.register(PostController.unlikePost);
}
