import type { Chat, Message } from "../../../types/chat";

export function getChatTitle(chat: Chat) {
  return chat.phoneNumber || chat.chatId;
}

export function getAvatarLabel(chat: Chat) {
  return getChatTitle(chat).toString().slice(-2);
}

export function formatMessageTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getMessageStatusIcon(message: Message) {
  if (message.direction !== "outgoing") return null;
  if (message.status === "sending") return "◷";
  if (message.status === "failed") return "!";
  return "✓";
}
