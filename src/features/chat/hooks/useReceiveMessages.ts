import { useEffect } from "react";
import { createGreenApi } from "../api/greenApi";
import { useAuthStore } from "../../../store/auth.store";
import { useChatStore } from "../../../store/chat.store";
import type { Message } from "../../../types/chat";

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function parseIncomingMessage(rawMessage: Record<string, unknown>): Message | null {
  const body = readRecord(rawMessage.body) ?? rawMessage;
  const messageData = readRecord(body.messageData);
  const typeMessage =
    readString(body.typeMessage) || readString(messageData?.typeMessage);
  const chatId =
    readString(body.chatId) ||
    readString(readRecord(body.senderData)?.chatId) ||
    readString(readRecord(body.chatData)?.chatId);

  const text =
    readString(body.textMessage) ||
    readString(body.text) ||
    readString(readRecord(messageData?.textMessageData)?.textMessage) ||
    readString(readRecord(messageData?.extendedTextMessageData)?.text) ||
    readString(readRecord(messageData?.textMessageData)?.text);

  if (
    !chatId ||
    !text ||
    (typeMessage && !["textMessage", "extendedTextMessage"].includes(typeMessage))
  ) {
    return null;
  }

  const timestamp = Number(body.timestamp ?? Date.now());
  const id = readString(body.idMessage) || `${chatId}-${timestamp}-${text}`;

  return {
    id,
    chatId,
    text,
    direction: "incoming",
    status: "sent",
    timestamp: timestamp < 1e12 ? timestamp * 1000 : timestamp,
  };
}

export function useReceiveMessages() {
  const credentials = useAuthStore((state) => state.credentials);
  const activeChatId = useChatStore((state) => state.activeChatId);

  useEffect(() => {
    if (!credentials || !activeChatId) return;

    const controller = new AbortController();
    const api = createGreenApi(credentials);
    const activeChat = useChatStore
      .getState()
      .chats.find((chat) => chat.chatId === activeChatId);
    let stopped = false;

    const loop = async () => {
      while (!stopped) {
        try {
          const incomingMessages = await api.getLastIncomingMessages(
            controller.signal,
          );
          const { addMessage } = useChatStore.getState();

          incomingMessages
            .map(parseIncomingMessage)
            .filter((message): message is Message => {
              if (!message) return false;
              if (message.chatId !== activeChatId) return false;

              return (
                !activeChat?.createdAt ||
                message.timestamp >= activeChat.createdAt
              );
            })
            .forEach(addMessage);

          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (error) {
          if (controller.signal.aborted) return;
          console.error("LastIncomingMessages error:", error);
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }
      }
    };

    void loop();

    return () => {
      stopped = true;
      controller.abort();
    };
  }, [credentials, activeChatId]);
}
