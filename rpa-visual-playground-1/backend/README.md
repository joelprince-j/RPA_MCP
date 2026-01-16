# RPA Codegen Backend

Simple Node.js backend for recording user actions and generating RPA flows.

## Setup

```bash
cd backend
npm install
npm start
```

Server runs on `http://localhost:8000`

## API Endpoints

### 1. Start Recording Session
```
POST /api/codegen/start
Body: { url: string }
Response: { sessionId: string, url: string }
```

### 2. Record Action
```
POST /api/codegen/action
Body: { 
  sessionId: string,
  action: {
    type: 'click' | 'input' | 'navigate',
    selector?: string,
    xpath?: string,
    text?: string,
    value?: string,
    url?: string,
    elementId?: string,
    description?: string
  }
}
Response: { success: true, actionCount: number }
```

### 3. Stop Recording & Generate Flow
```
POST /api/codegen/stop
Body: { sessionId: string }
Response: { success: true, flow: Flow }
```

### 4. Get Session Status
```
GET /api/codegen/status/:sessionId
Response: { status: string, actionCount: number }
```

### 5. Get Generated Flow
```
GET /api/codegen/flow/:sessionId
Response: Flow (JSON)
```

### 6. Health Check
```
GET /health
Response: { status: 'ok', sessions: number }
```

## How It Works

1. Frontend starts recording session
2. User interacts with website in iframe
3. Frontend captures events (click, input)
4. Each action is sent to backend
5. Backend stores actions in memory
6. User stops recording
7. Backend generates Flow JSON from actions
8. Frontend imports flow into playground

## Development

```bash
npm run dev  # Run with nodemon (auto-restart)
```

## Environment

- Node.js 14+
- Express.js
- CORS enabled
- In-memory storage (no database needed)
