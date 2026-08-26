import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './AuthService';
import type { AuthUser } from './AuthService';
import { STORAGE_KEYS } from '../session/storageKeys';

const user: AuthUser = { id: 'user-1', email: 'jane@example.com' };

/**
 * Minimal stand-in for the `fetch` Response shape the auth code relies on:
 * `ok`, `status`, `headers.get("content-type")`, and `json()`.
 */
function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name: string) =>
        name.toLowerCase() === 'content-type' ? 'application/json' : null,
    },
    json: async () => body,
  };
}

describe('AuthService.signIn', () => {
  beforeEach(() => {
    // Tests in this file write real session entries (token/user/expiry);
    // clear them so cases stay order-independent.
    localStorage.clear();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the session and persists it on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(200, { token: 'token-123', user })),
    );

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'secret' });

    expect(result).toEqual({ success: true, user, token: 'token-123' });
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('token-123');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) ?? '{}')).toEqual(user);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)).not.toBeNull();
  });

  it('records the backend-provided expiry (epoch seconds) on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(200, { token: 'token-123', user, expiresAt: 1234567890 }),
      ),
    );

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'secret' });

    expect(result.success).toBe(true);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)).toBe(String(1234567890 * 1000));
  });

  it('fails closed when the response is missing token/user', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse(200, {})));

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'secret' });

    expect(result).toEqual({
      success: false,
      error: 'Sign-in succeeded but no session was returned.',
    });
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBeNull();
  });

  it('returns the backend error message for a rejected request', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Invalid email or password' })),
    );

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'wrong' });

    expect(result).toEqual({ success: false, error: 'Invalid email or password' });
  });

  it('fails closed when a successful response is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        headers: { get: () => 'text/html' },
        json: async () => {
          throw new Error('not json');
        },
      }),
    );

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'secret' });

    expect(result).toEqual({
      success: false,
      error: 'Unexpected response from the server. Please try again.',
    });
  });

  it('returns a transport error when the network request rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));

    const result = await AuthService.signIn({ email: 'jane@example.com', password: 'secret' });

    expect(result).toEqual({
      success: false,
      error: 'Unable to reach the server. Please try again in a moment.',
    });
  });
});
