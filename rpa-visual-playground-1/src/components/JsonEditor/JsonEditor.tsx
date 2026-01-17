import { useState, useEffect } from 'react';
import { useFlowStore } from '../../store/flowStore';
import type { Flow } from '../../types/flow.types';
import { Download, Upload, X, AlertCircle, Check } from 'lucide-react';

export function JsonEditor() {
    const {
        isJsonEditorOpen,
        setJsonEditorOpen,
        exportFlow,
        importFlow,
        steps
    } = useFlowStore();

    const [jsonText, setJsonText] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Sync JSON text with current flow state
    useEffect(() => {
        if (isJsonEditorOpen) {
            const flow = exportFlow();
            setJsonText(JSON.stringify(flow, null, 2));
            setError(null);
        }
    }, [isJsonEditorOpen, steps, exportFlow]);

    const handleJsonChange = (value: string) => {
        setJsonText(value);
        setError(null);
        setSuccess(false);

        // Try to parse and update flow in real-time
        try {
            const parsed = JSON.parse(value);

            // Validate basic structure
            const hasSteps = parsed.steps && Array.isArray(parsed.steps);
            const hasActions = parsed.actions && Array.isArray(parsed.actions);
            
            if (!parsed.flowId || (!hasSteps && !hasActions)) {
                setError('Invalid flow structure');
                return;
            }

            // Update the flow store
            importFlow(parsed as Flow);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 2000);
        } catch (err) {
            // Don't show error while typing
            if (value.trim()) {
                setError('Invalid JSON syntax');
            }
        }
    };

    const handleImportFile = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const content = event.target?.result as string;
                    const parsed = JSON.parse(content);

                    const hasSteps = parsed.steps && Array.isArray(parsed.steps);
                    const hasActions = parsed.actions && Array.isArray(parsed.actions);
                    
                    if (!parsed.flowId || (!hasSteps && !hasActions)) {
                        setError('Invalid flow file structure');
                        return;
                    }

                    importFlow(parsed as Flow);
                    setJsonText(JSON.stringify(parsed, null, 2));
                    setError(null);
                    setSuccess(true);
                    setTimeout(() => setSuccess(false), 2000);
                } catch (err) {
                    setError('Failed to parse JSON file');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    };

    const handleExportFile = () => {
        try {
            const flow = exportFlow();
            const blob = new Blob([JSON.stringify(flow, null, 2)], {
                type: 'application/json'
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${flow.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            setError('Failed to export flow');
        }
    };

    if (!isJsonEditorOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="flex flex-col w-full max-w-4xl h-[80vh] bg-white rounded-lg shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">Flow JSON Editor</h2>
                        {success && (
                            <span className="flex items-center gap-1 text-sm text-green-600">
                                <Check className="w-4 h-4" />
                                Synced
                            </span>
                        )}
                        {error && (
                            <span className="flex items-center gap-1 text-sm text-red-600">
                                <AlertCircle className="w-4 h-4" />
                                {error}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleImportFile}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                            title="Import JSON file"
                        >
                            <Upload className="w-4 h-4" />
                            Import
                        </button>

                        <button
                            onClick={handleExportFile}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                            title="Export JSON file"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>

                        <button
                            onClick={() => setJsonEditorOpen(false)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
                            title="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* JSON Editor */}
                <div className="flex-1 p-4 overflow-hidden">
                    <textarea
                        value={jsonText}
                        onChange={(e) => handleJsonChange(e.target.value)}
                        className="w-full h-full p-4 font-mono text-sm border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        spellCheck={false}
                        placeholder="Paste your flow JSON here..."
                    />
                </div>

                {/* Footer */}
                <div className="p-4 text-sm text-gray-600 border-t bg-gray-50">
                    <p>💡 Edit the JSON directly - changes sync to the canvas in real-time</p>
                </div>
            </div>
        </div>
    );
}
