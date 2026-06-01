import type { AuthUser } from '../services/AuthService';

export interface SessionPayload {
  token: string;
  user: AuthUser;
}

export function setSession({ token, user }: SessionPayload): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('quest_token', token);
  localStorage.setItem('quest_user', JSON.stringify(user));
}