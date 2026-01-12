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
import { SiteMapViewer } from './components/SiteMapViewer/SiteMapViewer';
import { FlowPreview } from './components/FlowPreview/FlowPreview';
import { PageTransitionModal } from './components/PageTransitionModal/PageTransitionModal';
import { useFlowStore } from './store/flowStore';

function App() {
  const { isSiteMapOpen, setSiteMapOpen } = useFlowStore();

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Site Map */}
        {isSiteMapOpen && (
          <div className="flex-shrink-0 bg-white border-r w-80">
            <SiteMapViewer />
          </div>
        )}

        {/* Toggle Site Map Button */}
        {!isSiteMapOpen && (
          <button
            onClick={() => setSiteMapOpen(true)}
            className="absolute left-0 z-10 p-2 transform -translate-y-1/2 bg-white border border-l-0 rounded-r-lg shadow-lg top-1/2 hover:bg-gray-50"
            aria-label="Show Site Map"
            title="Show Site Map"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
            <span className="sr-only">Show Site Map</span>
          </button>
        )}

        {/* Main Content - Flow Builder */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <FlowBuilder />
        </div>

        {/* Right Sidebar - Step Config */}
        <div className="flex-shrink-0 bg-white border-l w-96">
          <StepConfigPanel />
        </div>
      </div>

      {/* Flow Preview Overlay */}
      <FlowPreview />

      {/* Page Transition Modal */}
      <PageTransitionModal />
    </div>
  );
}

export default App;