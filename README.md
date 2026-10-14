# StudySync

StudySync is an AI-powered, real-time collaborative study platform.

It combines group chat, shared notes, and AI study tools into a single workspace for students.

## What This Project Does

- User authentication with secure cookie-based JWT sessions.
- Create and discover study groups by subject.
- Join groups and request membership when needed.
- Leave groups as a normal member at any time.
- Transfer admin ownership before leaving, or delete a group as the current admin.
- Review and manage incoming join requests from the group admin dashboard.
- Real-time group chat with typing indicators.
- Chat reactions (heart reactions).
- Link sharing in chat.
- File sharing in chat (base64 payloads).
- Collaborative notes editor with auto-save via sockets.
- Notes version history with restore support.
- AI assistant for question answering.
- AI notes summarization.
- AI quiz generation.
- Responsive UI with light/dark theme toggle.

## Architecture Overview

This repository is split into two main apps:

- client: React + Vite frontend.
- server: Express + MongoDB + Socket.IO backend.

At runtime:

- The frontend calls backend REST APIs under /api/*.
- Real-time collaboration is handled through Socket.IO.
- In production-style builds, the backend serves the built frontend from server/public.

## Tech Stack

### Frontend

- React 19
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Framer Motion
- Socket.IO Client
- React Quill
- React Markdown + remark-gfm

### Backend

- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- JWT authentication (httpOnly cookie token)
- LangChain + Mistral AI integration
- Winston logging

## Core Functionality

### Authentication

- Register, login, logout, and profile endpoints.
- JWT token is set in a secure httpOnly cookie.
- Protected routes use middleware that reads req.cookies.token.

### Study Groups

- Create a group with name, subject, and description.
- Public group listing for discovery.
- User-specific group listing.
- Request to join a group when you are not already a member.
- Leave a group at any time as a standard member.
- If you are the admin, choose one of the following before leaving:
  - delete the group permanently
  - transfer admin role to a current member and leave
  - assign a new admin and leave immediately
- The new admin can view, accept, or reject all pending join requests.
- A former admin can rejoin by sending a new request after leaving.

### Real-Time Chat

- Join group rooms and receive live messages.
- Message types: text, file, link, ai, system.
- Add and toggle emoji reactions (currently heart reaction flow).
- Typing and stop-typing events.

### Collaborative Notes

- Group notes are synced in real time.
- Auto-save after short debounce.
- Version history stored in noteHistory.
- Restore any previous note version.
- Note history keeps recent versions (up to the latest 10 entries).

### AI Features

- Ask AI questions in group context.
- Summarize notes.
- Generate quiz questions.
- Powered by Mistral through LangChain.

## API Routes

Base path: /api

### Auth

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/profile (protected)

### Groups

- GET /api/groups
- POST /api/groups (protected)
- GET /api/groups/my-groups (protected)
- GET /api/groups/:id (protected)
- POST /api/groups/:id/request-join (protected)
- POST /api/groups/:id/approve-request (protected)
- POST /api/groups/:id/reject-request (protected)
- POST /api/groups/:id/join (protected)
- POST /api/groups/:id/leave (protected)

Group permissions:

- Any member may leave the group.
- An admin may delete the group or transfer admin rights before leaving.
- The current admin must select another existing member when transferring ownership.
- The transferred admin immediately gains full view/approve/reject rights for pending requests.

### Messages

- POST /api/messages (protected)
- GET /api/messages/:groupId (protected)

### AI

- POST /api/ai/ask (protected)
- POST /api/ai/summarize (protected)
- POST /api/ai/quiz (protected)

## Socket Events

### Client to Server

- join_group
- join_notes
- update_note
- send_message
- add_reaction
- typing
- stop_typing

### Server to Client

- receive_message
- message_updated
- note_update
- note_history_update
- user_typing
- user_stop_typing

## Environment Variables

Create a .env file in server with:

SERVER ENV

- MONGO_URI=your_mongodb_connection_string
- JWT_SECRET=your_long_random_secret
- MISTRAL_API_KEY=your_mistral_api_key
- CLIENT_URL=http://localhost:5173
- PORT=5000
- NODE_ENV=development

Optional client-side env in client/.env:

- VITE_SOCKET_URL=http://localhost:5000

Notes:

- If VITE_SOCKET_URL is not set, client uses window.location.origin.
- Some test scripts reference GEMINI_API_KEY, but runtime AI flow uses Mistral.

## Local Development Setup

Prerequisites:

- Node.js 18+
- npm
- MongoDB instance (local or cloud)

Install dependencies:

1. Install client dependencies

```bash
cd client
npm install
```

2. Install server dependencies

```bash
cd ../server
npm install
```

Run development:

1. Start backend

```bash
cd server
npm run dev
```

2. Start frontend in a second terminal

```bash
cd client
npm run dev
```

Frontend default: http://localhost:5173

Backend default: http://localhost:5000

## Group Management Behavior

The group management flow supports the following experience:

1. Any member can leave a group from the group page.
2. If the current admin leaves, the app prompts them to either:
   - delete the group permanently
   - transfer admin role to another member before leaving
   - assign a new admin and leave immediately
3. The old admin is removed from the group membership when the transfer occurs and can submit a new request to rejoin later.
4. The new admin gains full authority over the join request queue and can approve or reject incoming requests.
5. Request management is shown from the group admin controls and remains available after the transfer.

This behavior is enforced in both the backend service logic and the frontend group UI.

## Production Build Flow (Current Script Behavior)

From server folder:

```bash
npm run build
```

This will:

- Build the client app.
- Move client/dist into server/public.

Then run:

```bash
npm start
```

Backend will serve API and built frontend from the same server.

## Project Structure

High-level structure:

```text
StudySync/
	client/
		src/
			components/
			features/
			pages/
			services/
			sockets/
			context/
	server/
		src/
			routes/
			controllers/
			services/
			repositories/
			models/
			sockets/
			ai/
			middlewares/
			config/
```

## Notable Implementation Details

- The app uses cookie-based auth instead of Authorization headers.
- Chat file attachments are stored as base64 strings in message records (simple but not ideal for large-scale production).
- AI responses are persisted in browser localStorage for chat continuity.
- Theme preference and active group tab are persisted in localStorage.

## Current Limitations and Improvement Opportunities

- File storage should move to object storage (S3, Cloudinary, etc.) for scalability.
- A centralized root-level script set could improve developer experience for running client and server together.
- Additional validation/rate-limiting around AI and message payload size would improve robustness.

## License

ISC
