import React, { useState } from 'react';
import { Play, Code, Upload, Sparkles, ArrowRight, Zap } from 'lucide-react';

interface LandingPageProps {
  onSelectMode: (mode: 'playground' | 'codegen') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSelectMode }) => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-8">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Zap className="w-12 h-12 text-blue-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              RPA Flow Builder
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose how you want to build your automation flow
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Playground Mode */}
          <div
            className={`bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 border-4 ${
              hoveredCard === 'playground'
                ? 'border-blue-500 scale-105 shadow-2xl'
                : 'border-transparent hover:shadow-2xl'
            }`}
            onMouseEnter={() => setHoveredCard('playground')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectMode('playground')}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                <Play className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Playground Mode</h2>
                <p className="text-sm text-gray-500">Visual flow editor</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Import existing JSON flows or build from scratch using our visual editor. 
              Perfect for editing and refining automation flows.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Import JSON</p>
                  <p className="text-sm text-gray-500">Load existing flow definitions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Visual Editing</p>
                  <p className="text-sm text-gray-500">Drag, drop, and configure steps</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Export & Execute</p>
                  <p className="text-sm text-gray-500">Save and run your flows</p>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                hoveredCard === 'playground'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              }`}
            >
              <Upload size={20} />
              Start with Playground
              <ArrowRight size={20} />
            </button>
          </div>

          {/* Codegen Mode */}
          <div
            className={`bg-white rounded-2xl shadow-xl p-8 cursor-pointer transition-all duration-300 border-4 ${
              hoveredCard === 'codegen'
                ? 'border-purple-500 scale-105 shadow-2xl'
                : 'border-transparent hover:shadow-2xl'
            }`}
            onMouseEnter={() => setHoveredCard('codegen')}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => onSelectMode('codegen')}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                <Code className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Codegen Mode</h2>
                <p className="text-sm text-gray-500">Record & generate</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              Enter a URL and use Playwright Codegen to record your actions. 
              Automatically generates flow JSON that you can edit in the playground.
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Enter URL</p>
                  <p className="text-sm text-gray-500">Specify the website to automate</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Record Actions</p>
                  <p className="text-sm text-gray-500">Playwright captures your interactions</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600 text-sm font-bold">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Auto-Generate Flow</p>
                  <p className="text-sm text-gray-500">Opens in playground for editing</p>
                </div>
              </div>
            </div>

            <button
              className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                hoveredCard === 'codegen'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg'
                  : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
              }`}
            >
              <Sparkles size={20} />
              Start with Codegen
              <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Feature Comparison */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">
            Feature Comparison
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Playground Mode</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Import existing JSON flows</li>
                <li>✓ Visual drag-and-drop editor</li>
                <li>✓ Manual step configuration</li>
                <li>✓ Full control over flow</li>
                <li>✓ Best for editing existing flows</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-purple-600 mb-2">Codegen Mode</h4>
              <ul className="space-y-1 text-gray-600">
                <li>✓ Record actions automatically</li>
                <li>✓ No manual step creation</li>
                <li>✓ Playwright-powered recording</li>
                <li>✓ Fast flow generation</li>
                <li>✓ Best for creating new flows</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
