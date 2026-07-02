import { ObjectType } from '@nestjs/graphql';

/** A book in the catalog. */
@ObjectType()
export class Book {
  /** Unique identifier. */
  id: number;

  /** The book's title. */
  title: string;

  /** Optional subtitle. */
  subtitle?: string;

  /** Whether the book is currently in print. */
  inPrint: boolean;
}
