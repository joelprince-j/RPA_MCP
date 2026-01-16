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
  navigate: {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500',
    iconBg: 'bg-blue-500',
    text: 'text-blue-100',
    badge: 'bg-blue-500/30 text-blue-200',
  },
  click: {
    bg: 'bg-green-600/20',
    border: 'border-green-500',
    iconBg: 'bg-green-500',
    text: 'text-green-100',
    badge: 'bg-green-500/30 text-green-200',
  },
  input: {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500',
    iconBg: 'bg-purple-500',
    text: 'text-purple-100',
    badge: 'bg-purple-500/30 text-purple-200',
  },
  wait: {
    bg: 'bg-yellow-600/20',
    border: 'border-yellow-500',
    iconBg: 'bg-yellow-500',
    text: 'text-yellow-100',
    badge: 'bg-yellow-500/30 text-yellow-200',
  },
  extract: {
    bg: 'bg-orange-600/20',
    border: 'border-orange-500',
    iconBg: 'bg-orange-500',
    text: 'text-orange-100',
    badge: 'bg-orange-500/30 text-orange-200',
  },
  scroll: {
    bg: 'bg-pink-600/20',
    border: 'border-pink-500',
    iconBg: 'bg-pink-500',
    text: 'text-pink-100',
    badge: 'bg-pink-500/30 text-pink-200',
  },
  select: {
    bg: 'bg-indigo-600/20',
    border: 'border-indigo-500',
    iconBg: 'bg-indigo-500',
    text: 'text-indigo-100',
    badge: 'bg-indigo-500/30 text-indigo-200',
  },
  upload: {
    bg: 'bg-red-600/20',
    border: 'border-red-500',
    iconBg: 'bg-red-500',
    text: 'text-red-100',
    badge: 'bg-red-500/30 text-red-200',
  },
};

export const StepNode: React.FC<StepNodeProps> = ({ data, selected }) => {
  const { step, isSwapMode } = data;
  // Support both action (legacy) and actionType (new format)
  const action = step.actionType || step.action || 'click';
  const Icon = ACTION_ICONS[action as keyof typeof ACTION_ICONS] || ACTION_ICONS.click;
  const colors = ACTION_COLORS[action as keyof typeof ACTION_COLORS] || ACTION_COLORS.click;

  return (
    <div
      className={`rounded-xl border-2 ${colors.border} ${colors.bg} backdrop-blur-sm min-w-[280px] max-w-[320px] shadow-xl transition-all ${
        selected ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-[#1a1d29] shadow-2xl scale-105' : 'shadow-lg'
      } ${
        isSwapMode ? 'ring-4 ring-orange-500 ring-offset-2 ring-offset-[#1a1d29] shadow-2xl animate-pulse' : ''
      } overflow-hidden`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 !bg-blue-500 !border-2 !border-[#1a1d29] !rounded-full"
      />

      {/* Header with Icon and Step Number */}
      <div className={`${colors.iconBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">
              Step {step.stepId}
            </div>
            <div className="text-xs font-bold text-white capitalize">
              {action}
            </div>
          </div>
        </div>
        {step.completed && (
          <CheckCircle2 size={18} className="text-white" />
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-[#1a1d29]/50">
        <div className="mb-3 text-sm font-semibold text-gray-100 line-clamp-2">
          {step.description || getDefaultDescription(step)}
        </div>

        <div className="space-y-2">
          {step.params.elementId && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">ID:</span>
              <span className="text-gray-200 font-mono bg-gray-800/50 px-2 py-0.5 rounded">
                {step.params.elementId}
              </span>
            </div>
          )}

          {step.params.url && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">URL:</span>
              <span className="text-gray-200 font-mono bg-gray-800/50 px-2 py-0.5 rounded truncate">
                {step.params.url}
              </span>
            </div>
          )}

          {step.params.value && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400 font-medium">Value:</span>
              <span className="text-gray-200 font-mono bg-gray-800/50 px-2 py-0.5 rounded truncate">
                {String(step.params.value)}
              </span>
            </div>
          )}
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 !bg-blue-500 !border-2 !border-[#1a1d29] !rounded-full"
      />
    </div>
  );
};

function getDefaultDescription(step: FlowStep): string {
  const action = step.actionType || step.action || 'click';
  switch (action) {
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