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
  Send,
  Camera,
  Database,
} from 'lucide-react';

interface StepNodeProps {
  data: {
    step: FlowStep;
    isSwapMode?: boolean;
    isAuthStep?: boolean;
    isOutputNode?: boolean;
    isAddOutputButton?: boolean;
    isSectionHeader?: boolean;
    sectionType?: 'auth' | 'action' | 'output';
    outputIndex?: number;
  };
  selected?: boolean;
}

const ACTION_ICONS = {
  navigate: Navigation,
  click: MousePointer2,
  input: Type,
  type: Type,
  submit: Send,
  wait: Clock,
  extract: Download,
  scroll: ArrowDown,
  select: List,
  upload: Upload,
  screenshot: Camera,
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
  type: {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500',
    iconBg: 'bg-purple-500',
    text: 'text-purple-100',
    badge: 'bg-purple-500/30 text-purple-200',
  },
  submit: {
    bg: 'bg-emerald-600/20',
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-500',
    text: 'text-emerald-100',
    badge: 'bg-emerald-500/30 text-emerald-200',
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
  screenshot: {
    bg: 'bg-cyan-600/20',
    border: 'border-cyan-500',
    iconBg: 'bg-cyan-500',
    text: 'text-cyan-100',
    badge: 'bg-cyan-500/30 text-cyan-200',
  },
};

export const StepNode: React.FC<StepNodeProps> = ({ data, selected }) => {
  const { step, isSwapMode, isAuthStep, isOutputNode, isAddOutputButton, isSectionHeader, sectionType } = data;
  
  // Special rendering for Section Headers
  if (isSectionHeader) {
    const sectionColors = {
      auth: 'border-amber-500 bg-amber-500/10 text-amber-300',
      action: 'border-blue-500 bg-blue-500/10 text-blue-300',
      output: 'border-purple-500 bg-purple-500/10 text-purple-300',
    };
    
    const sectionIcons = {
      auth: '🔐',
      action: '⚡',
      output: '📤',
    };
    
    return (
      <div className={`rounded-xl border-2 ${sectionColors[sectionType!]} backdrop-blur-sm min-w-[280px] max-w-[320px] shadow-lg pointer-events-none`}>
        <Handle
          type="target"
          position={Position.Top}
          className="w-4 h-4 !bg-gray-500 !border-2 !border-[#1a1d29] !rounded-full"
        />
        <div className="p-4 text-center">
          <div className="text-2xl mb-1">{sectionIcons[sectionType!]}</div>
          <div className="text-sm font-bold uppercase tracking-wider">{step.description}</div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-4 h-4 !bg-gray-500 !border-2 !border-[#1a1d29] !rounded-full"
        />
      </div>
    );
  }
  
  // Special rendering for Add Output button
  if (isAddOutputButton) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-600 bg-gray-800/30 backdrop-blur-sm min-w-[280px] max-w-[320px] shadow-lg transition-all hover:border-purple-500 hover:bg-purple-500/10 cursor-pointer">
        <div className="p-6 text-center">
          <div className="mb-2 text-purple-400">
            <Database size={32} className="mx-auto" />
          </div>
          <div className="text-sm font-semibold text-gray-200">Add Output</div>
          <div className="text-xs text-gray-400 mt-1">Configure where to send results</div>
        </div>
      </div>
    );
  }
  
  // Support both action (legacy) and actionType (new format)
  const action = step.actionType || step.action || 'click';
  const Icon = ACTION_ICONS[action as keyof typeof ACTION_ICONS] || ACTION_ICONS.click;
  
  // Use purple color for output nodes, amber for auth, blue for actions
  const colors = isOutputNode ? {
    bg: 'bg-purple-600/20',
    border: 'border-purple-500',
    iconBg: 'bg-purple-500',
    text: 'text-purple-100',
    badge: 'bg-purple-500/30 text-purple-200',
  } : isAuthStep ? {
    bg: 'bg-amber-600/20',
    border: 'border-amber-500',
    iconBg: 'bg-amber-500',
    text: 'text-amber-100',
    badge: 'bg-amber-500/30 text-amber-200',
  } : {
    bg: 'bg-blue-600/20',
    border: 'border-blue-500',
    iconBg: 'bg-blue-500',
    text: 'text-blue-100',
    badge: 'bg-blue-500/30 text-blue-200',
  };

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
              {isOutputNode ? '📤 Output' : isAuthStep ? '🔐 Auth' : 'Action'} {step.stepId}
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
    case 'type':
      return `Enter text into ${step.params.elementId || 'field'}`;
    case 'submit':
      return `Submit ${step.params.elementId || 'form'}`;
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
    case 'screenshot':
      return `Capture screenshot`;
    default:
      return action;
  }
}