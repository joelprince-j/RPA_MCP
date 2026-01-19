// import React, { useCallback, useEffect } from 'react';
// import ReactFlow, {
//   Node,
//   Edge,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   Connection,
//   BackgroundVariant,
//   MiniMap,
// } from 'reactflow';
// import 'reactflow/dist/style.css';
// import { useFlowStore } from '../../store/flowStore';
// import { StepNode } from './StepNode';
// import { Plus, Trash2 } from 'lucide-react';

// const nodeTypes = {
//   step: StepNode,
// };

// export const FlowBuilder: React.FC = () => {
//   const { steps, addStep, setSelectedStepId, removeStep, selectedStepId } = useFlowStore();

//   // Convert steps to React Flow nodes
//   const createNodes = (): Node[] => {
//     return steps.map((step, index) => ({
//       id: `step-${step.stepId}`,
//       type: 'step',
//       position: { x: 250, y: index * 150 + 50 },
//       data: { step },
//       selected: selectedStepId === step.stepId,
//     }));
//   };

//   // Create edges between sequential steps
//   const createEdges = (): Edge[] => {
//     return steps.slice(0, -1).map((step, index) => ({
//       id: `edge-${step.stepId}`,
//       source: `step-${step.stepId}`,
//       target: `step-${steps[index + 1].stepId}`,
//       animated: true,
//       style: { stroke: '#3b82f6', strokeWidth: 2 },
//     }));
//   };

//   const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
//   const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

//   // Update nodes when steps change
//   useEffect(() => {
//     setNodes(createNodes());
//     setEdges(createEdges());
//   }, [steps, selectedStepId]);

//   const onConnect = useCallback(
//     (params: Connection) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges]
//   );

//   const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
//     const stepId = parseInt(node.id.replace('step-', ''));
//     setSelectedStepId(stepId);
//   };

//   const handleAddStep = () => {
//     addStep();
//   };

//   const handleDeleteSelected = () => {
//     if (selectedStepId !== null) {
//       if (confirm('Are you sure you want to delete this step?')) {
//         removeStep(selectedStepId);
//       }
//     }
//   };

//   return (
//     <div className="flex flex-col h-full bg-gray-50">
//       {/* Toolbar */}
//       <div className="flex items-center justify-between p-3 bg-white border-b shadow-sm">
//         <h2 className="text-lg font-semibold text-gray-700">Flow Canvas</h2>

//         <div className="flex gap-2">
//           <button
//             onClick={handleAddStep}
//             className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
//           >
//             <Plus size={16} />
//             Add Step
//           </button>

//           {selectedStepId !== null && (
//             <button
//               onClick={handleDeleteSelected}
//               className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm"
//             >
//               <Trash2 size={16} />
//               Delete
//             </button>
//           )}
//         </div>
//       </div>

//       {/* React Flow Canvas */}
//       <div className="flex-1">
//         {steps.length === 0 ? (
//           <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
//             <div className="p-8 text-center">
//               <div className="mb-4 text-gray-300">
//                 <Plus size={64} className="mx-auto" strokeWidth={1.5} />
//               </div>
//               <h3 className="mb-2 text-2xl font-bold text-gray-700">
//                 No Steps Yet
//               </h3>
//               <p className="max-w-md mb-6 text-gray-500">
//                 Click "Add Step" to start building your automation flow. 
//                 You can also drag and drop elements from the site map.
//               </p>
//               <button
//                 onClick={handleAddStep}
//                 className="px-6 py-3 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
//               >
//                 Add First Step
//               </button>
//             </div>
//           </div>
//         ) : (
//           <ReactFlow
//             nodes={nodes}
//             edges={edges}
//             onNodesChange={onNodesChange}
//             onEdgesChange={onEdgesChange}
//             onConnect={onConnect}
//             onNodeClick={handleNodeClick}
//             nodeTypes={nodeTypes}
//             fitView
//             minZoom={0.5}
//             maxZoom={2}
//             defaultEdgeOptions={{
//               animated: true,
//             }}
//           >
//             <Controls />
//             <MiniMap
//               nodeColor={(node) => {
//                 if (node.selected) return '#3b82f6';
//                 return '#9ca3af';
//               }}
//               maskColor="rgba(0, 0, 0, 0.05)"
//               className="bg-white border border-gray-200 rounded-lg shadow-sm"
//             />
//             <Background 
//               variant={BackgroundVariant.Dots} 
//               gap={20} 
//               size={1}
//               color="#e5e7eb"
//             />
//           </ReactFlow>
//         )}
//       </div>
//     </div>
//   );
// };


