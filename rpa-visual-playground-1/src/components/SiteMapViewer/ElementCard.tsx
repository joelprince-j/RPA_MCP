import React from 'react';
import { useFlowStore } from '../../store/flowStore';
import type { ElementMetadata } from '../../types/sitemap.types';
import {
  MousePointer2,
  Type,
  List,
  CheckSquare,
  Link as LinkIcon,
  Image,
  Plus,
  Square,
  Circle,
  FileText,
  Video,
  Mail,
  Lock,
  Calendar,
  Search,
  Phone,
  HelpCircle,
} from 'lucide-react';

interface ElementCardProps {
  element: ElementMetadata;
}

const ELEMENT_ICONS = {
  button: MousePointer2,
  link: LinkIcon,
  input: Type,
  select: List,
  checkbox: CheckSquare,
  radio: Circle,
  image: Image,
  textarea: FileText,
  form: Square,
  video: Video,
  email: Mail,
  password: Lock,
  date: Calendar,
  search: Search,
  tel: Phone,
  text: Type,
};

const ELEMENT_COLORS = {
  button: 'bg-gradient-to-br from-green-50 to-green-100 border-green-300 text-green-700',
  link: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300 text-blue-700',
  input: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 text-purple-700',
  select: 'bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-300 text-indigo-700',
  checkbox: 'bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 text-yellow-700',
  radio: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-300 text-amber-700',
  image: 'bg-gradient-to-br from-pink-50 to-pink-100 border-pink-300 text-pink-700',
  textarea: 'bg-gradient-to-br from-violet-50 to-violet-100 border-violet-300 text-violet-700',
  form: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300 text-orange-700',
  video: 'bg-gradient-to-br from-red-50 to-red-100 border-red-300 text-red-700',
  email: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-300 text-cyan-700',
  password: 'bg-gradient-to-br from-slate-50 to-slate-100 border-slate-300 text-slate-700',
  date: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-300 text-teal-700',
  search: 'bg-gradient-to-br from-sky-50 to-sky-100 border-sky-300 text-sky-700',
  tel: 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-300 text-emerald-700',
  text: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-300 text-purple-700',
  unknown: 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300 text-gray-700',
};

export const ElementCard: React.FC<ElementCardProps> = ({ element }) => {
  const { addStep, setSelectedElement, selectedStepId, updateStep } = useFlowStore();

  const Icon = ELEMENT_ICONS[element.type as keyof typeof ELEMENT_ICONS] || HelpCircle;
  const colorClass = ELEMENT_COLORS[element.type as keyof typeof ELEMENT_COLORS] || ELEMENT_COLORS.unknown;

  const handleAddToFlow = () => {
    // Determine action based on element type
    let action: 'click' | 'input' | 'select' = 'click';
    if (element.type === 'input' || element.type === 'textarea') {
      action = 'input';
    } else if (element.type === 'select') {
      action = 'select';
    }

    const stepData = {
      action,
      params: {
        elementId: element.elementId,
        selectors: element.selectors,
        timeout: 30000,
      },
      description: `${action.charAt(0).toUpperCase() + action.slice(1)} ${
        element.textContent || element.elementId
      }`,
    };

    // If a step is selected, update it instead of adding new
    if (selectedStepId !== null) {
      updateStep(selectedStepId, stepData);
    } else {
      // Otherwise add a new step
      addStep(stepData);
    }

    setSelectedElement(element);
  };

  return (
    <div
      className={`border-2 rounded-xl p-3 ${colorClass} hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer group relative`}
      onClick={handleAddToFlow}
      title={selectedStepId !== null ? `Click to update Step ${selectedStepId}` : 'Click to add new step'}
    >
      {/* Update indicator badge */}
      {selectedStepId !== null && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow-lg font-semibold z-10 animate-pulse">
          Update Step {selectedStepId}
        </div>
      )}
      
      <div className="flex items-start gap-3">
        {/* Icon with background circle */}
        <div className="flex-shrink-0 mt-0.5 p-2 bg-white rounded-lg shadow-sm">
          <Icon size={20} strokeWidth={2.5} />
        </div>

        <div className="flex-1 min-w-0">
          {/* Type badge */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wide opacity-80">
              {element.type}
            </span>
            {!element.interactable && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium border border-red-200">
                disabled
              </span>
            )}
          </div>

          {/* Element text/ID */}
          <div className="mb-2 text-sm font-semibold line-clamp-2 leading-tight">
            {element.textContent || element.elementId}
          </div>

          {/* Selectors */}
          <div className="space-y-1">
            {element.selectors.css && (
              <div className="font-mono text-xs truncate opacity-70 bg-white/50 px-2 py-1 rounded">
                <span className="font-semibold">CSS:</span> {element.selectors.css}
              </div>
            )}
            {element.selectors.dataTestId && (
              <div className="font-mono text-xs truncate opacity-70 bg-white/50 px-2 py-1 rounded">
                <span className="font-semibold">ID:</span> {element.selectors.dataTestId}
              </div>
            )}
          </div>
        </div>

        {/* Add button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToFlow();
          }}
          className="flex-shrink-0 p-2 bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-md hover:shadow-lg hover:scale-110"
          title="Add to flow"
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
};