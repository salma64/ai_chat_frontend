# AI Chat Frontend

React frontend for a full-stack AI chat application powered by a Node.js backend and the Gemini API.

## Features

- Vite + React + TypeScript
- Tailwind CSS responsive interface
- SSE streamed AI responses
- Markdown rendering
- Loading indicator
- Chat message state management
- Automatic scroll to latest message
- Conversation thread list
- Save/load and resume conversations
- Inline citations with hover tooltips
- Response regeneration
- Response version switching
- Like/dislike feedback
- Feedback modal
- Response metadata accordion
- In-app guided tour

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- React Markdown
- remark-gfm
- shadcn/ui

## Project Structure

```text
src/
├── components/
│   ├── ChatInput.tsx
│   ├── ChatMessage.tsx
│   ├── GuidedTour.tsx
│   └── ui/
├── pages/
│   └── ChatPage.tsx
├── types/
│   └── chat.ts
├── lib/
├── App.tsx
├── index.css
└── main.tsx
```

## Quick Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm run dev
```

The application is available at:

```text
http://localhost:5173
```

The backend should be running at:

```text
http://localhost:3000
```

## Full-Stack Setup

Start MongoDB locally.

In the backend repository:

```bash
npm install
node server.js
```

In the frontend repository:

```bash
npm install
npm run dev
```

Then open:

```text
http://localhost:5173
```

## Main User Flow

1. Start a new conversation.
2. Send a message.
3. Receive a streamed Gemini response.
4. View Markdown-formatted content and citations.
5. Regenerate the response when needed.
6. Switch between generated response versions.
7. Submit like/dislike feedback.
8. Open a previous conversation from the sidebar and resume it.

## Backend

This frontend communicates with the Node.js backend through:

- `POST /api/chat`
- `GET /api/history/:conversationId`
- `GET /api/conversations`
- `POST /api/feedback`

## Notes

The Gemini API key is stored only in the backend `.env` file and is never exposed to the React frontend.