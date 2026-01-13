import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFlowStore } from "../../store/flowStore";
import { recorderApi } from "../../services/api";
import {
  CircleDot,
  Square,
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export const AutoRecorder: React.FC = () => {
  const navigate = useNavigate();
  const { setFlow } = useFlowStore();
  const [url, setUrl] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [actionsCount, setActionsCount] = useState(0);
  const [currentUrl, setCurrentUrl] = useState("");
  const [status, setStatus] = useState<
    "idle" | "recording" | "stopping" | "success" | "error"
  >("idle");
  const statusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Poll for recording status while recording
    if (isRecording && sessionId) {
      statusIntervalRef.current = setInterval(async () => {
        try {
          const status = await recorderApi.getRecordingStatus(sessionId);
          setActionsCount(status.actionsCount);
          setCurrentUrl(status.currentUrl);
        } catch (error) {
          console.error("Error getting recording status:", error);
        }
      }, 2000); // Poll every 2 seconds
    }

    return () => {
      if (statusIntervalRef.current) {
        clearInterval(statusIntervalRef.current);
      }
    };
  }, [isRecording, sessionId]);

  const handleStartRecording = async () => {
    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    try {
      setStatus("recording");
      setIsRecording(true);
      const result = await recorderApi.startRecording(url.trim());
      console.log("Result:", result);
      setSessionId(result.sessionId);
      setCurrentUrl(url.trim());
      alert(
        "Recording started! A browser window has opened. Interact with the website to record actions."
      );
    } catch (error: any) {
      console.error("Error starting recording:", error);
      setStatus("error");
      alert(
        "Failed to start recording: " +
          (error.response?.data?.error || error.message)
      );
      setIsRecording(false);
    }
  };

  const handleStopRecording = async () => {
    if (!sessionId) return;

    try {
      setStatus("stopping");
      const result = await recorderApi.stopRecording(sessionId);
      console.log("Recording Result:", result);

      if (result.success && result.flow) {
        setStatus("success");
        setFlow(result.flow);

        // Navigate to playground with the recorded flow
        setTimeout(() => {
          navigate("/playground");
        }, 1500);
      }
    } catch (error: any) {
      console.error("Error stopping recording:", error);
      setStatus("error");
      alert(
        "Failed to stop recording: " +
          (error.response?.data?.error || error.message)
      );
      setIsRecording(false);
    }
  };

  const handleCancelRecording = async () => {
    if (!sessionId) return;

    try {
      await recorderApi.cancelRecording(sessionId);
      setIsRecording(false);
      setSessionId(null);
      setActionsCount(0);
      setCurrentUrl("");
      setStatus("idle");
    } catch (error: any) {
      console.error("Error cancelling recording:", error);
      alert(
        "Failed to cancel recording: " +
          (error.response?.data?.error || error.message)
      );
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="p-2 hover:bg-gray-100 rounded transition-colors"
              title="Back to home"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Auto-Recorder</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          {/* Status Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
            {status === "idle" && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                    <CircleDot size={40} className="text-gray-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Start Recording
                  </h2>
                  <p className="text-gray-600">
                    Enter a website URL and start recording your interactions
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isRecording}
                    />
                  </div>

                  <button
                    onClick={handleStartRecording}
                    disabled={!url.trim() || isRecording}
                    className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <CircleDot size={20} />
                    Start Recording
                  </button>
                </div>
              </>
            )}

            {status === "recording" && (
              <>
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4 animate-pulse">
                    <CircleDot size={40} className="text-red-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Recording...
                  </h2>
                  <p className="text-gray-600">
                    Interact with the browser window to record actions
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Actions Recorded:</span>
                        <span className="ml-2 font-bold text-gray-800">
                          {actionsCount}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Current URL:</span>
                        <div
                          className="mt-1 font-mono text-xs text-gray-700 truncate"
                          title={currentUrl}
                        >
                          {currentUrl || "Loading..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleStopRecording}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Square size={18} />
                    Stop & Generate Flow
                  </button>
                  <button
                    onClick={handleCancelRecording}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {status === "stopping" && (
              <div className="text-center py-8">
                <Loader2
                  size={48}
                  className="mx-auto text-blue-600 animate-spin mb-4"
                />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Generating Flow...
                </h2>
                <p className="text-gray-600">
                  Converting recorded actions to flow JSON
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="text-center py-8">
                <CheckCircle
                  size={48}
                  className="mx-auto text-green-600 mb-4"
                />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Flow Generated Successfully!
                </h2>
                <p className="text-gray-600">Redirecting to playground...</p>
              </div>
            )}

            {status === "error" && (
              <div className="text-center py-8">
                <XCircle size={48} className="mx-auto text-red-600 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  Recording Failed
                </h2>
                <p className="text-gray-600 mb-4">
                  An error occurred during recording
                </p>
                <button
                  onClick={() => {
                    setStatus("idle");
                    setIsRecording(false);
                    setSessionId(null);
                    setActionsCount(0);
                    setCurrentUrl("");
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          {status === "recording" && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                Recording Tips:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click buttons, links, and interactive elements</li>
                <li>• Fill in form fields (text inputs, selects)</li>
                <li>• Navigate between pages</li>
                <li>• All actions will be recorded automatically</li>
                <li>• Click "Stop & Generate Flow" when done</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
