# FighterGame

A real-time multiplayer fighting game running in the browser, built with TypeScript and Socket.io.

## Tech stack

- **TypeScript** — shared types between client and server (`/shared`)
- **Node.js + Express** — HTTP server and static file serving
- **Socket.io** — real-time bidirectional communication for multiplayer
- **Docker** — containerised deployment
- **GitHub Actions** — CI/CD pipeline

## Architecture

```
client/   → browser-side game (TypeScript)
server/   → Node.js + Express + Socket.io
shared/   → types and interfaces used by both
```

## Run locally

```bash
# Install dependencies
npm install

# Start client dev server and backend (two terminals)
npm run dev:client
npm run dev:server
```

Client runs on [http://localhost:5173](http://localhost:5173) (or the port shown in your terminal).

## Run with Docker

```bash
# Build
docker build -t fightergame:latest .

# Run (dev — port 3000)
docker run -d -p 3000:3000 --name fightergame fightergame:latest

# Run (production — port 80)
docker run -d -p 80:3000 --name fightergame fightergame:latest

# Stop
docker stop fightergame
```

