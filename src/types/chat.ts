export type MessageDirection = "incoming" | "outgoing";
export type MessageStatus = "sending" | "sent" | "failed";

export interface Credentials {
  apiUrl: string;
  idInstance: string;
  apiTokenInstance: string;
}

export interface Chat {
  chatId: string;
  phoneNumber: string;
  username: string;
  createdAt?: number;
  lastMessage?: string;
  updatedAt?: number;
  unreadCount?: number;
}

export interface Message {
  id: string;
  chatId: string;
  text: string;
  direction: MessageDirection;
  status: MessageStatus;
  timestamp: number;
}

export interface Notification {
  receiptId: number;
  body: Record<string, unknown>;
}
