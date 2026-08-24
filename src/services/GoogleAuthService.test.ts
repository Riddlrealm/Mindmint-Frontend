import { afterEach, describe, expect, it, vi } from 'vitest';
import { GoogleAuthService } from './GoogleAuthService';

function jsonResponse(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

describe('GoogleAuthService.handleSignIn', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fails without a network call when the credential is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const result = await GoogleAuthService.handleSignIn('');

    expect(result).toEqual({ success: false, error: 'No ID token received from Google.' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('surfaces the backend error for an expired or invalid token', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Google token expired' })),
    );

    const result = await GoogleAuthService.handleSignIn('expired-credential');

    expect(result).toEqual({ success: false, error: 'Google token expired' });
  });
});
