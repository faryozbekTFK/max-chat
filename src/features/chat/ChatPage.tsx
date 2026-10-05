import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { useChatStore } from "../../store/chat.store";
import { createGreenApi } from "./api/greenApi";
import { ChatWindow } from "./components/ChatWindow";
import { NewChatModal } from "./components/NewChatModal";
import { Sidebar } from "./components/Sidebar";
import { useReceiveMessages } from "./hooks/useReceiveMessages";
import type { MessageForm, NewChatForm } from "./types";

const NOTICE_TIMEOUT_MS = 3000;

export function ChatPage() {
  const credentials = useAuthStore((state) => state.credentials)!;
  const logout = useAuthStore((state) => state.logout);
  const chats = useChatStore((state) => state.chats);
  const messages = useChatStore((state) => state.messages);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const addChat = useChatStore((state) => state.addChat);
  const setActiveChat = useChatStore((state) => state.setActiveChat);
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore(
    (state) => state.updateMessageStatus,
  );

  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [notice, setNotice] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const noticeTimeoutRef = useRef<number | null>(null);

  useReceiveMessages();

  const {
    register: registerChat,
    handleSubmit: submitChat,
    reset: resetChat,
    formState: { errors: chatErrors },
  } = useForm<NewChatForm>();
  const {
    register: registerMessage,
    handleSubmit: submitMessage,
    reset: resetMessage,
    watch,
  } = useForm<MessageForm>();

  const api = useMemo(() => createGreenApi(credentials), [credentials]);
  const messageText = watch("text") ?? "";
  const characterCount = messageText.length;
  const canSendMessage = Boolean(messageText.trim() && activeChatId);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return chats;

    return chats.filter((chat) => {
      const phone = chat.phoneNumber?.toString() ?? "";
      const username = chat.username?.toLowerCase() ?? "";
      return phone.includes(query) || username.includes(query);
    });
  }, [chats, search]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.chatId === activeChatId) ?? null,
    [activeChatId, chats],
  );
  const activeMessages = activeChatId ? (messages[activeChatId] ?? []) : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChatId, activeMessages.length]);

  useEffect(() => {
    return () => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }
    };
  }, []);

  const showNotice = useCallback(
    (message: string, timeout = NOTICE_TIMEOUT_MS) => {
      if (noticeTimeoutRef.current) {
        window.clearTimeout(noticeTimeoutRef.current);
      }

      setNotice(message);
      noticeTimeoutRef.current = window.setTimeout(() => {
        setNotice("");
        noticeTimeoutRef.current = null;
      }, timeout);
    },
    [],
  );

  const sendMutation = useMutation({
    mutationFn: async ({ chatId, text }: { chatId: string; text: string }) =>
      api.sendMessage(chatId, text),
  });

  const openNewChat = useCallback(() => setShowNewChat(true), []);
  const closeNewChat = useCallback(() => setShowNewChat(false), []);

  const createChat = useCallback(
    async ({ phone }: NewChatForm) => {
      const cleanPhone = phone.replace(/\D/g, "");
      if (cleanPhone.length < 8) return;

      try {
        const result = await api.checkAccount(cleanPhone);

        if (!result.exist || !result.chatId) {
          showNotice("MAX account was not found for this number");
          return;
        }

        addChat({
          chatId: result.chatId,
          username: result.username,
          phoneNumber: cleanPhone,
        });
        setActiveChat(result.chatId);
        resetChat();
        closeNewChat();
        showNotice("Chat created", 2000);
      } catch (error) {
        console.error(error);
        showNotice("Could not check this phone number");
      }
    },
    [addChat, api, closeNewChat, resetChat, setActiveChat, showNotice],
  );

  const markMessageAsSent = useCallback(
    (messageId: string) => updateMessageStatus(messageId, "sent"),
    [updateMessageStatus],
  );

  const markMessageAsFailed = useCallback(
    (messageId: string) => updateMessageStatus(messageId, "failed"),
    [updateMessageStatus],
  );

  const sendMessage = useCallback(
    ({ text }: MessageForm) => {
      const value = text.trim();
      if (!value || !activeChatId) return;

      const localId = crypto.randomUUID();
      addMessage({
        id: localId,
        chatId: activeChatId,
        text: value,
        direction: "outgoing",
        status: "sending",
        timestamp: Date.now(),
      });
      resetMessage();

      sendMutation.mutate(
        { chatId: activeChatId, text: value },
        {
          onSuccess: () => markMessageAsSent(localId),
          onError: () => markMessageAsFailed(localId),
        },
      );
    },
    [
      activeChatId,
      addMessage,
      markMessageAsFailed,
      markMessageAsSent,
      resetMessage,
      sendMutation,
    ],
  );

  const retryMessage = useCallback(
    (messageId: string, text: string) => {
      if (!activeChatId) return;

      updateMessageStatus(messageId, "sending");
      sendMutation.mutate(
        { chatId: activeChatId, text },
        {
          onSuccess: () => markMessageAsSent(messageId),
          onError: () => markMessageAsFailed(messageId),
        },
      );
    },
    [
      activeChatId,
      markMessageAsFailed,
      markMessageAsSent,
      sendMutation,
      updateMessageStatus,
    ],
  );

  const submitCurrentMessage = useCallback(() => {
    void submitMessage(sendMessage)();
  }, [sendMessage, submitMessage]);

  return (
    <main className="chat-page">
      <Sidebar
        chats={filteredChats}
        activeChatId={activeChatId}
        search={search}
        onSearchChange={setSearch}
        onSelectChat={setActiveChat}
        onNewChat={openNewChat}
        onLogout={logout}
      />

      <ChatWindow
        activeChat={activeChat}
        messages={activeMessages}
        messagesEndRef={messagesEndRef}
        characterCount={characterCount}
        isSending={sendMutation.isPending}
        canSend={canSendMessage}
        registerMessage={registerMessage}
        onSubmitMessage={submitCurrentMessage}
        onRetryMessage={retryMessage}
        onNewChat={openNewChat}
      />

      {showNewChat && (
        <NewChatModal
          registerChat={registerChat}
          submitChat={submitChat}
          errors={chatErrors}
          onCreateChat={createChat}
          onClose={closeNewChat}
        />
      )}

      {notice && <div className="toast">{notice}</div>}
    </main>
  );
}
