# Tasko

A full-stack Trello clone — boards, lists, cards, drag-and-drop, real-time sync via WebSockets, and session-based auth with a guest mode for demos.

**Live demo:** https://tasko-front-end.vercel.app *(click "Let's start" to explore instantly as a guest — no signup needed)*

<!--
Add 2-3 screenshots here once you have them, e.g.:
![Home page](./docs/screenshot-home.png)
![Board view](./docs/screenshot-board.png)
-->

## Features

- Create boards, lists, and cards with full drag-and-drop reordering
- Labels, checklists, due dates, and card descriptions
- Real-time board updates across sessions via Socket.IO
- Session-based auth (signup/login) plus a one-click guest mode
- Responsive Vue 3 + Vite frontend, Express/MongoDB backend

## Tech stack

**Frontend:** Vue 3, Vuex, Vue Router, Vite, SCSS, vue3-smooth-dnd, Socket.IO client
**Backend:** [Tasko backend →](https://github.com/EL00SE/Tasko-back-End) — Node/Express, MongoDB + Mongoose, Socket.IO, express-session
**Deployment:** Frontend on Vercel, backend on Render, database on MongoDB Atlas

## Architecture

```
Vue 3 SPA (Vercel)  ──HTTP/JSON──>  Express API (Render)  ──>  MongoDB Atlas
                     <─WebSocket─>  Socket.IO server
```

Boards, lists ("groups"), and cards are stored as nested documents on a single `board` collection; the API is a thin REST layer over it (`/api/board`, `/api/user`, `/api/auth`), and Socket.IO broadcasts board changes to everyone else viewing the same board in real time.

## Local development

```sh
npm install
npm run dev        # starts Vite dev server against localhost:3030
```

By default it talks to the backend at `http://localhost:3030` — see [Tasko-back-End](https://github.com/EL00SE/Tasko-back-End) to run that locally too, or just point `src/services/http.service.js` / `socket.service.js` at the deployed Render backend.

```sh
npm run build       # production build to dist/
npm run test:unit   # Vitest
```

## Roadmap

- A proper "browse all boards" landing view (currently shows your own boards; a dedicated template gallery is scaffolded but not fully wired up)
- Code-split the main bundle (currently a single ~1.5MB chunk)
