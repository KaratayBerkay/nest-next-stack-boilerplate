import { Query, Resolver } from '@nestjs/graphql';
import { Book } from './models/book.gqlmodel';

@Resolver(() => Book)
export class BooksResolver {
  // The Book model carries NO @Field decorators — the @nestjs/graphql CLI plugin adds them at
  // compile time from the TS types (and descriptions from the JSDoc comments).
  @Query(() => Book, { name: 'book' })
  book(): Book {
    return {
      id: 1,
      title: 'Nest in Action',
      subtitle: 'GraphQL edition',
      inPrint: true,
    };
  }
}
