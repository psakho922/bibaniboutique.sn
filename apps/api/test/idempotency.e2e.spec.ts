/**
 * Test pédagogique — IdempotencyInterceptor
 * - Simule un contexte HTTP minimal et vérifie l'anti-rejeu sans framework.
 */
import { IdempotencyInterceptor } from '../src/idempotency/idempotency.interceptor';
import { InMemoryIdempotencyStore } from '../src/idempotency/inmemory-idempotency.store';
import { of } from 'rxjs';

function makeCtx(method: string, url: string, headers: Record<string, string>, body: any) {
  const res: any = { statusCode: 200, status: (c: number) => (res.statusCode = c) };
  const req: any = { method, url, headers, body };
  return {
    switchToHttp: () => ({ getRequest: () => req, getResponse: () => res }),
  } as any;
}

describe('IdempotencyInterceptor', () => {
  it('returns same response for same key without re-executing handler', async () => {
    const store = new InMemoryIdempotencyStore();
    const interceptor = new IdempotencyInterceptor(store as any);
    let counter = 0;
    const handler = { handle: () => of({ counter: ++counter }) } as any;
    const ctx = makeCtx('POST', '/idemp/test', { 'idempotency-key': 'abc' }, { foo: 1 });
    const ctx2 = makeCtx('POST', '/idemp/test', { 'idempotency-key': 'abc' }, { foo: 1 });

    const res1 = await interceptor.intercept(ctx, handler).toPromise();
    const res2 = await interceptor.intercept(ctx2, handler).toPromise();

    expect(res1).toEqual({ counter: 1 });
    expect(res2).toEqual({ counter: 1 });
  });
});
