# Todo API

Express.js + Mongoose REST API with unit tests and Coolify CI/CD.

## Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/todos` | Get all todos (supports `?completed=true&priority=high&page=1&limit=10`) |
| GET | `/api/todos/:id` | Get single todo |
| POST | `/api/todos` | Create todo |
| PUT | `/api/todos/:id` | Update todo |
| DELETE | `/api/todos/:id` | Delete todo |
| PATCH | `/api/todos/:id/toggle` | Toggle completed |

## Todo fields

```json
{
  "title": "string (required, max 100)",
  "description": "string (optional, max 500)",
  "completed": "boolean (default: false)",
  "priority": "low | medium | high (default: medium)"
}
```

## Local setup

```bash
cp .env.example .env        # add your MONGO_URI
npm install
npm run dev
```

## Tests

```bash
npm test                    # run all tests
npm run test:coverage       # with coverage report
```

## GitHub Actions secret required

| Secret | Value |
|--------|-------|
| `COOLIFY_WEBHOOK_URL` | Your Coolify deploy webhook URL |

## Coolify environment variables

Set these in Coolify → Environment Variables:

```
PORT=3000
NODE_ENV=production
MONGO_URI=mongodb://your-mongo-host:27017/todo-api
```
 
