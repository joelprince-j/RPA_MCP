import { useState } from 'react'
import { useFlowStore } from '../../store/flowStore'
import { exportFlowToJSON, importFlowFromJSON, exportFlowToPython } from '../../services/flowExporter'
import { Play, Download, Upload, FileCode, Eye, EyeOff, Settings, RefreshCw, FileJson, Home } from 'lucide-react'
import { flowApi, executionApi } from '../../services/api';

interface HeaderProps {
  onBackToHome?: () => void;
}

export default function Header({ onBackToHome }: HeaderProps = {}) {
  const { 
    flow, 
    steps, 
    exportFlow, 
    setFlow, 
    setPreviewOpen, 
    isPreviewOpen, 
    isExecuting, 
    setExecuting,
    isExtractingPage,
    setExtractingPage,
    mergePageIntoSiteMap,
    setJsonEditorOpen,
  } = useFlowStore()
  const [showSettings, setShowSettings] = useState(false)

  const handleExportJSON = () => {
    const flowData = exportFlow()
    exportFlowToJSON(flowData)
  }

  const handleExportPython = () => {
    const flowData = exportFlow()
    exportFlowToPython(flowData)
  }

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        const importedFlow = await importFlowFromJSON(file)
        setFlow(importedFlow)
        alert('Flow imported successfully!')
      } catch (error) {
        alert('Failed to import flow: ' + error.message)
      }
    }
  }

  // const handleExecute = async () => {
  //   if (steps.length === 0) {
  //     alert('Please add at least one step to execute')
  //     return
  //   }
  //   setExecuting(true)
  //   try {
  //     console.log('Executing flow...', exportFlow())
  //     await new Promise(resolve => setTimeout(resolve, 2000))
  //     alert('Flow execution completed!')
  //   } catch (error) {
  //     alert('Failed to execute flow: ' + error.message)
  //   } finally {
  //     setExecuting(false)
  //   }
  // }

  // const handleExecute = async () => {
  //   if (steps.length === 0) {
  //     alert('Please add at least one step to execute');
  //     return;
  //   }

  //   setExecuting(true);
  //   try {
  //     // First save the flow
  //     const flowData = exportFlow();
  //     await flowApi.saveFlow(flowData);

  //     // Then execute it
  //     const report = await executionApi.executeFlow(flowData.flowId);

  //     alert(`Flow execution completed!\nStatus: ${report.status}\nSteps completed: ${report.stepsCompleted}/${report.totalSteps}`);
  //     console.log('Execution report:', report);
  //   } catch (error: any) {
  //     alert('Failed to execute flow: ' + error.message);
  //   } finally {
  //     setExecuting(false);
  //   }
  // };

  const handleExecute = async () => {
    if (steps.length === 0) {
      alert('Please add at least one step to execute');
      return;
    }

    setExecuting(true);

    try {
      console.log('🚀 Starting execution...');

      // Get current flow data
      const flowData = exportFlow();
      console.log('Flow data:', flowData);

      // First, save the flow to backend
      console.log('💾 Saving flow to backend...');
      try {
        const saveResponse = await fetch('http://localhost:8000/api/flows', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(flowData),
        });

        if (!saveResponse.ok) {
          throw new Error(`Failed to save flow: ${saveResponse.statusText}`);
        }

        const saveResult = await saveResponse.json();
        console.log('✅ Flow saved:', saveResult);
      } catch (saveError) {
        console.error('Save error:', saveError);
        throw new Error('Failed to save flow: ' + saveError.message);
      }

      // Then execute the flow
      console.log('▶️ Executing flow...');
      const executeResponse = await fetch('http://localhost:8000/api/executions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flowId: flowData.flowId,
          variables: flowData.variables || {},
        }),
      });

      if (!executeResponse.ok) {
        const errorData = await executeResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Execution failed: ${executeResponse.statusText}`);
      }

      const report = await executeResponse.json();
      console.log('✅ Execution report:', report);

      // Check for page transitions and show modal if detected
      if (report.pageTransitions && report.pageTransitions.length > 0) {
        // Show modal for the last page transition
        const lastTransition = report.pageTransitions[report.pageTransitions.length - 1];
        const { setPendingPageTransition } = useFlowStore.getState();
        setPendingPageTransition(lastTransition);
        
        // Also merge current page if available (for final state)
        if (report.currentPage) {
          mergePageIntoSiteMap(report.currentPage);
          console.log('✅ Merged current page into site map');
        }
      } else if (report.currentPage) {
        // No transitions but we have a current page (might be same page)
        mergePageIntoSiteMap(report.currentPage);
        console.log('✅ Merged current page into site map');
      }

      // Show detailed results (but don't block if modal is showing)
      const pageTransitionsInfo = report.pageTransitions && report.pageTransitions.length > 0
        ? `\nPage Transitions:\n${report.pageTransitions.map(pt => `- Step ${pt.stepId}: ${new URL(pt.fromUrl).pathname} → ${new URL(pt.toUrl).pathname}`).join('\n')}`
        : '';

      const currentPageInfo = report.currentPage
        ? `\nCurrent Page: ${report.currentPage.url}\nElements: ${report.currentPage.elements.length}`
        : '';

      const message = `
Flow Execution Complete! 🎉

Status: ${report.status}
Steps Completed: ${report.stepsCompleted}/${report.totalSteps}
Duration: ${report.duration}ms
${pageTransitionsInfo}
${currentPageInfo}

${report.errors.length > 0 ? `\nErrors:\n${report.errors.map(e => `- Step ${e.stepId}: ${e.error}`).join('\n')}` : ''}

${Object.keys(report.extractedData).length > 0 ? `\nExtracted Data:\n${JSON.stringify(report.extractedData, null, 2)}` : ''}
    `.trim();

      // Only show alert if no page transition modal is showing
      if (!report.pageTransitions || report.pageTransitions.length === 0) {
        alert(message);
      }

    } catch (error: any) {
      console.error('❌ Execution error:', error);
      alert('Failed to execute flow:\n\n' + (error.message || 'Unknown error'));
    } finally {
      setExecuting(false);
    }
  };

  const handleExtractCurrentPage = async () => {
    if (steps.length === 0) {
      alert('Please add at least one step to execute');
      return;
    }

    setExtractingPage(true);

    try {
      console.log('🔄 Extracting current page elements...');

      // Get current flow data
      const flowData = exportFlow();
      console.log('Flow data:', flowData);

      // Save flow first
      try {
        await flowApi.saveFlow(flowData);
      } catch (saveError) {
        console.error('Save error:', saveError);
        // Continue anyway
      }

      // Execute flow partially up to the last step
      const result = await executionApi.executeFlowPartial(
        flowData.flowId,
        steps.length
      );

      console.log('✅ Page extracted:', result);

      // Merge the extracted page into the site map
      if (result.currentPage) {
        mergePageIntoSiteMap(result.currentPage);
        alert(
          `✅ Page elements extracted successfully!\n\n` +
          `URL: ${result.currentUrl}\n` +
          `Elements found: ${result.currentPage.elements.length}\n\n` +
          `Check the Site Map sidebar to see the new elements!`
        );
      } else {
        alert('No page data extracted. Make sure the flow executed successfully.');
      }
    } catch (error: any) {
      console.error('❌ Extraction error:', error);
      alert('Failed to extract page elements:\n\n' + (error.message || 'Unknown error'));
    } finally {
      setExtractingPage(false);
    }
  };

  return (
    <header className="text-white bg-[#1a1d29] border-b border-gray-800 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-2 transition-colors bg-gray-700 rounded hover:bg-gray-600"
              title="Back to Home"
            >
              <Home size={20} />
            </button>
          )}
          <h1 className="text-2xl font-bold text-blue-400">RPA Flow Builder</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 bg-gray-800 rounded">
              {steps.length} steps
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPreviewOpen(!isPreviewOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors bg-gray-800/50 rounded-md hover:bg-gray-700/50 border border-gray-700/50"
          >
            {isPreviewOpen ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="hidden sm:inline text-xs">Preview</span>
          </button>
          <button
            onClick={() => setJsonEditorOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors bg-purple-600/80 rounded-md hover:bg-purple-600 border border-purple-500/30"
            title="Open JSON Editor"
          >
            <FileJson size={14} />
            <span className="hidden sm:inline text-xs">JSON</span>
          </button>
          {/* <label className="flex items-center gap-2 px-3 py-2 transition-colors bg-gray-700 rounded cursor-pointer hover:bg-gray-600">
            <Upload size={16} />
            <span className="hidden sm:inline">Import</span>
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label> */}
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-2 transition-colors bg-gray-700 rounded hover:bg-gray-600">
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </button>
            <div className="absolute right-0 z-50 invisible w-48 mt-1 transition-all bg-white rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-hover:visible">
              <button
                onClick={handleExportJSON}
                className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-700 rounded-t-lg hover:bg-gray-100"
              >
                <FileCode size={16} />
                Export as JSON
              </button>
              <button
                onClick={handleExportPython}
                className="flex items-center w-full gap-2 px-4 py-2 text-left text-gray-700 rounded-b-lg hover:bg-gray-100"
              >
                <FileCode size={16} />
                Export as Python
              </button>
            </div>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm transition-colors bg-gray-800/50 rounded-md hover:bg-gray-700/50 border border-gray-700/50"
          >
            <Settings size={14} />
          </button>
        </div>
      </div>
      {showSettings && (
        <div className="px-6 py-4 bg-gray-800/30 border-t border-gray-800">
          <h3 className="mb-3 text-xs font-semibold text-gray-300 uppercase tracking-wide">Flow Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5 text-xs text-gray-400">Flow Name</label>
              <input
                type="text"
                value={flow?.name || ''}
                onChange={(e) => {
                  const currentFlow = exportFlow()
                  setFlow({ ...currentFlow, name: e.target.value })
                }}
                className="w-full px-3 py-1.5 text-sm text-white bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter flow name"
              />
            </div>
            <div>
              <label className="block mb-1.5 text-xs text-gray-400">Start URL</label>
              <input
                type="url"
                value={flow?.startUrl || ''}
                onChange={(e) => {
                  const currentFlow = exportFlow()
                  setFlow({ ...currentFlow, startUrl: e.target.value })
                }}
                className="w-full px-3 py-1.5 text-sm text-white bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

// import { useFlowStore } from '../../store/flowStore'
// import { exportFlowToJSON, importFlowFromJSON, exportFlowToPython } from '../../services/flowExporter'
// import { Play, Download, Upload, FileCode, Eye, EyeOff, Settings } from 'lucide-react'

// export default function Header() {
//   return <div>Header</div>
// }
