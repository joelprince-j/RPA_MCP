import { Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './components/LandingPage/LandingPage';
import { AutoRecorder } from './components/AutoRecorder/AutoRecorder';
import { PlaygroundPage } from './pages/PlaygroundPage';

function App() {
  console.log('App component rendering');
  
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/recorder" element={<AutoRecorder />} />
      <Route path="/playground" element={<PlaygroundPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;