import React, { useCallback, useEffect, useState } from 'react';
// import {
//   ReactFlow,
//   Node,
//   Edge,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   Connection,
//   BackgroundVariant,
//   MiniMap,
// } from '@xyflow/react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MiniMap,
} from '@xyflow/react';
import type { Node, Edge, Connection } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowStore } from '../../store/flowStore';
import { StepNode } from './StepNode';
import { NodeContextMenu } from '../ContextMenu/NodeContextMenu';
import { Plus, Trash2, Replace } from 'lucide-react';
import { flowApi } from '../../services/api';

const nodeTypes = {
  step: StepNode,
};

export const FlowBuilder: React.FC = () => {
  const {
    steps,
    authSteps,
    flow,
    addStep,
    setSelectedStepId,
    removeStep,
    removeAuthStep,
    selectedStepId,
    selectedStepIsAuth,
    duplicateStep,
    insertStepBefore,
    insertStepAfter,
    swapModeStepId,
    setSwapModeStepId,
    swapSteps,
    undo,
    redo,
    canUndo,
    canRedo,
    exportFlow,
  } = useFlowStore();

  // Store node positions to preserve them across updates
  const nodePositionsRef = React.useRef<Record<string, { x: number; y: number }>>({});
  const isInitialMount = React.useRef(true);

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    stepId: number;
  } | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Z or Cmd+Z for undo
      if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        if (canUndo()) {
          undo();
        }
      }
      // Ctrl+Y or Cmd+Shift+Z for redo
      if (
        ((event.ctrlKey || event.metaKey) && event.key === 'y') ||
        ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z')
      ) {
        event.preventDefault();
        if (canRedo()) {
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, canUndo, canRedo]);

  // Helper function to check if two nodes overlap
  const checkNodeCollision = (pos1: { x: number; y: number }, pos2: { x: number; y: number }, nodeWidth = 300, nodeHeight = 120): boolean => {
    const padding = 40; // Minimum spacing between nodes (increased from 20 to 40)
    return (
      pos1.x < pos2.x + nodeWidth + padding &&
      pos1.x + nodeWidth + padding > pos2.x &&
      pos1.y < pos2.y + nodeHeight + padding &&
      pos1.y + nodeHeight + padding > pos2.y
    );
  };

  // Helper function to find a non-colliding position
  const findNonCollidingPosition = (
    desiredPos: { x: number; y: number },
    existingNodes: Node[],
    nodeWidth = 300,
    nodeHeight = 120
  ): { x: number; y: number } => {
    let position = { ...desiredPos };
    let attempts = 0;
    const maxAttempts = 50;
    const stepSize = 50;

    while (attempts < maxAttempts) {
      const hasCollision = existingNodes.some((node) => {
        if (!node.position) return false;
        return checkNodeCollision(position, node.position, nodeWidth, nodeHeight);
      });

      if (!hasCollision) {
        return position;
      }

      // Try different positions in a spiral pattern
      const angle = (attempts * 0.5) % (Math.PI * 2);
      const radius = Math.floor(attempts / 8) * stepSize;
      position = {
        x: desiredPos.x + Math.cos(angle) * radius,
        y: desiredPos.y + Math.sin(angle) * radius,
      };

      attempts++;
    }

    // Fallback: place it far to the right
    return {
      x: Math.max(...existingNodes.map(n => n.position?.x || 0)) + nodeWidth + 50,
      y: desiredPos.y,
    };
  };

  // Update nodes when steps change, but preserve positions
  useEffect(() => {
    const newNodes: Node[] = [];
    const nodeWidth = 300;
    const nodeHeight = 120;
    const horizontalSpacing = 350;
    const verticalSpacing = 300; // Increased gap between rows from 250 to 300
    const itemsPerRow = 7;
    const startX = 50;
    const startY = 50;

    let currentIndex = 0;

    // Get outputs early for section header logic
    const outputs = flow?.return?.outputs || [];

    // Add "Auth" section header if there are auth steps
    if (authSteps.length > 0) {
      const nodeId = 'section-auth';
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: {
          x: startX + col * horizontalSpacing,
          y: startY + row * verticalSpacing
        },
        data: {
          step: {
            stepId: 0,
            action: 'section-header',
            actionType: 'section-header',
            params: {},
            description: 'AUTH',
          },
          isSectionHeader: true,
          sectionType: 'auth',
        },
        selected: false,
        draggable: false,
        selectable: false,
        connectable: true,
      });

      currentIndex++;
    }

    // Add auth steps in grid layout
    authSteps.forEach((step) => {
      const nodeId = `auth-${step.stepId}`;
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      const desiredPosition = nodePositionsRef.current[nodeId] || {
        x: startX + col * horizontalSpacing,
        y: startY + row * verticalSpacing
      };

      const finalPosition = findNonCollidingPosition(desiredPosition, newNodes, nodeWidth, nodeHeight);

      if (finalPosition.x !== desiredPosition.x || finalPosition.y !== desiredPosition.y) {
        nodePositionsRef.current[nodeId] = finalPosition;
      }

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: finalPosition,
        data: {
          step: { ...step, description: step.description },
          isSwapMode: false,
          isAuthStep: true,
        },
        selected: selectedStepId === step.stepId && selectedStepIsAuth,
        draggable: true,
        className: 'auth-step-node',
      });

      currentIndex++;
    });

    // Add "Action" section header if there are action steps
    if (steps.length > 0) {
      const nodeId = 'section-action';
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: {
          x: startX + col * horizontalSpacing,
          y: startY + row * verticalSpacing
        },
        data: {
          step: {
            stepId: 0,
            action: 'section-header',
            actionType: 'section-header',
            params: {},
            description: 'ACTIONS',
          },
          isSectionHeader: true,
          sectionType: 'action',
        },
        selected: false,
        draggable: false,
        selectable: false,
        connectable: true,
      });

      currentIndex++;
    }

    // Add regular action steps continuing in grid layout
    steps.forEach((step) => {
      const nodeId = `step-${step.stepId}`;
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      const desiredPosition = nodePositionsRef.current[nodeId] || {
        x: startX + col * horizontalSpacing,
        y: startY + row * verticalSpacing
      };

      const finalPosition = findNonCollidingPosition(desiredPosition, newNodes, nodeWidth, nodeHeight);

      if (finalPosition.x !== desiredPosition.x || finalPosition.y !== desiredPosition.y) {
        nodePositionsRef.current[nodeId] = finalPosition;
      }

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: finalPosition,
        data: {
          step,
          isSwapMode: swapModeStepId === step.stepId,
          isAuthStep: false,
        },
        selected: selectedStepId === step.stepId && !selectedStepIsAuth,
        draggable: true,
        className: swapModeStepId === step.stepId ? 'swap-mode-node' : '',
      });

      currentIndex++;
    });

    // Add "Output" section header if there are outputs
    if (outputs.length > 0) {
      const nodeId = 'section-output';
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: {
          x: startX + col * horizontalSpacing,
          y: startY + row * verticalSpacing
        },
        data: {
          step: {
            stepId: 0,
            action: 'section-header',
            actionType: 'section-header',
            params: {},
            description: 'OUTPUTS',
          },
          isSectionHeader: true,
          sectionType: 'output',
        },
        selected: false,
        draggable: false,
        selectable: false,
        connectable: true,
      });

      currentIndex++;
    }

    // Add output nodes after action steps
    outputs.forEach((output, index) => {
      const nodeId = `output-${index}`;
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      const desiredPosition = nodePositionsRef.current[nodeId] || {
        x: startX + col * horizontalSpacing,
        y: startY + row * verticalSpacing
      };

      const finalPosition = findNonCollidingPosition(desiredPosition, newNodes, nodeWidth, nodeHeight);

      if (finalPosition.x !== desiredPosition.x || finalPosition.y !== desiredPosition.y) {
        nodePositionsRef.current[nodeId] = finalPosition;
      }

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: finalPosition,
        data: {
          step: {
            stepId: index + 1,
            action: output.type,
            actionType: output.type,
            params: {
              bucket: output.bucket,
              region: output.region,
              path: output.path,
              ...output,
            },
            description: `Output to ${output.type.toUpperCase()}${output.bucket ? `: ${output.bucket}` : ''}`,
          },
          isSwapMode: false,
          isAuthStep: false,
          isOutputNode: true,
          outputIndex: index,
        },
        selected: false,
        draggable: true,
        className: 'output-node',
      });

      currentIndex++;
    });

    // Add "Add Output" button node
    if (steps.length > 0) {
      const nodeId = 'add-output-btn';
      const row = Math.floor(currentIndex / itemsPerRow);
      const col = currentIndex % itemsPerRow;

      const desiredPosition = nodePositionsRef.current[nodeId] || {
        x: startX + col * horizontalSpacing,
        y: startY + row * verticalSpacing
      };

      const finalPosition = findNonCollidingPosition(desiredPosition, newNodes, nodeWidth, nodeHeight);

      if (finalPosition.x !== desiredPosition.x || finalPosition.y !== desiredPosition.y) {
        nodePositionsRef.current[nodeId] = finalPosition;
      }

      newNodes.push({
        id: nodeId,
        type: 'step',
        position: finalPosition,
        data: {
          step: {
            stepId: 0,
            action: 'add-output',
            actionType: 'add-output',
            params: {},
            description: 'Click to add output',
          },
          isSwapMode: false,
          isAuthStep: false,
          isOutputNode: false,
          isAddOutputButton: true,
        },
        selected: false,
        draggable: false,
        className: 'add-output-btn-node',
      });
    }

    // Create edges - connect in sequence
    const newEdges: Edge[] = [];

    // Connect AUTH section header to first auth step
    if (authSteps.length > 0) {
      newEdges.push({
        id: 'section-auth-to-first',
        source: 'section-auth',
        target: `auth-${authSteps[0].stepId}`,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#f59e0b',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#f59e0b',
          width: 20,
          height: 20,
        },
      });
    }

    // Connect auth steps to each other
    authSteps.slice(0, -1).forEach((step, index) => {
      newEdges.push({
        id: `auth-edge-${step.stepId}`,
        source: `auth-${step.stepId}`,
        target: `auth-${authSteps[index + 1].stepId}`,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#f59e0b',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#f59e0b',
          width: 20,
          height: 20,
        },
      });
    });

    // Connect last auth step to ACTION section header (or first action if no header)
    if (authSteps.length > 0 && steps.length > 0) {
      newEdges.push({
        id: 'auth-to-action-section',
        source: `auth-${authSteps[authSteps.length - 1].stepId}`,
        target: 'section-action',
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#f59e0b', // Orange to match auth color
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#f59e0b',
          width: 20,
          height: 20,
        },
      });
    }

    // Connect ACTION section header to first action step
    if (steps.length > 0) {
      newEdges.push({
        id: 'section-action-to-first',
        source: 'section-action',
        target: `step-${steps[0].stepId}`,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#3b82f6',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
          width: 20,
          height: 20,
        },
      });
    }

    // Connect action steps to each other
    steps.slice(0, -1).forEach((step, index) => {
      newEdges.push({
        id: `action-edge-${step.stepId}`,
        source: `step-${step.stepId}`,
        target: `step-${steps[index + 1].stepId}`,
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#3b82f6',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#3b82f6',
          width: 20,
          height: 20,
        },
      });
    });

    // Connect last action step to OUTPUT section header (if outputs exist)
    if (steps.length > 0 && outputs.length > 0) {
      const lastStep = steps[steps.length - 1];
      newEdges.push({
        id: 'action-to-output-section',
        source: `step-${lastStep.stepId}`,
        target: 'section-output',
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#8b5cf6',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#8b5cf6',
          width: 20,
          height: 20,
        },
      });

      // Connect OUTPUT section header to first output
      newEdges.push({
        id: 'section-output-to-first',
        source: 'section-output',
        target: 'output-0',
        animated: true,
        type: 'smoothstep',
        style: {
          stroke: '#8b5cf6',
          strokeWidth: 3,
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#8b5cf6',
          width: 20,
          height: 20,
        },
      });

      // Connect output nodes to each other
      outputs.slice(0, -1).forEach((_, index) => {
        newEdges.push({
          id: `output-edge-${index}`,
          source: `output-${index}`,
          target: `output-${index + 1}`,
          animated: true,
          type: 'smoothstep',
          style: {
            stroke: '#8b5cf6',
            strokeWidth: 3,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#8b5cf6',
            width: 20,
            height: 20,
          },
        });
      });
    }

    // Connect last output (or last action) to "Add Output" button
    if (steps.length > 0) {
      const lastStep = steps[steps.length - 1];
      const sourceId = outputs.length > 0 ? `output-${outputs.length - 1}` : `step-${lastStep.stepId}`;

      newEdges.push({
        id: 'to-add-output-btn',
        source: sourceId,
        target: 'add-output-btn',
        animated: false,
        type: 'smoothstep',
        style: {
          stroke: '#6b7280',
          strokeWidth: 2,
          strokeDasharray: '5,5',
        },
        markerEnd: {
          type: 'arrowclosed',
          color: '#6b7280',
          width: 15,
          height: 15,
        },
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [steps, authSteps, selectedStepId, selectedStepIsAuth, swapModeStepId, flow, setNodes, setEdges]);

  // Custom onNodesChange to save positions
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);

    // Save positions when nodes are dragged
    changes.forEach((change: any) => {
      if (change.type === 'position' && change.position) {
        nodePositionsRef.current[change.id] = change.position;
      }
    });
  }, [onNodesChange]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    // Handle both auth- and step- prefixes
    const isAuthNode = node.id.startsWith('auth-');
    const isOutputNode = node.id.startsWith('output-');
    const isAddOutputBtn = node.id === 'add-output-btn';
    const isSectionHeader = node.id.startsWith('section-');

    // Ignore clicks on section headers
    if (isSectionHeader) {
      return;
    }

    if (isAddOutputBtn) {
      // Open output config panel
      const event = new CustomEvent('toggleOutputConfig');
      window.dispatchEvent(event);
      return;
    }

    if (isOutputNode) {
      // Open output config panel and select this output
      const outputIndex = parseInt(node.id.replace('output-', ''));
      console.log('Output node clicked:', outputIndex);
      const event = new CustomEvent('selectOutput', { detail: { outputIndex } });
      window.dispatchEvent(event);
      return;
    }

    // Regular step clicked - open step config panel
    const stepId = parseInt(node.id.replace('auth-', '').replace('step-', ''));

    // If in swap mode, swap with the clicked step
    if (swapModeStepId !== null && swapModeStepId !== stepId) {
      swapSteps(swapModeStepId, stepId);
      return;
    }

    setSelectedStepId(stepId, isAuthNode);

    // Open step config panel and close output panel
    const event = new CustomEvent('openStepConfig');
    window.dispatchEvent(event);
  };

  const handleNodeContextMenu = (event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    // Handle both auth- and step- prefixes
    const isAuthNode = node.id.startsWith('auth-');
    const stepId = parseInt(node.id.replace('auth-', '').replace('step-', ''));
    setContextMenu({
      x: event.clientX,
      y: event.clientY,
      stepId,
    });
    setSelectedStepId(stepId, isAuthNode);
  };

  const handleAddStep = () => {
    addStep();
  };

  const [isSavingFlow, setIsSavingFlow] = useState(false);
  const handleSaveFlow = async () => {
    if (isSavingFlow) return;
    setIsSavingFlow(true);
    try {
      const flowData = exportFlow();
      // Always persist locally so "Save Flow" works without backend.
      try {
        const keyById = `rpa:flows:${flowData.flowId}`;
        localStorage.setItem(keyById, JSON.stringify(flowData));
        localStorage.setItem('rpa:flows:last', flowData.flowId);
        localStorage.setItem('rpa:flows:lastSavedAt', new Date().toISOString());
      } catch {
        // Ignore localStorage failures (quota, private mode, etc.)
      }

      // Try backend save too (optional). If backend isn't running, we still succeed locally.
      try {
        await flowApi.saveFlow(flowData);
        alert('Flow saved successfully!');
      } catch (backendError: any) {
        const isNetworkError =
          backendError?.message?.toLowerCase?.().includes('network') ||
          backendError?.code === 'ERR_NETWORK';
        alert(
          isNetworkError
            ? 'Flow saved '
            : 'Flow saved '
        );
      }
    } catch (error: any) {
      alert('Failed to save flow: ' + (error?.message || 'Unknown error'));
    } finally {
      setIsSavingFlow(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedStepId !== null) {
      if (confirm('Are you sure you want to delete this step?')) {
        if (selectedStepIsAuth) {
          removeAuthStep(selectedStepId);
        } else {
          removeStep(selectedStepId);
        }
      }
    }
  };

  const handleSwapStep = () => {
    // Enter swap mode - user will click another step to swap
    if (selectedStepId !== null) {
      setSwapModeStepId(selectedStepId);
    }
  };

  const handleAddBefore = () => {
    if (selectedStepId !== null) {
      insertStepBefore(selectedStepId);
    }
  };

  const handleAddAfter = () => {
    if (selectedStepId !== null) {
      insertStepAfter(selectedStepId);
    }
  };

  const handleCopyStep = () => {
    if (selectedStepId !== null) {
      duplicateStep(selectedStepId);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1d29]">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#1a1d29] border-b border-gray-800/50">
        <h2 className="text-sm font-medium text-gray-300">Flow Canvas</h2>

        <div className="flex gap-2">
          <button
            onClick={handleSaveFlow}
            disabled={isSavingFlow}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            {isSavingFlow ? 'Saving…' : 'Save Flow'}
          </button>

            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#2d2d2d] text-[#d4a574] border border-[#d4a574]/30 rounded-lg hover:bg-[#d4a574] hover:text-[#1a1a1a] hover:border-[#d4a574] transition-all text-sm shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        {steps.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-[#1a1d29]">
            <div className="p-8 text-center">
              <div className="mb-4 text-gray-600">
                <Plus size={64} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-300">
                No Steps Yet
              </h3>
              <p className="max-w-md mb-6 text-sm text-gray-500">
                Click "Add Step" to start building your automation flow
              </p>
              <button
                onClick={handleAddStep}
                className="px-6 py-2.5 text-sm text-white transition-all rounded-md shadow-lg bg-blue-600 hover:bg-blue-700"
              >
                Add First Step
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={handleNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            onNodeContextMenu={handleNodeContextMenu}
            onPaneClick={() => {
              setContextMenu(null);
              setSelectedStepId(null);
              // Close both config panels when clicking empty canvas
              const event = new CustomEvent('closeAllPanels');
              window.dispatchEvent(event);
            }}
            nodeTypes={nodeTypes}
            nodesDraggable={true}
            nodesConnectable={true}
            elementsSelectable={true}
            fitView={isInitialMount.current}
            fitViewOptions={{ padding: 0.2 }}
            onInit={() => { isInitialMount.current = false; }}
            minZoom={0.5}
            maxZoom={2}
            defaultEdgeOptions={{
              animated: true,
              type: 'default',
              style: { stroke: '#3b82f6', strokeWidth: 3 },
              markerEnd: {
                type: 'arrowclosed',
                color: '#3b82f6',
                width: 20,
                height: 20,
              },
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.selected) return '#3b82f6';
                return '#4b5563';
              }}
              maskColor="rgba(0, 0, 0, 0.4)"
            />
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#374151"
            />
          </ReactFlow>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <NodeContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          stepId={contextMenu.stepId}
          onClose={() => setContextMenu(null)}
          onSwapStep={handleSwapStep}
          onAddBefore={handleAddBefore}
          onAddAfter={handleAddAfter}
          onCopy={handleCopyStep}
          onDelete={handleDeleteSelected}
          onUndo={undo}
          onRedo={redo}
          canUndo={canUndo()}
          canRedo={canRedo()}
        />
      )}

      {/* Swap Mode Indicator */}
      {swapModeStepId !== null && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-2xl flex items-center gap-3">
          <Replace size={20} />
          <span className="font-medium">
            Swap Mode: Click another step to swap with Step {swapModeStepId}
          </span>
          <button
            onClick={() => setSwapModeStepId(null)}
            className="ml-2 px-3 py-1 bg-white text-blue-600 rounded hover:bg-gray-100 text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};