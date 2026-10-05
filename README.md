# MAX Chat — GREEN-API React

A minimal messenger-style application built with React and TypeScript. The app uses GREEN-API to create chats, send messages, and poll incoming messages for the active chat.

## Features

- GREEN-API credentials form: `apiUrl`, `idInstance`, `apiTokenInstance`
- Phone number verification via `checkAccount`
- New chat creation from the returned `chatId`
- Fresh chat sessions without mixing previous messages into newly created chats
- Text message sending inside the active chat
- Incoming message polling via `lastIncomingMessages`
- Incoming messages are used only for the active chat
- Messages older than the chat creation time are ignored
- Sending / sent / failed message states
- Retry support for failed messages
- Chat search
- Unread badge and last message preview
- Auto-scroll when new messages arrive
- 4000-character message limit
- Responsive UI

## Tech Stack

- React + TypeScript
- Vite
- React Router
- TanStack Query
- Zustand
- Axios
- React Hook Form

## Project Structure

```text
src/features/chat
├── ChatPage.tsx                 # Container: state, forms, mutations, handlers
├── api/greenApi.ts              # GREEN-API HTTP methods
├── components/
│   ├── ChatWindow.tsx           # Header, messages, composer, welcome state
│   ├── NewChatModal.tsx         # New chat form modal
│   └── Sidebar.tsx              # Search, chat list, new chat button
├── hooks/useReceiveMessages.ts  # Incoming polling for the active chat
├── types.ts                     # Feature-level form types
└── utils/chatUi.ts              # UI formatting/helper functions
```

## Run Locally

```bash
npm install
cp .env.example .env
npm run dev
```

Open:

```text
http://localhost:5173
```

Enter your GREEN-API credentials on the login page. Because this is a frontend-only demo, credentials are stored in `localStorage`.

## GREEN-API Endpoints

The app currently uses these GREEN-API endpoints:

- `POST /waInstance{idInstance}/checkAccount/{apiTokenInstance}`
- `POST /waInstance{idInstance}/sendMessage/{apiTokenInstance}`
- `GET /waInstance{idInstance}/lastIncomingMessages/{apiTokenInstance}`

`lastIncomingMessages` can return older incoming messages. To avoid mixing old data into the current chat, `useReceiveMessages.ts` only stores messages that match the current `activeChatId` and were created after the chat was opened in the app.

## Telegram Compatibility

The UI, Zustand store, and chat components are intentionally kept mostly platform-neutral. This makes the app ready to be adapted for Telegram by adding a separate `telegramApi.ts` adapter for Telegram-specific message sending, incoming polling or webhook parsing, and Telegram `chatId` handling.

Important: GREEN-API endpoints do not work the same way as Telegram APIs. The current `greenApi.ts` file is written for the WhatsApp/MAX flow. Telegram support should be implemented as a separate API layer, while the existing UI components can be reused.

## Production Security Note

Do not expose long-lived API credentials in a production browser application. A production-grade version should route GREEN-API or Telegram API calls through a backend/BFF and keep secrets on the server side.

## Receiving Logic

`useReceiveMessages.ts` starts polling only when an active chat exists. The incoming message parser is isolated, so it can be adjusted if the GREEN-API payload changes or if a Telegram adapter is added later.
