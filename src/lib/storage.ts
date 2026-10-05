import type { Credentials } from '../types/chat';

const CREDENTIALS_KEY = 'max-chat:credentials';

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    return raw ? (JSON.parse(raw) as Credentials) : null;
  } catch {
    return null;
  }
}

export function saveCredentials(credentials: Credentials) {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
}

export function clearCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}
