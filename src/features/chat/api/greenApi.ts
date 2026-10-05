import type { Credentials } from "../../../types/chat";
import { api, BASE_URL } from "../../../helper/api";

function getUrl(credentials: Credentials, method: string) {
  const base = credentials.apiUrl || BASE_URL;
  return `${base.replace(/\/$/, "")}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}`;
}

export function createGreenApi(credentials: Credentials) {
  return {
    async checkAccount(phoneNumber: string) {
      const response = await api.post<{
        exist: boolean;
        chatId: string;
        fromCache?: boolean;
        username: string;
        phoneNumber: string;
      }>(getUrl(credentials, "checkAccount"), {
        phoneNumber: Number(phoneNumber),
      });
      return response.data;
    },

    async sendMessage(chatId: string, message: string) {
      const response = await api.post<{ idMessage?: string }>(
        getUrl(credentials, "sendMessage"),
        {
          chatId,
          message,
        },
      );
      return response.data;
    },

    async getLastIncomingMessages(signal?: AbortSignal) {
      const response = await api.get<Record<string, unknown>[]>(
        getUrl(credentials, "lastIncomingMessages"),
        { signal },
      );
      return response.data;
    },
  };
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits;
}

export function phoneToChatId(phone: string) {
  return `${normalizePhone(phone)}@c.us`;
}
