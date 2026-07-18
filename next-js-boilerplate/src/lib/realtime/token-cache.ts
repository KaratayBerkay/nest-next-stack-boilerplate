import { refreshTokenServer } from "@/api/server/auth/refresh-token";

let _tokKey = "";
let _tokData: Record<string, string> | null = null;
let _tokExp = 0;
let _tokPromise: Promise<Record<string, string> | null> | null = null;

export function cachedFetchTokens(
  token: string,
): Promise<Record<string, string> | null> {
  const key = `t:${token}`;
  if (_tokKey === key && Date.now() < _tokExp && _tokData) {
    return Promise.resolve(_tokData);
  }
  if (_tokKey === key && _tokPromise) return _tokPromise;
  _tokKey = key;
  _tokPromise = refreshTokenServer(token);
  return _tokPromise.then((d) => {
    _tokPromise = null;
    if (d) {
      _tokData = d;
      _tokExp = Date.now() + 30_000;
    }
    return d;
  });
}

export function bustTokenCache(): void {
  _tokKey = "";
  _tokData = null;
  _tokExp = 0;
  _tokPromise = null;
}
