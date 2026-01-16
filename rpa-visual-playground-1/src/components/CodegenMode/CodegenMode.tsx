import React, { useState, useRef, useEffect } from 'react';
import { Play, Loader2, CheckCircle, AlertCircle, ArrowLeft, Square, Eye } from 'lucide-react';
import type { Flow } from '../../types/flow.types';

interface CodegenModeProps {
  onFlowGenerated: (flow: Flow) => void;
  onBack: () => void;
}

interface RecordedAction {
  type: 'click' | 'input' | 'navigate';
  selector?: string;
  xpath?: string;
  text?: string;
  value?: string;
  url?: string;
  elementId?: string;
  description?: string;
}

export const CodegenMode: React.FC<CodegenModeProps> = ({ onFlowGenerated, onBack }) => {
  const [url, setUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recordedActions, setRecordedActions] = useState<RecordedAction[]>([]);
  const [status, setStatus] = useState<'idle' | 'recording' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [iframeError, setIframeError] = useState(false);
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Check backend connection on mount
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const response = await fetch('http://localhost:3001/health');
        if (response.ok) {
          setBackendConnected(true);
        } else {
          setBackendConnected(false);
        }
      } catch (err) {
        setBackendConnected(false);
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleStartRecording = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setIsRecording(true);
    setStatus('recording');
    setError(null);
    setRecordedActions([]);

    try {
      // Start recording session
      const response = await fetch('http://localhost:3001/api/codegen/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to start recording');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
      console.log('Recording started:', data);
    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      setStatus('error');
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;

    setStatus('processing');

    try {
      console.log('🛑 Stopping recording...');
      console.log(`📊 Total actions recorded: ${recordedActions.length}`);
      
      // Stop recording and generate flow
      const response = await fetch('http://localhost:3001/api/codegen/stop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to stop recording');
      }

      const data = await response.json();
      console.log('✅ Flow generated successfully!');
      console.log('📋 Flow details:', {
        flowId: data.flow.flowId,
        name: data.flow.name,
        steps: data.flow.steps.length,
        startUrl: data.flow.startUrl,
      });
      console.log('🔍 Flow steps:', data.flow.steps);
      
      setStatus('success');
      
      // Wait a moment then transition to playground
      setTimeout(() => {
        console.log('🎮 Transitioning to Playground mode...');
        onFlowGenerated(data.flow);
      }, 1500);
    } catch (err: any) {
      console.error('❌ Failed to generate flow:', err);
      setError(err.message || 'Failed to generate flow');
      setStatus('error');
    } finally {
      setIsRecording(false);
    }
  };

  const recordAction = async (action: RecordedAction) => {
    if (!sessionId || !isRecording) return;

    try {
      await fetch('http://localhost:3001/api/codegen/action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, action }),
      });

      setRecordedActions(prev => [...prev, action]);
    } catch (err) {
      console.error('Failed to record action:', err);
    }
  };

  // Setup iframe event listeners
  useEffect(() => {
    if (!isRecording || !iframeRef.current) return;

    const iframe = iframeRef.current;
    
    // Check if iframe can be accessed (detect X-Frame-Options)
    const checkIframeAccess = setTimeout(() => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          setIframeError(true);
          setError('⚠️ This website blocks iframe embedding (X-Frame-Options). Try https://example.com instead.');
          console.error('Cannot access iframe - likely blocked by X-Frame-Options');
        } else {
          console.log('✅ iframe accessible, setting up event listeners');
        }
      } catch (err) {
        setIframeError(true);
        setError('⚠️ Cannot access iframe content due to CORS policy. Try a different website.');
        console.error('iframe access error:', err);
      }
    }, 2000);
    
    const handleIframeLoad = () => {
      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          console.error('Cannot access iframe document');
          return;
        }

        console.log('✅ iframe loaded successfully');
        setIframeError(false);

        // Record clicks
        iframeDoc.addEventListener('click', (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          const selector = getSelector(target);
          const xpath = getXPath(target);
          
          console.log('Click recorded:', { selector, xpath, tag: target.tagName });
          
          // Get meaningful text
          let text = target.textContent?.trim() || '';
          if (text.length > 50) {
            text = text.substring(0, 50) + '...';
          }
          
          // Build description
          let description = 'Click ';
          if (target.id) {
            description += `#${target.id}`;
          } else if (text) {
            description += `"${text}"`;
          } else if (target.className) {
            description += `.${target.className.split(' ')[0]}`;
          } else {
            description += target.tagName.toLowerCase();
          }
          
          recordAction({
            type: 'click',
            selector,
            xpath,
            text,
            elementId: target.id || undefined,
            description,
          });
        }, true);

        // Record inputs with debouncing
        let inputTimeout: ReturnType<typeof setTimeout>;
        iframeDoc.addEventListener('input', (e: Event) => {
          const target = e.target as HTMLInputElement;
          
          // Debounce input events (wait 500ms after user stops typing)
          clearTimeout(inputTimeout);
          inputTimeout = setTimeout(() => {
            const selector = getSelector(target);
            const xpath = getXPath(target);
            
            console.log('Input recorded:', { selector, value: target.value });
            
            // Build description
            let description = 'Type ';
            if (target.placeholder) {
              description += `into "${target.placeholder}"`;
            } else if (target.id) {
              description += `into #${target.id}`;
            } else if (target.name) {
              description += `into ${target.name}`;
            } else {
              description += `into ${target.tagName.toLowerCase()}`;
            }
            
            recordAction({
              type: 'input',
              selector,
              xpath,
              value: target.value,
              elementId: target.id || undefined,
              description,
            });
          }, 500);
        }, true);
      } catch (err) {
        console.error('Cannot access iframe content (CORS):', err);
        setIframeError(true);
        setError('⚠️ Cannot capture events from this website due to security restrictions.');
      }
    };

    iframe.addEventListener('load', handleIframeLoad);
    iframe.addEventListener('error', () => {
      setIframeError(true);
      setError('❌ Failed to load website in iframe');
    });

    return () => {
      clearTimeout(checkIframeAccess);
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, [isRecording, sessionId]);

  // Helper to get CSS selector
  const getSelector = (element: HTMLElement): string => {
    // Priority 1: ID (most specific)
    if (element.id) {
      return `#${element.id}`;
    }
    
    // Priority 2: data-testid or data-test
    if (element.hasAttribute('data-testid')) {
      return `[data-testid="${element.getAttribute('data-testid')}"]`;
    }
    if (element.hasAttribute('data-test')) {
      return `[data-test="${element.getAttribute('data-test')}"]`;
    }
    
    // Priority 3: name attribute (for inputs)
    if (element.hasAttribute('name')) {
      const name = element.getAttribute('name');
      return `${element.tagName.toLowerCase()}[name="${name}"]`;
    }
    
    // Priority 4: Class names (filter out common utility classes)
    if (element.className && typeof element.className === 'string') {
      const classes = element.className
        .split(' ')
        .filter(c => c && !c.match(/^(hover|focus|active|disabled|selected|btn-|text-|bg-|p-|m-|w-|h-)/))
        .slice(0, 2); // Take first 2 meaningful classes
      
      if (classes.length > 0) {
        return `${element.tagName.toLowerCase()}.${classes.join('.')}`;
      }
    }
    
    // Priority 5: Tag with position among siblings
    const parent = element.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        child => child.tagName === element.tagName
      );
      const index = siblings.indexOf(element);
      
      if (siblings.length > 1) {
        return `${element.tagName.toLowerCase()}:nth-of-type(${index + 1})`;
      }
    }
    
    // Fallback: Just the tag name
    return element.tagName.toLowerCase();
  };

  // Helper to get XPath
  const getXPath = (element: HTMLElement): string => {
    if (element.id) return `//*[@id="${element.id}"]`;
    
    const parts: string[] = [];
    let current: HTMLElement | null = element;
    
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = current.previousSibling;
      
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === current.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }
      
      const tagName = current.nodeName.toLowerCase();
      const pathIndex = index > 0 ? `[${index + 1}]` : '';
      parts.unshift(`${tagName}${pathIndex}`);
      
      current = current.parentElement;
    }
    
    return '/' + parts.join('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to mode selection
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-8rem)]">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 flex flex-col">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full mb-3">
                <Play className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-1">
                Record Actions
              </h1>
              <p className="text-sm text-gray-600">
                Interact with the website to record your flow
              </p>
            </div>

            {/* Backend Connection Status */}
            {backendConnected === false && (
              <div className="mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">
                      ⚠️ Backend Server Not Running
                    </p>
                    <p className="text-xs text-red-700 mb-2">
                      The recording server is not available. Please start it:
                    </p>
                    <code className="block text-xs bg-red-100 p-2 rounded text-red-900 font-mono">
                      cd backend<br/>
                      node WORKING-SERVER.js
                    </code>
                    <p className="text-xs text-red-600 mt-2">
                      See <strong>RUN_EVERYTHING.md</strong> for detailed instructions
                    </p>
                  </div>
                </div>
              </div>
            )}
            {backendConnected === true && (
              <div className="mb-4 p-2 bg-green-50 border border-green-300 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-800">
                  Backend connected
                </span>
              </div>
            )}

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                disabled={isRecording}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              />
            </div>

            {/* Control Buttons */}
            <div className="space-y-2 mb-6">
              {!isRecording ? (
                <button
                  onClick={handleStartRecording}
                  disabled={!url || backendConnected === false}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-purple-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  title={backendConnected === false ? 'Backend server not running' : ''}
                >
                  <Play className="w-5 h-5" />
                  Start Recording
                </button>
              ) : (
                <button
                  onClick={handleStopRecording}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center gap-2"
                >
                  <Square className="w-5 h-5" />
                  Stop & Generate Flow
                </button>
              )}
            </div>

            {/* Status */}
            {status !== 'idle' && (
              <div className={`p-3 rounded-lg mb-4 ${
                status === 'recording' ? 'bg-blue-50 border-2 border-blue-200' :
                status === 'processing' ? 'bg-yellow-50 border-2 border-yellow-200' :
                status === 'success' ? 'bg-green-50 border-2 border-green-200' :
                'bg-red-50 border-2 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {status === 'recording' && (
                    <>
                      <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
                      <span className="text-sm font-semibold text-blue-800">Recording...</span>
                    </>
                  )}
                  {status === 'processing' && (
                    <>
                      <Loader2 className="w-4 h-4 text-yellow-600 animate-spin" />
                      <span className="text-sm font-semibold text-yellow-800">Generating flow...</span>
                    </>
                  )}
                  {status === 'success' && (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-semibold text-green-800">Success!</span>
                    </>
                  )}
                  {status === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-semibold text-red-800">{error}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Recorded Actions */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Eye size={16} />
                Recorded Actions ({recordedActions.length})
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
                {recordedActions.length === 0 ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    No actions recorded yet
                  </p>
                ) : (
                  recordedActions.map((action, index) => (
                    <div
                      key={index}
                      className="bg-white p-2 rounded border border-gray-200 text-xs"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-purple-600">
                          {index + 1}.
                        </span>
                        <span className="font-medium text-gray-800">
                          {action.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-gray-600 truncate">
                        {action.description}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-purple-50 rounded-lg text-xs text-gray-600">
              <p className="font-semibold text-purple-800 mb-1">💡 Tips:</p>
              <ul className="space-y-1">
                <li>• Click elements to record clicks</li>
                <li>• Type in inputs to record text</li>
                <li>• Actions appear in real-time</li>
                <li>• Click "Stop" when done</li>
              </ul>
              <p className="mt-2 text-xs text-purple-600">
                ⚠️ Note: Some websites block iframe embedding. Try https://example.com if you encounter issues.
              </p>
            </div>

            {/* iframe Error Warning */}
            {iframeError && (
              <div className="mt-4 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <p className="text-sm font-semibold text-yellow-800 mb-1">
                  ⚠️ iframe Limitation
                </p>
                <p className="text-xs text-yellow-700">
                  This website blocks iframe embedding. Try:
                </p>
                <ul className="text-xs text-yellow-700 mt-1 ml-4">
                  <li>• https://example.com</li>
                  <li>• https://httpbin.org/forms/post</li>
                  <li>• Or use Playground mode instead</li>
                </ul>
              </div>
            )}
          </div>

          {/* Right Panel - iframe */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg overflow-hidden">
            {isRecording && url ? (
              <iframe
                ref={iframeRef}
                src={url}
                className="w-full h-full border-0"
                title="Recording Frame"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <div className="text-center p-8">
                  <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-10 h-10 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Ready to Record
                  </h3>
                  <p className="text-gray-600 max-w-md">
                    Enter a URL and click "Start Recording" to begin capturing your actions
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
