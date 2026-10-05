import { create } from "zustand";
import type { Chat, Message, MessageStatus } from "../types/chat";

interface ChatState {
  chats: Chat[];
  messages: Record<string, Message[]>;
  activeChatId: string | null;
  setChats: (chat: Chat[]) => void;
  addChat: (chat: Chat) => void;
  setActiveChat: (chatId: string | null) => void;
  addMessage: (message: Message) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  chats: [],
  messages: {},
  activeChatId: null,
  setChats: (chats: Chat[]) => set({ chats }),
  addChat: (chat) =>
    set((state) => {
      const freshChat = {
        ...chat,
        createdAt: Date.now(),
        lastMessage: undefined,
        updatedAt: undefined,
        unreadCount: 0,
      };
      const messages = { ...state.messages };
      delete messages[chat.chatId];

      return {
        chats: [
          freshChat,
          ...state.chats.filter((item) => item.chatId !== chat.chatId),
        ],
        messages,
      };
    }),
  setActiveChat: (chatId) =>
    set((state) => ({
      activeChatId: chatId,
      chats: state.chats.map((chat) =>
        chat.chatId === chatId ? { ...chat, unreadCount: 0 } : chat,
      ),
    })),
  addMessage: (message) =>
    set((state) => {
      const current = state.messages[message.chatId] ?? [];
      if (current.some((item) => item.id === message.id)) return state;

      const existingChat = state.chats.find(
        (chat) => chat.chatId === message.chatId,
      );
      if (!existingChat) return state;

      const unreadCount =
        message.direction === "incoming" && state.activeChatId !== message.chatId
          ? (existingChat?.unreadCount ?? 0) + 1
          : 0;
      const updatedChat = {
        ...existingChat,
        lastMessage: message.text,
        updatedAt: message.timestamp,
        unreadCount,
      };
      const otherChats = state.chats.filter(
        (chat) => chat.chatId !== message.chatId,
      );

      return {
        messages: {
          ...state.messages,
          [message.chatId]: [...current, message],
        },
        chats: [updatedChat, ...otherChats],
      };
    }),
  updateMessageStatus: (messageId, status) =>
    set((state) => ({
      messages: Object.fromEntries(
        Object.entries(state.messages).map(([chatId, messages]) => [
          chatId,
          messages.map((message) =>
            message.id === messageId ? { ...message, status } : message,
          ),
        ]),
      ),
    })),
}));
