import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom, map } from 'rxjs';
import type { AxiosError } from 'axios';

/**
 * Wraps `HttpService` (axios) the documented ways: every method returns an
 * `Observable<AxiosResponse>`, converted to a Promise with `firstValueFrom`,
 * plus a `catchError` mapping and the raw `axiosRef` escape hatch.
 */
@Injectable()
export class RemoteApiService {
  constructor(private readonly httpService: HttpService) {}

  // Observable<AxiosResponse<T>> -> Promise<T> via firstValueFrom + destructure.
  async fetchJson<T>(url: string): Promise<T> {
    const { data } = await firstValueFrom(this.httpService.get<T>(url));
    return data;
  }

  // map(res => res.data) + catchError translating an upstream failure to a domain error.
  fetchOrFail<T>(url: string): Promise<T> {
    return firstValueFrom(
      this.httpService.get<T>(url).pipe(
        map((res) => res.data),
        catchError((error: AxiosError) => {
          throw new ServiceUnavailableException(
            `upstream failed: ${error.message}`,
          );
        }),
      ),
    );
  }

  // Direct access to the underlying axios instance via axiosRef (no Observable).
  async fetchViaAxiosRef<T>(url: string): Promise<{ status: number; data: T }> {
    const res = await this.httpService.axiosRef.get<T>(url);
    return { status: res.status, data: res.data };
  }

  async postJson<T>(url: string, body: unknown): Promise<T> {
    const { data } = await firstValueFrom(this.httpService.post<T>(url, body));
    return data;
  }

  // Proves register/registerAsync options reach the axios instance.
  config(): { timeout?: number; maxRedirects?: number } {
    const { timeout, maxRedirects } = this.httpService.axiosRef.defaults;
    return { timeout, maxRedirects };
  }
}
