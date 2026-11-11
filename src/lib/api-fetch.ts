// authedFetch: same-origin /api fetch with the embed Bearer header attached; any 401 fires the
// che:unauthorized event so the shell banner appears instead of silent degradation.
import { getToken, onUnauthorized } from './embed-token-store';
import { getClientId } from './client-id';

export async function authedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(init.headers);
  if (token && url.startsWith('/api')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (url.startsWith('/api')) {
    try {
      headers.set('X-Client-Id', getClientId());
    } catch {
      /* no crypto available — server treats as legacy bucket */
    }
  }
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401) {
    let code = 'unauthorized';
    try {
      code = ((await res.clone().json()) as { code?: string }).code ?? code;
    } catch {
      /* non-JSON 401 body → generic code */
    }
    onUnauthorized(code);
  }
  return res;
}
