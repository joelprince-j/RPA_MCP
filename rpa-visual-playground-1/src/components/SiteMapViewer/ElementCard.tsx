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
  radio: CheckSquare,
  image: Image,
  textarea: Type,
};

const ELEMENT_COLORS = {
  button: 'bg-green-50 border-green-200 text-green-700',
  link: 'bg-blue-50 border-blue-200 text-blue-700',
  input: 'bg-purple-50 border-purple-200 text-purple-700',
  select: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  checkbox: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  radio: 'bg-yellow-50 border-yellow-200 text-yellow-700',
  image: 'bg-pink-50 border-pink-200 text-pink-700',
  textarea: 'bg-purple-50 border-purple-200 text-purple-700',
  form: 'bg-orange-50 border-orange-200 text-orange-700',
  video: 'bg-red-50 border-red-200 text-red-700',
  unknown: 'bg-gray-50 border-gray-200 text-gray-700',
};

export const ElementCard: React.FC<ElementCardProps> = ({ element }) => {
  const { addStep, setSelectedElement, selectedStepId, updateStep } = useFlowStore();

  const Icon = ELEMENT_ICONS[element.type] || MousePointer2;
  const colorClass = ELEMENT_COLORS[element.type] || ELEMENT_COLORS.unknown;

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
      className={`border rounded-lg p-3 ${colorClass} hover:shadow-md transition-all cursor-pointer group relative`}
      onClick={handleAddToFlow}
      title={selectedStepId !== null ? `Click to update Step ${selectedStepId}` : 'Click to add new step'}
    >
      {/* Update indicator badge */}
      {selectedStepId !== null && (
        <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full shadow-lg font-semibold z-10">
          Update Step {selectedStepId}
        </div>
      )}
      
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <Icon size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold opacity-70">{element.type}</span>
            {!element.interactable && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-200 text-gray-600 rounded">
                disabled
              </span>
            )}
          </div>

          <div className="mb-1 text-sm font-medium line-clamp-1">
            {element.textContent || element.elementId}
          </div>

          <div className="space-y-1">
            {element.selectors.css && (
              <div className="font-mono text-xs truncate opacity-70">
                CSS: {element.selectors.css}
              </div>
            )}
            {element.selectors.dataTestId && (
              <div className="font-mono text-xs truncate opacity-70">
                Test ID: {element.selectors.dataTestId}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToFlow();
          }}
          className="flex-shrink-0 p-1.5 bg-white rounded opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          title="Add to flow"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};