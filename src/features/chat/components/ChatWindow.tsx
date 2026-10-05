import type { RefObject } from "react";
import type { UseFormRegister } from "react-hook-form";
import type { Chat, Message } from "../../../types/chat";
import { PlusIcon, SendIcon } from "../../../components/Icons";
import type { MessageForm } from "../types";
import {
  formatMessageTime,
  getAvatarLabel,
  getChatTitle,
  getMessageStatusIcon,
} from "../utils/chatUi";

const MESSAGE_MAX_LENGTH = 4000;

interface ChatWindowProps {
  activeChat: Chat | null;
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  characterCount: number;
  isSending: boolean;
  canSend: boolean;
  registerMessage: UseFormRegister<MessageForm>;
  onSubmitMessage: () => void;
  onRetryMessage: (messageId: string, text: string) => void;
  onNewChat: () => void;
}

export function ChatWindow({
  activeChat,
  messages,
  messagesEndRef,
  characterCount,
  isSending,
  canSend,
  registerMessage,
  onSubmitMessage,
  onRetryMessage,
  onNewChat,
}: ChatWindowProps) {
  return (
    <section className="chat-window">
      {activeChat ? (
        <>
          <ChatHeader chat={activeChat} />
          <MessageList
            chat={activeChat}
            messages={messages}
            messagesEndRef={messagesEndRef}
            onRetryMessage={onRetryMessage}
          />
          <MessageComposer
            characterCount={characterCount}
            isSending={isSending}
            canSend={canSend}
            registerMessage={registerMessage}
            onSubmitMessage={onSubmitMessage}
          />
        </>
      ) : (
        <WelcomeState onNewChat={onNewChat} />
      )}
    </section>
  );
}

function ChatHeader({ chat }: { chat: Chat }) {
  return (
    <header className="chat-header">
      <div className="avatar">{getAvatarLabel(chat)}</div>
      <div>
        <strong>{getChatTitle(chat)}</strong>
        <span>MAX chat</span>
      </div>
    </header>
  );
}

function MessageList({
  chat,
  messages,
  messagesEndRef,
  onRetryMessage,
}: {
  chat: Chat;
  messages: Message[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
  onRetryMessage: (messageId: string, text: string) => void;
}) {
  return (
    <div className="messages">
      {messages.length === 0 ? (
        <div className="empty-chat">
          <div className="empty-icon large">👋</div>
          <h2>Start a conversation</h2>
          <p>Send a text message to {chat.phoneNumber}.</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            onRetry={() => onRetryMessage(message.id, message.text)}
          />
        ))
      )}
      <div ref={messagesEndRef} />
    </div>
  );
}

function MessageBubble({
  message,
  onRetry,
}: {
  message: Message;
  onRetry: () => void;
}) {
  const statusIcon = getMessageStatusIcon(message);

  return (
    <div
      className={`message-row ${
        message.direction === "outgoing" ? "outgoing" : "incoming"
      }`}
    >
      <div
        className={`message-bubble ${
          message.status === "failed" ? "failed" : ""
        }`}
      >
        <span>{message.text}</span>
        <small>
          {formatMessageTime(message.timestamp)} {statusIcon}
        </small>
        {message.status === "failed" && (
          <button className="retry" onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

function MessageComposer({
  characterCount,
  isSending,
  canSend,
  registerMessage,
  onSubmitMessage,
}: {
  characterCount: number;
  isSending: boolean;
  canSend: boolean;
  registerMessage: UseFormRegister<MessageForm>;
  onSubmitMessage: () => void;
}) {
  return (
    <form
      className="message-form"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmitMessage();
      }}
    >
      <div className="input-wrap">
        <textarea
          {...registerMessage("text")}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="Write a message..."
          rows={1}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmitMessage();
            }
          }}
        />
        <span>
          {characterCount}/{MESSAGE_MAX_LENGTH}
        </span>
      </div>
      <button
        className="send-button"
        disabled={!canSend || isSending}
        type="submit"
      >
        <SendIcon />
      </button>
    </form>
  );
}

function WelcomeState({ onNewChat }: { onNewChat: () => void }) {
  return (
    <div className="welcome">
      <div className="brand-mark">M</div>
      <h1>Your messages</h1>
      <p>Select a chat or create a new one to start.</p>
      <button className="primary-button compact" onClick={onNewChat}>
        <PlusIcon /> New chat
      </button>
    </div>
  );
}
