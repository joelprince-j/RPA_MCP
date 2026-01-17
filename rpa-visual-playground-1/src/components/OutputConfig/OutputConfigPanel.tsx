import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { Trash2, Mail, Database, HardDrive, Globe, MessageSquare, Send } from 'lucide-react';
import type { ReturnOutput } from '../../types/flow.types';

export const OutputConfigPanel: React.FC = () => {
    const { flow, setFlow } = useFlowStore();
    const [selectedOutputIndex, setSelectedOutputIndex] = useState<number | null>(null);

    const outputs = flow?.return?.outputs || [];
    const selectedOutput = selectedOutputIndex !== null ? outputs[selectedOutputIndex] : null;

    // Listen for output selection from canvas
    React.useEffect(() => {
        const handleSelect = (e: any) => {
            console.log('Output selected:', e.detail.outputIndex);
            setSelectedOutputIndex(e.detail.outputIndex);
        };
        window.addEventListener('selectOutput', handleSelect);
        return () => window.removeEventListener('selectOutput', handleSelect);
    }, []);

    const addOutput = (type: 's3' | 'local' | 'database' | 'email' | 'slack' | 'outlook') => {
        const newOutput: ReturnOutput = {
            type: type as any,
            enabled: true,
            format: 'json',
        };

        const updatedOutputs = [...outputs, newOutput];
        
        // Ensure flow exists
        const currentFlow = flow || {
            flowId: `flow_${Date.now()}`,
            name: 'Untitled Flow',
            description: '',
            startUrl: '',
            actions: [],
        };
        
        setFlow({
            ...currentFlow,
            return: {
                format: currentFlow.return?.format || 'json',
                fields: currentFlow.return?.fields || [],
                outputs: updatedOutputs,
            },
        });
        setSelectedOutputIndex(updatedOutputs.length - 1);
    };

    const updateOutput = (index: number, updates: Partial<ReturnOutput>) => {
        const updatedOutputs = outputs.map((output, i) =>
            i === index ? { ...output, ...updates } : output
        );
        setFlow({
            ...flow!,
            return: {
                ...flow?.return!,
                outputs: updatedOutputs,
            },
        });
    };

    const deleteOutput = (index: number) => {
        const updatedOutputs = outputs.filter((_, i) => i !== index);
        setFlow({
            ...flow!,
            return: {
                ...flow?.return!,
                outputs: updatedOutputs,
            },
        });
        setSelectedOutputIndex(null);
    };

    const getOutputIcon = (type: string) => {
        switch (type) {
            case 's3':
                return <Database size={16} className="text-orange-400" />;
            case 'database':
                return <Database size={16} className="text-purple-400" />;
            case 'local':
                return <HardDrive size={16} className="text-green-400" />;
            case 'email':
                return <Mail size={16} className="text-blue-400" />;
            case 'slack':
                return <MessageSquare size={16} className="text-pink-400" />;
            case 'outlook':
                return <Send size={16} className="text-cyan-400" />;
            default:
                return <Globe size={16} className="text-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#1a1d29]">
            {/* Header */}
            <div className="p-4 border-b border-gray-800/50">
                <h3 className="text-sm font-semibold text-gray-200">Output Configuration</h3>
                <p className="text-xs text-gray-400 mt-0.5">Configure where to send results</p>
            </div>

            {/* Output List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {outputs.map((output, index) => (
                    <div
                        key={index}
                        onClick={() => setSelectedOutputIndex(index)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedOutputIndex === index
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700/50 bg-gray-800/30 hover:border-gray-600'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                {getOutputIcon(output.type)}
                                <span className="text-sm font-medium text-gray-200 capitalize">
                                    {output.type}
                                </span>
                                {!output.enabled && (
                                    <span className="text-xs px-2 py-0.5 bg-gray-700 text-gray-400 rounded">
                                        Disabled
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    deleteOutput(index);
                                }}
                                className="p-1 hover:bg-red-500/20 rounded transition-colors"
                            >
                                <Trash2 size={14} className="text-red-400" />
                            </button>
                        </div>
                        {output.bucket && (
                            <p className="text-xs text-gray-400 mt-1 truncate">{output.bucket}</p>
                        )}
                    </div>
                ))}

                {/* Add Output Buttons */}
                <div className="pt-4 space-y-2">
                    <p className="text-xs font-medium text-gray-400 mb-2">Add Output</p>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => addOutput('s3')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-orange-500/50 hover:bg-orange-500/10 transition-all"
                        >
                            <Database size={16} className="text-orange-400" />
                            S3
                        </button>
                        <button
                            onClick={() => addOutput('email')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-blue-500/50 hover:bg-blue-500/10 transition-all"
                        >
                            <Mail size={16} className="text-blue-400" />
                            Email
                        </button>
                        <button
                            onClick={() => addOutput('slack')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-pink-500/50 hover:bg-pink-500/10 transition-all"
                        >
                            <MessageSquare size={16} className="text-pink-400" />
                            Slack
                        </button>
                        <button
                            onClick={() => addOutput('outlook')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-cyan-500/50 hover:bg-cyan-500/10 transition-all"
                        >
                            <Send size={16} className="text-cyan-400" />
                            Outlook
                        </button>
                        <button
                            onClick={() => addOutput('database')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-purple-500/50 hover:bg-purple-500/10 transition-all"
                        >
                            <Database size={16} className="text-purple-400" />
                            Database
                        </button>
                        <button
                            onClick={() => addOutput('local')}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-lg hover:border-green-500/50 hover:bg-green-500/10 transition-all"
                        >
                            <HardDrive size={16} className="text-green-400" />
                            Local
                        </button>
                    </div>
                </div>
            </div>

            {/* Output Details Form */}
            {selectedOutput && (
                <div className="border-t border-gray-800/50 p-4 space-y-3 overflow-y-auto max-h-96">
                    <h4 className="text-sm font-semibold text-gray-200">
                        {selectedOutput.type.toUpperCase()} Configuration
                    </h4>

                    {/* Enabled Toggle */}
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-medium text-gray-400">Enabled</label>
                        <input
                            type="checkbox"
                            checked={selectedOutput.enabled}
                            onChange={(e) =>
                                updateOutput(selectedOutputIndex!, { enabled: e.target.checked })
                            }
                            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        />
                    </div>

                    {/* S3 Configuration */}
                    {selectedOutput.type === 's3' && (
                        <>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Bucket Name</label>
                                <input
                                    type="text"
                                    value={selectedOutput.bucket || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { bucket: e.target.value })
                                    }
                                    placeholder="my-bucket-name"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Region</label>
                                <input
                                    type="text"
                                    value={selectedOutput.region || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { region: e.target.value })
                                    }
                                    placeholder="us-east-1"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Path</label>
                                <input
                                    type="text"
                                    value={selectedOutput.path || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { path: e.target.value })
                                    }
                                    placeholder="data/${'{'}date{'}'}/results.json"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-gray-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Local Configuration */}
                    {selectedOutput.type === 'local' && (
                        <div>
                            <label className="block mb-1 text-xs font-medium text-gray-400">File Path</label>
                            <input
                                type="text"
                                value={selectedOutput.path || ''}
                                onChange={(e) =>
                                    updateOutput(selectedOutputIndex!, { path: e.target.value })
                                }
                                placeholder="./output/results.json"
                                className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-500"
                            />
                        </div>
                    )}

                    {/* Email Configuration */}
                    {selectedOutput.type === 'email' && (
                        <>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">To Email</label>
                                <input
                                    type="email"
                                    value={(selectedOutput as any).to || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { to: e.target.value } as any)
                                    }
                                    placeholder="user@example.com"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Subject</label>
                                <input
                                    type="text"
                                    value={(selectedOutput as any).subject || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { subject: e.target.value } as any)
                                    }
                                    placeholder="Flow Results"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Slack Configuration */}
                    {selectedOutput.type === 'slack' && (
                        <>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Webhook URL</label>
                                <input
                                    type="text"
                                    value={(selectedOutput as any).webhookUrl || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { webhookUrl: e.target.value } as any)
                                    }
                                    placeholder="${SLACK_WEBHOOK_URL}"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Channel</label>
                                <input
                                    type="text"
                                    value={(selectedOutput as any).channel || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { channel: e.target.value } as any)
                                    }
                                    placeholder="#general"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 placeholder-gray-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Outlook Configuration */}
                    {selectedOutput.type === 'outlook' && (
                        <>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">To Email</label>
                                <input
                                    type="email"
                                    value={(selectedOutput as any).to || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { to: e.target.value } as any)
                                    }
                                    placeholder="user@company.com"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block mb-1 text-xs font-medium text-gray-400">Subject</label>
                                <input
                                    type="text"
                                    value={(selectedOutput as any).subject || ''}
                                    onChange={(e) =>
                                        updateOutput(selectedOutputIndex!, { subject: e.target.value } as any)
                                    }
                                    placeholder="Flow Results"
                                    className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-500"
                                />
                            </div>
                        </>
                    )}

                    {/* Format Selection */}
                    <div>
                        <label className="block mb-1 text-xs font-medium text-gray-400">Format</label>
                        <select
                            value={selectedOutput.format || 'json'}
                            onChange={(e) =>
                                updateOutput(selectedOutputIndex!, { format: e.target.value as any })
                            }
                            className="w-full px-3 py-2 text-sm text-white bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="json">JSON</option>
                            <option value="csv">CSV</option>
                            <option value="xml">XML</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
};
