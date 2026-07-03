import type { AuthUser } from '../services/AuthService';
import { STORAGE_KEYS } from './storageKeys';

export interface SessionPayload {
  token: string;
  user: AuthUser;
}

export function setSession({ token, user }: SessionPayload): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  window.localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}
