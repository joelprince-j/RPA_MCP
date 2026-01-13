import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, CircleDot, Upload } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      <div className="max-w-4xl w-full px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            RPA Flow Builder
          </h1>
          <p className="text-xl text-gray-300">
            Build automation flows visually or record them automatically
          </p>
        </div>

        {/* Mode Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Visual Playground Option */}
          <div
            onClick={() => navigate('/playground')}
            className="group relative bg-white rounded-xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6 group-hover:bg-blue-200 transition-colors">
              <Play size={32} className="text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Visual Playground
            </h2>
            <p className="text-gray-600 mb-6">
              Build flows step-by-step using our visual flow builder. Map pages, 
              drag elements, and configure actions manually.
            </p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Map website elements
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Drag & drop to build flow
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Full control over each step
              </li>
            </ul>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Open Playground
            </button>
          </div>

          {/* Auto-Recorder Option */}
          <div
            onClick={() => navigate('/recorder')}
            className="group relative bg-white rounded-xl shadow-2xl p-8 cursor-pointer transform transition-all hover:scale-105 hover:shadow-3xl"
          >
            <div className="flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6 group-hover:bg-green-200 transition-colors">
              <CircleDot size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              Auto-Recorder
            </h2>
            <p className="text-gray-600 mb-6">
              Record your actions automatically. Interact with the website and 
              we'll generate a flow JSON that you can edit in the playground.
            </p>
            <ul className="text-sm text-gray-500 space-y-2 mb-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Automatic action recording
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Generate flow JSON instantly
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                Edit in playground after
              </li>
            </ul>
            <button className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
              Start Recording
            </button>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white rounded-xl shadow-xl p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Other Options</h3>
          <div className="flex gap-4">
            <button
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = (e: any) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const flow = JSON.parse(event.target?.result as string);
                        navigate('/playground', { state: { importedFlow: flow } });
                      } catch (error) {
                        alert('Invalid JSON file');
                      }
                    };
                    reader.readAsText(file);
                  }
                };
                input.click();
              }}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Upload size={18} />
              Import JSON Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

