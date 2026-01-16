// Ultra-simple test server to verify CORS works
const express = require('express');
const app = express();

// CORS - Allow everything from localhost:5173
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    console.log('✅ Handling OPTIONS preflight');
    return res.status(200).end();
  }
  next();
});

app.use(express.json());

// Test endpoint
app.post('/api/codegen/start', (req, res) => {
  console.log('✅ POST /api/codegen/start received');
  console.log('Body:', req.body);
  
  res.json({
    sessionId: 'test_123',
    url: req.body.url,
    message: 'Test server working!'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Test server running' });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(50));
  console.log('🧪 TEST SERVER RUNNING');
  console.log('='.repeat(50));
  console.log(`\n📍 http://localhost:${PORT}`);
  console.log(`🌐 CORS enabled for: http://localhost:5173`);
  console.log('\n✅ Try: http://localhost:8000/health');
  console.log('✅ Ready for requests!\n');
});
