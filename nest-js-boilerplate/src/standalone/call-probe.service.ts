import { Injectable } from '@nestjs/common';

/**
 * Standalone applications (#86) — a shared sink the proof test inspects to see which code paths
 * actually ran. A standalone context has no HTTP request pipeline, so a globally-registered
 * interceptor never wraps a controller method pulled out with `app.get()`: `interceptorCalls`
 * stays at 0 while `controllerCalls` proves the method body itself *did* execute.
 */
@Injectable()
export class CallProbe {
  interceptorCalls = 0;
  controllerCalls = 0;
}
