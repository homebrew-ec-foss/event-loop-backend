## Getting Started

The go backend server must be running for functionality. Change the `GO_BACKEND_URL` environment variable in `event-loop-backend/next.config.mjs` to the correct https url of the go gin server.

`event-loop-frontend/next.config.mjs`

```mjs
const nextConfig = {
    env: {
        // valid https url to go backend
        GO_BACKEND_URL: "...",
    },
};
```

Once finished, run the following to start the fe

```bash
npm run dev
```

> `next` runs an experimental https server that may reqire authentications
