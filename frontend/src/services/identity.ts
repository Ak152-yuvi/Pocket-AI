import {
  AuthError,
  MissingIdentityError,
  getUser,
  handleAuthCallback,
} from '@netlify/identity';
import type { User as IdentityUser } from '@netlify/identity';
import type { User } from '../types';

let callbackPromise: ReturnType<typeof handleAuthCallback> | undefined;

export function toAppUser(user: IdentityUser): User {
  return {
    id: user.id,
    name: user.name || user.email || 'Member',
    email: user.email || '',
    created_at: user.createdAt || '',
  };
}

export async function restoreIdentityUser(): Promise<User | null> {
  callbackPromise ??= handleAuthCallback();
  await callbackPromise;
  const user = await getUser();
  return user ? toAppUser(user) : null;
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof MissingIdentityError) {
    return 'Sign-in is unavailable. Netlify Identity must be enabled for this site.';
  }
  if (error instanceof AuthError && error.status === 401) {
    return 'Invalid email or password. If you just registered, confirm your email first.';
  }
  return error instanceof Error ? error.message : 'Unable to sign in. Please try again.';
}
