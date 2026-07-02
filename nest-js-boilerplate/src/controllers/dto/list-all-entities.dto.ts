// Query DTO. Without a transforming ValidationPipe, query values arrive as strings (the docs
// note this), so `limit` is typed as string and coerced by the handler.
export class ListAllEntities {
  limit?: string;
}
