import { Injectable } from '@nestjs/common';

export interface TraceEntry {
  parentType: string;
  field: string;
  atFieldLevel: boolean;
}

// Plain DI service the interceptor writes to and resolvers read back from — the same side-channel
// pattern as the GraphQL plugin metrics service. Keeps the interceptor a thin adapter.
@Injectable()
export class TraceService {
  private readonly _entries: TraceEntry[] = [];
  private _selection: string[] = [];

  record(entry: TraceEntry): void {
    this._entries.push(entry);
  }

  setSelection(fields: string[]): void {
    this._selection = fields;
  }

  get entries(): TraceEntry[] {
    return this._entries;
  }

  get selection(): string[] {
    return this._selection;
  }
}
