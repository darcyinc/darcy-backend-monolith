import * as PostsController from '@/controllers/posts';
import * as PostRepostsController from '@/controllers/posts/reposts';
import * as PostLikeController from '@/controllers/posts/like';
import type { AppInstance } from '@/index';

export async function postsRouter(app: AppInstance) {
  app.register(PostsController.createPost);

  // Reposts
  app.register(PostRepostsController.deleteRepost);
  app.register(PostRepostsController.repostPost);

  // Likes
  app.register(PostLikeController.addPostLike);
  app.register(PostLikeController.removePostLike);
}
