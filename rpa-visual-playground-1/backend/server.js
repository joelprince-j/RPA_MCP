const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:5173', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Apply CORS before other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Body parser middleware
app.use(bodyParser.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory storage for recording sessions
const sessions = new Map();

// Start a new recording session
app.post('/api/codegen/start', (req, res) => {
  const { url } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  const sessionId = `session_${Date.now()}`;
  
  sessions.set(sessionId, {
    url,
    status: 'recording',
    actions: [],
    startTime: new Date().toISOString(),
  });

  res.json({ 
    sessionId,
    url,
    message: 'Recording session started' 
  });
});

// Record an action
app.post('/api/codegen/action', (req, res) => {
  const { sessionId, action } = req.body;
  
  if (!sessionId || !action) {
    return res.status(400).json({ error: 'sessionId and action are required' });
  }

  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.actions.push({
    ...action,
    timestamp: new Date().toISOString(),
  });

  res.json({ 
    success: true,
    actionCount: session.actions.length 
  });
});

// Stop recording and generate flow
app.post('/api/codegen/stop', (req, res) => {
  const { sessionId } = req.body;
  
  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' });
  }

  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  session.status = 'completed';
  session.endTime = new Date().toISOString();

  // Generate flow from recorded actions
  const flow = generateFlowFromActions(session);
  session.flow = flow;

  res.json({ 
    success: true,
    flow 
  });
});

// Get session status
app.get('/api/codegen/status/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    status: session.status,
    actionCount: session.actions.length,
  });
});

// Get generated flow
app.get('/api/codegen/flow/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  
  const session = sessions.get(sessionId);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (!session.flow) {
    return res.status(400).json({ error: 'Flow not yet generated' });
  }

  res.json(session.flow);
});

// Helper function to generate flow from actions
function generateFlowFromActions(session) {
  const steps = session.actions.map((action, index) => {
    return {
      stepId: index + 1,
      action: action.type, // 'click', 'input', 'navigate', etc.
      params: {
        timeout: 30000,
        elementId: action.elementId || action.selector,
        selectors: {
          css: action.selector,
          xpath: action.xpath,
          text: action.text,
        },
        value: action.value,
        url: action.url,
      },
      description: action.description || `${action.type} ${action.selector || action.url || ''}`,
    };
  });

  return {
    flowId: `flow_${Date.now()}`,
    name: `Recorded Flow - ${new URL(session.url).hostname}`,
    description: `Auto-generated from recording on ${new Date(session.startTime).toLocaleString()}`,
    startUrl: session.url,
    steps,
    variables: {},
    errorHandling: {
      maxRetries: 3,
      screenshotOnError: true,
      fallbackSelectors: true,
    },
  };
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', sessions: sessions.size });
});

app.listen(PORT, () => {
  console.log(`🚀 RPA Codegen Backend running on http://localhost:${PORT}`);
  console.log(`📝 Sessions: ${sessions.size}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log(`\n📋 Available endpoints:`);
  console.log(`   POST   /api/codegen/start`);
  console.log(`   POST   /api/codegen/action`);
  console.log(`   POST   /api/codegen/stop`);
  console.log(`   GET    /api/codegen/status/:sessionId`);
  console.log(`   GET    /api/codegen/flow/:sessionId`);
  console.log(`   GET    /health`);
  console.log(`\n✅ Ready to accept requests!`);
});
