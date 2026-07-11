import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

@Injectable()
export class ElasticsearchService {
  private readonly logger = new Logger(ElasticsearchService.name);
  private readonly client: Client;

  constructor(config: ConfigService) {
    const node = config.get<string>(
      'ELASTICSEARCH_URL',
      'http://localhost:9200',
    );
    this.client = new Client({
      node,
      headers: {
        accept: 'application/vnd.elasticsearch+json; compatible-with=8',
        'content-type': 'application/vnd.elasticsearch+json; compatible-with=8',
      },
    });
  }

  async index(
    index: string,
    id: string,
    document: Record<string, unknown>,
  ): Promise<void> {
    try {
      await this.client.index({ index, id, document });
    } catch (error: unknown) {
      this.logger.error(
        { index, id, error: String(error) },
        'Failed to index document in Elasticsearch',
      );
    }
  }

  async bulk(
    index: string,
    documents: Array<{ id: string; document: Record<string, unknown> }>,
  ): Promise<void> {
    if (documents.length === 0) return;
    try {
      const operations = documents.flatMap(({ id, document }) => [
        { index: { _index: index, _id: id } },
        document,
      ]);
      await this.client.bulk({ operations });
    } catch (error: unknown) {
      this.logger.error(
        { index, count: documents.length, error: String(error) },
        'Failed to bulk-index documents in Elasticsearch',
      );
    }
  }
}
