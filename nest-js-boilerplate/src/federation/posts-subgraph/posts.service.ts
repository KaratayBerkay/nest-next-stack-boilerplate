import { Injectable } from '@nestjs/common';
import { Post } from './post.entity';

@Injectable()
export class PostsService {
  private readonly posts: Post[] = [
    { id: 101, title: 'Notes on the Analytical Engine', authorId: 1 },
    { id: 102, title: 'On Computable Numbers', authorId: 2 },
    { id: 103, title: 'Intelligent Machinery', authorId: 2 },
  ];

  all(): Post[] {
    return this.posts;
  }

  forAuthor(authorId: number | string): Post[] {
    return this.posts.filter((p) => p.authorId === Number(authorId));
  }
}
