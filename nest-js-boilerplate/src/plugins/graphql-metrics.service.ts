import { Injectable } from '@nestjs/common';

// Plain DI provider the Apollo plugin writes to and a resolver reads from. Holding the
// state here (rather than on the plugin) keeps the plugin a thin lifecycle adapter and
// makes the observed metrics trivially queryable.
@Injectable()
export class GraphQLMetrics {
  private _started = 0;
  private _completed = 0;
  private _lastOperationName: string | null = null;

  // Called from the plugin's requestDidStart hook.
  started(): void {
    this._started += 1;
  }

  // Called from the plugin's willSendResponse hook.
  completed(operationName: string | null): void {
    this._completed += 1;
    this._lastOperationName = operationName;
  }

  get requestCount(): number {
    return this._started;
  }

  get completedCount(): number {
    return this._completed;
  }

  get lastOperationName(): string | null {
    return this._lastOperationName;
  }
}
