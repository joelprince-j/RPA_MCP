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


import React, { useCallback, useEffect } from 'react';
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
import { Plus, Trash2 } from 'lucide-react';

const nodeTypes = {
  step: StepNode,
};

export const FlowBuilder: React.FC = () => {
  const { steps, addStep, setSelectedStepId, removeStep, selectedStepId } = useFlowStore();

  // Convert steps to React Flow nodes
  const createNodes = (): Node[] => {
    return steps.map((step, index) => ({
      id: `step-${step.stepId}`,
      type: 'step',
      position: { x: 250, y: index * 150 + 50 },
      data: { step },
      selected: selectedStepId === step.stepId,
    }));
  };

  // Create edges between sequential steps
  const createEdges = (): Edge[] => {
    return steps.slice(0, -1).map((step, index) => ({
      id: `edge-${step.stepId}`,
      source: `step-${step.stepId}`,
      target: `step-${steps[index + 1].stepId}`,
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
    }));
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(createNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(createEdges());

  // Update nodes when steps change
  useEffect(() => {
    setNodes(createNodes());
    setEdges(createEdges());
  }, [steps, selectedStepId]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleNodeClick = (_event: React.MouseEvent, node: Node) => {
    const stepId = parseInt(node.id.replace('step-', ''));
    setSelectedStepId(stepId);
  };

  const handleAddStep = () => {
    addStep();
  };

  const handleDeleteSelected = () => {
    if (selectedStepId !== null) {
      if (confirm('Are you sure you want to delete this step?')) {
        removeStep(selectedStepId);
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b shadow-sm">
        <h2 className="text-lg font-semibold text-gray-700">Flow Canvas</h2>
        
        <div className="flex gap-2">
          <button
            onClick={handleAddStep}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm shadow-sm"
          >
            <Plus size={16} />
            Add Step
          </button>
          
          {selectedStepId !== null && (
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm shadow-sm"
            >
              <Trash2 size={16} />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* React Flow Canvas */}
      <div className="flex-1">
        {steps.length === 0 ? (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-8 text-center">
              <div className="mb-4 text-gray-300">
                <Plus size={64} className="mx-auto" strokeWidth={1.5} />
              </div>
              <h3 className="mb-2 text-2xl font-bold text-gray-700">
                No Steps Yet
              </h3>
              <p className="max-w-md mb-6 text-gray-500">
                Click "Add Step" to start building your automation flow. 
                You can also drag and drop elements from the site map.
              </p>
              <button
                onClick={handleAddStep}
                className="px-6 py-3 text-white transition-all rounded-lg shadow-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
              >
                Add First Step
              </button>
            </div>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={handleNodeClick}
            nodeTypes={nodeTypes}
            fitView
            minZoom={0.5}
            maxZoom={2}
            defaultEdgeOptions={{
              animated: true,
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.selected) return '#3b82f6';
                return '#9ca3af';
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
              className="bg-white border border-gray-200 rounded-lg shadow-sm"
            />
            <Background 
              variant={BackgroundVariant.Dots} 
              gap={20} 
              size={1}
              color="#e5e7eb"
            />
          </ReactFlow>
        )}
      </div>
    </div>
  );
};