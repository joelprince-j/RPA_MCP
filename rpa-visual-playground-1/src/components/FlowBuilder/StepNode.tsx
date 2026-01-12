// import React from 'react';
// import { Handle, Position } from 'reactflow';
// import type { FlowStep } from '../../types/flow.types';
// import {
//   MousePointer2,
//   Type,
//   Navigation,
//   Clock,
//   Download,
//   ArrowDown,
//   List,
//   Upload,
//   CheckCircle2,
// } from 'lucide-react';

// interface StepNodeProps {
//   data: {
//     step: FlowStep;
//   };
//   selected?: boolean;
// }

// const ACTION_ICONS = {
//   navigate: Navigation,
//   click: MousePointer2,
//   input: Type,
//   wait: Clock,
//   extract: Download,
//   scroll: ArrowDown,
//   select: List,
//   upload: Upload,
// };

// const ACTION_COLORS = {
//   navigate: 'bg-blue-50 border-blue-400 text-blue-700',
//   click: 'bg-green-50 border-green-400 text-green-700',
//   input: 'bg-purple-50 border-purple-400 text-purple-700',
//   wait: 'bg-yellow-50 border-yellow-400 text-yellow-700',
//   extract: 'bg-orange-50 border-orange-400 text-orange-700',
//   scroll: 'bg-pink-50 border-pink-400 text-pink-700',
//   select: 'bg-indigo-50 border-indigo-400 text-indigo-700',
//   upload: 'bg-red-50 border-red-400 text-red-700',
// };

// export const StepNode: React.FC<StepNodeProps> = ({ data, selected }) => {
//   const { step } = data;
//   const Icon = ACTION_ICONS[step.action];
//   const colorClass = ACTION_COLORS[step.action];

//   return (
//     <div
//       className={`rounded-lg border-2 ${colorClass} p-4 min-w-[250px] max-w-[300px] shadow-md transition-all ${
//         selected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : ''
//       }`}
//     >
//       <Handle
//         type="target"
//         position={Position.Top}
//         className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
//       />

//       <div className="flex items-start gap-3">
//         <div className="flex-shrink-0 mt-0.5">
//           <Icon size={20} />
//         </div>

//         <div className="flex-1 min-w-0">
//           <div className="flex flex-wrap items-center gap-2 mb-1">
//             <span className="text-xs font-bold opacity-70">
//               Step {step.stepId}
//             </span>
//             <span className="text-xs px-2 py-0.5 bg-white rounded font-medium shadow-sm">
//               {step.action}
//             </span>
//             {step.completed && (
//               <CheckCircle2 size={14} className="text-green-600" />
//             )}
//           </div>

//           <div className="mb-1 text-sm font-medium line-clamp-2">
//             {step.description || getDefaultDescription(step)}
//           </div>

//           <div className="space-y-1 text-xs opacity-70">
//             {step.params.elementId && (
//               <div className="truncate">ID: {step.params.elementId}</div>
//             )}

//             {step.params.url && (
//               <div className="truncate">URL: {step.params.url}</div>
//             )}

//             {step.params.value && (
//               <div className="truncate">Value: {String(step.params.value)}</div>
//             )}
//           </div>
//         </div>
//       </div>

//       <Handle
//         type="source"
//         position={Position.Bottom}
//         className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
//       />
//     </div>
//   );
// };

// function getDefaultDescription(step: FlowStep): string {
//   switch (step.action) {
//     case 'navigate':
//       return `Navigate to ${step.params.url || 'URL'}`;
//     case 'click':
//       return `Click ${step.params.elementId || 'element'}`;
//     case 'input':
//       return `Enter text into ${step.params.elementId || 'field'}`;
//     case 'wait':
//       return `Wait for ${step.params.condition || 'condition'}`;
//     case 'extract':
//       return `Extract ${step.params.dataType || 'data'}`;
//     case 'scroll':
//       return `Scroll ${step.params.direction || 'down'}`;
//     case 'select':
//       return `Select option in ${step.params.elementId || 'dropdown'}`;
//     case 'upload':
//       return `Upload file`;
//     default:
//       return step.action;
//   }
// }

import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { FlowStep } from '../../types/flow.types';
import {
  MousePointer2,
  Type,
  Navigation,
  Clock,
  Download,
  ArrowDown,
  List,
  Upload,
  CheckCircle2,
} from 'lucide-react';

interface StepNodeProps {
  data: {
    step: FlowStep;
    isSwapMode?: boolean;
  };
  selected?: boolean;
}

const ACTION_ICONS = {
  navigate: Navigation,
  click: MousePointer2,
  input: Type,
  wait: Clock,
  extract: Download,
  scroll: ArrowDown,
  select: List,
  upload: Upload,
};

const ACTION_COLORS = {
  navigate: 'bg-blue-50 border-blue-400 text-blue-700',
  click: 'bg-green-50 border-green-400 text-green-700',
  input: 'bg-purple-50 border-purple-400 text-purple-700',
  wait: 'bg-yellow-50 border-yellow-400 text-yellow-700',
  extract: 'bg-orange-50 border-orange-400 text-orange-700',
  scroll: 'bg-pink-50 border-pink-400 text-pink-700',
  select: 'bg-indigo-50 border-indigo-400 text-indigo-700',
  upload: 'bg-red-50 border-red-400 text-red-700',
};

export const StepNode: React.FC<StepNodeProps> = ({ data, selected }) => {
  const { step, isSwapMode } = data;
  const Icon = ACTION_ICONS[step.action];
  const colorClass = ACTION_COLORS[step.action];

  return (
    <div
      className={`rounded-lg border-2 ${colorClass} p-4 min-w-[250px] max-w-[300px] shadow-md transition-all ${
        selected ? 'ring-2 ring-blue-500 ring-offset-2 shadow-lg' : ''
      } ${
        isSwapMode ? 'ring-4 ring-orange-500 ring-offset-2 shadow-2xl animate-pulse' : ''
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />

      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={20} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold opacity-70">
              Step {step.stepId}
            </span>
            <span className="text-xs px-2 py-0.5 bg-white rounded font-medium shadow-sm">
              {step.action}
            </span>
            {step.completed && (
              <CheckCircle2 size={14} className="text-green-600" />
            )}
          </div>

          <div className="mb-1 text-sm font-medium line-clamp-2">
            {step.description || getDefaultDescription(step)}
          </div>

          <div className="space-y-1 text-xs opacity-70">
            {step.params.elementId && (
              <div className="truncate">ID: {step.params.elementId}</div>
            )}

            {step.params.url && (
              <div className="truncate">URL: {step.params.url}</div>
            )}

            {step.params.value && (
              <div className="truncate">Value: {String(step.params.value)}</div>
            )}
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white"
      />
    </div>
  );
};

function getDefaultDescription(step: FlowStep): string {
  switch (step.action) {
    case 'navigate':
      return `Navigate to ${step.params.url || 'URL'}`;
    case 'click':
      return `Click ${step.params.elementId || 'element'}`;
    case 'input':
      return `Enter text into ${step.params.elementId || 'field'}`;
    case 'wait':
      return `Wait for ${step.params.condition || 'condition'}`;
    case 'extract':
      return `Extract ${step.params.dataType || 'data'}`;
    case 'scroll':
      return `Scroll ${step.params.direction || 'down'}`;
    case 'select':
      return `Select option in ${step.params.elementId || 'dropdown'}`;
    case 'upload':
      return `Upload file`;
    default:
      return step.action;
  }
}