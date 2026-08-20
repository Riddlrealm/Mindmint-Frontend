import { describe, expect, it } from 'vitest';
import { setSession } from './setSession';
import { STORAGE_KEYS } from './storageKeys';
import type { AuthUser } from '../services/AuthService';

const user: AuthUser = {
  id: 'user-1',
  email: 'jane@example.com',
  name: 'Jane Doe',
  picture: 'https://example.com/jane.png',
};

describe('setSession', () => {
  it('persists the token and the serialized user to localStorage', () => {
    setSession({ token: 'token-123', user });

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('token-123');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) ?? '{}')).toEqual(user);
    expect(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)).toBeNull();
  });

  it('persists the expiry when one is provided', () => {
    setSession({ token: 'token-123', user, expiresAt: 1234567890000 });

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN_EXPIRES_AT)).toBe('1234567890000');
  });

  it('overwrites a previously stored session', () => {
    setSession({ token: 'first-token', user });
    setSession({
      token: 'second-token',
      user: { id: 'user-2', email: 'john@example.com' },
    });

    expect(localStorage.getItem(STORAGE_KEYS.TOKEN)).toBe('second-token');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) ?? '{}')).toEqual({
      id: 'user-2',
      email: 'john@example.com',
    });
  });
});
