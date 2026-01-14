import React from 'react';
import { useFlowStore } from '../../store/flowStore';
import { RefreshCw, X, ExternalLink } from 'lucide-react';

export const PageTransitionModal: React.FC = () => {
  const {
    pendingPageTransition,
    setPendingPageTransition,
    isExtractingPage,
    setExtractingPage,
    mergePageIntoSiteMap,
    setSelectedPageIndex,
    siteMap,
  } = useFlowStore();

  if (!pendingPageTransition) {
    return null;
  }

  const handleExtractPage = async () => {
    setExtractingPage(true);
    try {
      // Extract page elements from the current page state
      const { executionApi } = await import('../../services/api');
      const { exportFlow } = useFlowStore.getState();
      const flowData = exportFlow();

      // Save flow first
      try {
        const { flowApi } = await import('../../services/api');
        await flowApi.saveFlow(flowData);
      } catch (saveError) {
        console.error('Save error:', saveError);
      }

      // Execute flow partially to get current page
      const result = await executionApi.executeFlowPartial(
        flowData.flowId,
        pendingPageTransition.stepId
      );

      if (result.currentPage) {
        // Merge the extracted page into the site map
        mergePageIntoSiteMap(result.currentPage);

        // Find the index of the newly added/updated page and switch to it
        const updatedSiteMap = useFlowStore.getState().siteMap;
        if (updatedSiteMap) {
          const pageIndex = updatedSiteMap.pages.findIndex(
            p => p.url === result.currentPage.url
          );
          if (pageIndex >= 0) {
            setSelectedPageIndex(pageIndex);
          }
        }

        // Close modal
        setPendingPageTransition(null);
        alert(
          `✅ Page elements extracted successfully!\n\n` +
          `URL: ${result.currentUrl}\n` +
          `Elements found: ${result.currentPage.elements.length}\n\n` +
          `You can now continue building your flow with elements from this page!`
        );
      }
    } catch (error: any) {
      console.error('❌ Extraction error:', error);
      alert('Failed to extract page elements:\n\n' + (error.message || 'Unknown error'));
    } finally {
      setExtractingPage(false);
    }
  };

  const handleCancel = () => {
    setPendingPageTransition(null);
  };

  const getPageName = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname || url;
    } catch {
      return url;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ExternalLink size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">New Page Detected</h3>
              <p className="text-xs text-gray-500">Flow execution led to a new page</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  Page Transition Detected
                </p>
                <p className="text-xs text-blue-700 mb-2">
                  After step {pendingPageTransition.stepId}, the flow navigated to a new page.
                </p>
                <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {pendingPageTransition.toUrl}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              Would you like to extract elements from this page to continue building your flow?
            </p>
            <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
              <li>Extract all interactive elements (buttons, inputs, links)</li>
              <li>Add them to the Site Map sidebar</li>
              <li>Continue building your flow with these elements</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t bg-gray-50">
          <button
            onClick={handleCancel}
            disabled={isExtractingPage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleExtractPage}
            disabled={isExtractingPage}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isExtractingPage ? (
              <>
                <RefreshCw size={16} className="animate-spin" />
                <span>Extracting...</span>
              </>
            ) : (
              <>
                <RefreshCw size={16} />
                <span>Extract Page</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};





