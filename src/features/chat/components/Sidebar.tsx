import type { Chat } from "../../../types/chat";
import { LogoutIcon, PlusIcon, SearchIcon } from "../../../components/Icons";
import { getAvatarLabel, getChatTitle } from "../utils/chatUi";

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onLogout: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  search,
  onSearchChange,
  onSelectChat,
  onNewChat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="brand-line">
          <div className="brand-mark small">M</div>
          <strong>MAX Chat</strong>
        </div>
        <button className="icon-button" onClick={onLogout} title="Disconnect">
          <LogoutIcon />
        </button>
      </div>

      <div className="search-box">
        <SearchIcon />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search chats"
        />
      </div>

      <button className="new-chat-button" onClick={onNewChat}>
        <PlusIcon /> New chat
      </button>

      <div className="chat-list">
        {chats.length === 0 ? (
          <div className="empty-sidebar">
            <div className="empty-icon">💬</div>
            <strong>No conversations</strong>
            <span>Create a chat to start messaging.</span>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatListItem
              key={chat.chatId}
              chat={chat}
              isActive={chat.chatId === activeChatId}
              onClick={() => onSelectChat(chat.chatId)}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function ChatListItem({
  chat,
  isActive,
  onClick,
}: {
  chat: Chat;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`chat-list-item ${isActive ? "active" : ""}`}
      onClick={onClick}
    >
      <div className="avatar">{getAvatarLabel(chat)}</div>
      <div className="chat-preview">
        <strong>{getChatTitle(chat)}</strong>
        <span>{chat.lastMessage || chat.username || "No messages yet"}</span>
      </div>
      {!!chat.unreadCount && !isActive && (
        <span className="unread-badge">{chat.unreadCount}</span>
      )}
    </button>
  );
}
