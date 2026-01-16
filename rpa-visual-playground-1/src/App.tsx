// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import Header from './components/Header/Header';
import { FlowBuilder } from './components/FlowBuilder/FlowBuilder';
import { StepConfigPanel } from './components/StepConfigPanel/StepConfigPanel';
import { FlowPreview } from './components/FlowPreview/FlowPreview';
import { PageTransitionModal } from './components/PageTransitionModal/PageTransitionModal';
import { JsonEditor } from './components/JsonEditor/JsonEditor';
import { LandingPage } from './components/LandingPage/LandingPage';
import { CodegenMode } from './components/CodegenMode/CodegenMode';
import { useFlowStore } from './store/flowStore';
import type { Flow } from './types/flow.types';

function App() {
  const { isSiteMapOpen, setSiteMapOpen } = useFlowStore();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Flow Builder (Full Width) */}
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <FlowBuilder />
        </div>

        {/* Right Sidebar - Step Config (Collapsible) */}
        {isConfigPanelOpen && (
          <div className="flex-shrink-0 bg-[#1a1d29] border-l border-gray-800/50 w-96 shadow-xl">
            <StepConfigPanel />
          </div>
        )}

        {/* Toggle Config Panel Button */}
        {!isConfigPanelOpen && (
          <button
            onClick={() => setIsConfigPanelOpen(true)}
            className="absolute right-0 z-10 p-2 transform -translate-y-1/2 bg-white border border-r-0 rounded-l-lg shadow-lg top-1/2 hover:bg-gray-50 transition-all"
            aria-label="Show Configuration Panel"
            title="Show Configuration Panel"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="sr-only">Show Configuration Panel</span>
          </button>
        )}
      </div>

      {/* Flow Preview Overlay */}
      <FlowPreview />

      {/* JSON Editor Modal */}
      <JsonEditor />

      {/* Page Transition Modal */}
      <PageTransitionModal />
    </div>
  );
}

export default App;