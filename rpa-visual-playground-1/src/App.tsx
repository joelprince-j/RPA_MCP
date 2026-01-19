import React from 'react';
import Header from './components/Header/Header';
import { FlowBuilder } from './components/FlowBuilder/FlowBuilder';
import { StepConfigPanel } from './components/StepConfigPanel/StepConfigPanel';
import { OutputConfigPanel } from './components/OutputConfig/OutputConfigPanel';
import { FlowPreview } from './components/FlowPreview/FlowPreview';
import { PageTransitionModal } from './components/PageTransitionModal/PageTransitionModal';
import { JsonEditor } from './components/JsonEditor/JsonEditor';
import { useFlowStore } from './store/flowStore';

function App() {
  const { selectedStepId } = useFlowStore();
  const [isConfigPanelOpen, setIsConfigPanelOpen] = React.useState(false); // Closed by default
  const [isOutputPanelOpen, setIsOutputPanelOpen] = React.useState(false);

  // If selection is cleared (e.g., user closed panel or deleted step), collapse the config panel
  React.useEffect(() => {
    if (selectedStepId === null) {
      setIsConfigPanelOpen(false);
    }
  }, [selectedStepId]);

  // Listen for output config toggle and select events
  React.useEffect(() => {
    const handleToggle = () => {
      setIsOutputPanelOpen(prev => !prev);
      if (!isOutputPanelOpen) {
        setIsConfigPanelOpen(false); // Close step config when opening output
      }
    };
    
    const handleSelect = () => {
      // Always open output panel when selecting an output
      setIsOutputPanelOpen(true);
      setIsConfigPanelOpen(false);
    };
    
    const handleOpenStepConfig = () => {
      // Open step config panel and close output panel
      setIsConfigPanelOpen(true);
      setIsOutputPanelOpen(false);
    };
    
    const handleCloseAll = () => {
      // Close both panels when clicking empty canvas
      setIsOutputPanelOpen(false);
      setIsConfigPanelOpen(false);
    };
    
    window.addEventListener('toggleOutputConfig', handleToggle);
    window.addEventListener('selectOutput', handleSelect);
    window.addEventListener('openStepConfig', handleOpenStepConfig);
    window.addEventListener('closeAllPanels', handleCloseAll);
    
    return () => {
      window.removeEventListener('toggleOutputConfig', handleToggle);
      window.removeEventListener('selectOutput', handleSelect);
      window.removeEventListener('openStepConfig', handleOpenStepConfig);
      window.removeEventListener('closeAllPanels', handleCloseAll);
    };
  }, [isOutputPanelOpen]);

  return (
    <div className="flex flex-col h-screen bg-[#1a1d29]">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Flow Builder (Full Width) */}
        <div className="flex flex-col flex-1 overflow-hidden relative">
          <FlowBuilder />
        </div>

        {/* Right Sidebar - Step Config or Output Config (Collapsible) */}
        {isConfigPanelOpen && !isOutputPanelOpen && (
          <div className="flex-shrink-0 bg-[#1a1d29] border-l border-gray-800/50 w-96 shadow-xl">
            <StepConfigPanel />
          </div>
        )}

        {/* Right Sidebar - Output Config */}
        {isOutputPanelOpen && (
          <div className="flex-shrink-0 bg-[#1a1d29] border-l border-gray-800/50 w-96 shadow-xl">
            <OutputConfigPanel />
          </div>
        )}

        {/* Toggle Config Panel Button - Hidden, panels open on click */}
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