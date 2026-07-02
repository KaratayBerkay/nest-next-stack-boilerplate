import { EntityManager, EntityRepository } from '@mikro-orm/better-sqlite';
import { InjectRepository } from '@mikro-orm/nestjs';
import { Injectable } from '@nestjs/common';
import { Book } from './book.entity';
import { CreateBookDto } from './dto/create-book.dto';

/**
 * Repository pattern over MikroORM's Unit of Work: the `Book` repository is
 * injected via `@InjectRepository(Book)` (typed `EntityRepository<Book>`), and
 * the request-scoped `EntityManager` (forked per HTTP request by the
 * `@mikro-orm/nestjs` RequestContext middleware) flushes changes. `EntityManager`
 * + `EntityRepository` are imported from the driver package, per the docs.
 */
@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: EntityRepository<Book>,
    private readonly em: EntityManager,
  ) {}

  async create(dto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create({
      title: dto.title,
      author: dto.author,
    });
    await this.em.persistAndFlush(book);
    return book;
  }

  findAll(): Promise<Book[]> {
    return this.bookRepository.findAll();
  }

  findOne(id: number): Promise<Book | null> {
    return this.bookRepository.findOne({ id });
  }

  async remove(id: number): Promise<void> {
    const book = await this.bookRepository.findOne({ id });
    if (book) {
      await this.em.removeAndFlush(book);
    }
  }
}
