import { create } from 'zustand';
import type { Credentials } from '../types/chat';
import { clearCredentials, loadCredentials, saveCredentials } from '../lib/storage';

interface AuthState {
  credentials: Credentials | null;
  setCredentials: (credentials: Credentials) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  credentials: loadCredentials(),
  setCredentials: (credentials) => {
    saveCredentials(credentials);
    set({ credentials });
  },
  logout: () => {
    clearCredentials();
    set({ credentials: null });
  },
}));
