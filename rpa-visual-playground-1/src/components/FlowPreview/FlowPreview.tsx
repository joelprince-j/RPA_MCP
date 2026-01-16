import React from "react";
import { useFlowStore } from "../../store/flowStore";
import { X, Download, Code } from "lucide-react";

export const FlowPreview: React.FC = () => {
  const { isPreviewOpen, setPreviewOpen, exportFlow } = useFlowStore();

  if (!isPreviewOpen) return null;

  const flow = exportFlow();

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(flow, null, 2));
    alert("Flow JSON copied to clipboard!");
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex flex-col bg-white shadow-2xl w-96 slide-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <h3 className="flex items-center gap-2 font-bold text-gray-800">
          <Code size={20} />
          Flow Preview
        </h3>
        <button
          onClick={() => setPreviewOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
          title="Close Preview"
        >
          <X size={18} className="text-gray-600" />
        </button>
      </div>

      {/* Flow Info */}
      <div className="p-4 border-b bg-blue-50">
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Name:</span>
            <span className="ml-2 text-gray-600">
              {flow.name || "Untitled"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Actions:</span>
            <span className="ml-2 text-gray-600">
              {(flow.actions || flow.steps || []).length}
            </span>
          </div>
          {flow.auth?.enabled && (
            <div>
              <span className="font-semibold text-gray-700">Auth Steps:</span>
              <span className="ml-2 text-gray-600">
                {flow.auth.steps?.length || 0}
              </span>
            </div>
          )}
          <div>
            <span className="font-semibold text-gray-700">Start URL:</span>
            <div className="text-gray-600 truncate">
              {flow.startUrl || "Not set"}
            </div>
          </div>
        </div>
      </div>

      {/* JSON Preview */}
      <div className="flex-1 p-4 overflow-auto bg-gray-900">
        <pre className="font-mono text-xs text-green-400">
          {JSON.stringify(flow, null, 2)}
        </pre>
      </div>

      {/* Actions */}
      <div className="p-4 space-y-2 bg-white border-t">
        <button
          onClick={handleCopyJSON}
          className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Download size={16} />
          Copy JSON
        </button>
      </div>
    </div>
  );
};
