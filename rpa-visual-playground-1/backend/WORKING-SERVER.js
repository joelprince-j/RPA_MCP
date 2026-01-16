// WORKING SERVER - Handles CORS properly
const express = require('express');
const app = express();
const PORT = 3001; // Changed from 8000 to avoid Docker conflict

console.log('\n' + '='.repeat(60));
console.log('🚀 RPA Codegen Backend - WORKING VERSION');
console.log('='.repeat(60));

// STEP 1: CORS Headers - MUST come first
app.use((req, res, next) => {
  // Set CORS headers for ALL requests
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Log every request
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  
  // Handle OPTIONS preflight - CRITICAL!
  if (req.method === 'OPTIONS') {
    console.log('  ✅ Handling OPTIONS preflight request');
    return res.status(200).end();
  }
  
  next();
});

// STEP 2: Body parser
app.use(express.json());

// STEP 3: In-memory storage
const sessions = new Map();

// STEP 4: API Routes

// Start recording
app.post('/api/codegen/start', (req, res) => {
  console.log('  📝 POST /api/codegen/start');
  console.log('  Body:', req.body);
  
  const { url } = req.body;
  
  if (!url) {
    console.log('  ❌ No URL provided');
    return res.status(400).json({ error: 'URL is required' });
  }

  const sessionId = `session_${Date.now()}`;
  
  sessions.set(sessionId, {
    url,
    status: 'recording',
    actions: [],
    startTime: new Date().toISOString(),
  });

  console.log(`  ✅ Session created: ${sessionId}`);
  console.log(`  🌐 URL: ${url}`);

  res.json({ 
    sessionId,
    url,
    message: 'Recording session started' 
  });
});

// Record action
app.post('/api/codegen/action', (req, res) => {
  console.log('  📝 POST /api/codegen/action');
  
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

  console.log(`  ✅ Action recorded: ${action.type} (Total: ${session.actions.length})`);

  res.json({ 
    success: true,
    actionCount: session.actions.length 
  });
});

// Stop recording
app.post('/api/codegen/stop', (req, res) => {
  console.log('  📝 POST /api/codegen/stop');
  
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

  const flow = generateFlowFromActions(session);
  session.flow = flow;

  console.log(`  ✅ Flow generated: ${flow.steps.length} steps`);

  res.json({ 
    success: true,
    flow 
  });
});

// Get status
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

// Get flow
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

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    sessions: sessions.size,
    message: 'Server is running properly',
    server: 'WORKING-SERVER.js',
    timestamp: new Date().toISOString()
  });
});

// Generate flow from actions
function generateFlowFromActions(session) {
  const steps = [];
  
  // Step 1: Always add navigate step first
  steps.push({
    stepId: 1,
    action: 'navigate',
    params: {
      url: session.url,
      timeout: 30000,
    },
    description: `Navigate to ${session.url}`,
  });

  // Step 2+: Add recorded actions
  session.actions.forEach((action, index) => {
    const stepId = index + 2; // Start from 2 since navigate is 1
    
    // Map action type to valid ActionType
    let actionType = action.type;
    if (action.type === 'input') {
      actionType = 'input';
    } else if (action.type === 'click') {
      actionType = 'click';
    } else if (action.type === 'navigate') {
      actionType = 'navigate';
    }

    // Build params based on action type
    const params = {
      timeout: 30000,
    };

    // Add selectors for click/input actions
    if (actionType === 'click' || actionType === 'input') {
      params.selectors = {
        css: action.selector || undefined,
        xpath: action.xpath || undefined,
        text: action.text || undefined,
      };
      
      // Add elementId if available
      if (action.elementId) {
        params.elementId = action.elementId;
      }
    }

    // Add value for input actions
    if (actionType === 'input' && action.value) {
      params.value = action.value;
      params.clearFirst = true; // Clear field before typing
    }

    // Add URL for navigate actions
    if (actionType === 'navigate' && action.url) {
      params.url = action.url;
    }

    // Generate description
    let description = action.description;
    if (!description) {
      if (actionType === 'click') {
        description = `Click ${action.selector || action.text || 'element'}`;
      } else if (actionType === 'input') {
        description = `Type "${action.value}" into ${action.selector || 'input field'}`;
      } else if (actionType === 'navigate') {
        description = `Navigate to ${action.url}`;
      } else {
        description = `${actionType} action`;
      }
    }

    steps.push({
      stepId,
      action: actionType,
      params,
      description,
    });
  });

  // Generate flow metadata
  const hostname = new URL(session.url).hostname;
  const recordingDate = new Date(session.startTime).toLocaleString();
  
  return {
    flowId: `flow_${Date.now()}`,
    name: `Recorded Flow - ${hostname}`,
    description: `Auto-generated from recording on ${recordingDate}. Contains ${steps.length} steps including navigation.`,
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

// Start server
app.listen(PORT, () => {
  console.log('\n✅ Server started successfully!');
  console.log(`\n📍 URL: http://localhost:${PORT}`);
  console.log(`🌐 CORS: Enabled for http://localhost:5173`);
  console.log(`📊 Sessions: ${sessions.size}`);
  console.log('\n📋 Available Endpoints:');
  console.log('   GET    /health');
  console.log('   POST   /api/codegen/start');
  console.log('   POST   /api/codegen/action');
  console.log('   POST   /api/codegen/stop');
  console.log('   GET    /api/codegen/status/:sessionId');
  console.log('   GET    /api/codegen/flow/:sessionId');
  console.log('\n🧪 Test: http://localhost:8000/health');
  console.log('✅ Ready to accept requests!\n');
});
