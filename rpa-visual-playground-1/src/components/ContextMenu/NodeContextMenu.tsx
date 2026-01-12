import React, { useEffect, useRef } from 'react';
import { 
  Replace, 
  Copy, 
  Trash2, 
  Plus,
  Undo,
  Redo
} from 'lucide-react';

interface NodeContextMenuProps {
  x: number;
  y: number;
  stepId: number;
  onClose: () => void;
  onSwapStep: () => void;
  onAddBefore: () => void;
  onAddAfter: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export const NodeContextMenu: React.FC<NodeContextMenuProps> = ({
  x,
  y,
  stepId,
  onClose,
  onSwapStep,
  onAddBefore,
  onAddAfter,
  onCopy,
  onDelete,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ x, y });

  // Adjust position to keep menu inside viewport
  useEffect(() => {
    if (menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      // Check if menu goes outside right edge
      if (x + menuRect.width > viewportWidth) {
        adjustedX = x - menuRect.width; // Show on left side
      }

      // Check if menu goes outside bottom edge
      if (y + menuRect.height > viewportHeight) {
        adjustedY = viewportHeight - menuRect.height - 10; // Show above
      }

      // Check if menu goes outside left edge
      if (adjustedX < 0) {
        adjustedX = 10;
      }

      // Check if menu goes outside top edge
      if (adjustedY < 0) {
        adjustedY = 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const menuItems = [
    {
      icon: Undo,
      label: 'Undo',
      description: 'Undo last action (Ctrl+Z)',
      onClick: onUndo,
      color: 'text-purple-600',
      disabled: !canUndo,
    },
    {
      icon: Redo,
      label: 'Redo',
      description: 'Redo last action (Ctrl+Y)',
      onClick: onRedo,
      color: 'text-purple-600',
      disabled: !canRedo,
    },
    { divider: true },
    {
      icon: Replace,
      label: 'Swap with Another Step',
      description: 'Click another step to swap positions',
      onClick: onSwapStep,
      color: 'text-blue-600',
    },
    { divider: true },
    {
      icon: Plus,
      label: 'Add Step Before',
      description: 'Insert new step above',
      onClick: onAddBefore,
      color: 'text-green-600',
    },
    {
      icon: Plus,
      label: 'Add Step After',
      description: 'Insert new step below',
      onClick: onAddAfter,
      color: 'text-green-600',
    },
    { divider: true },
    {
      icon: Copy,
      label: 'Duplicate Step',
      description: 'Create a copy',
      onClick: onCopy,
      color: 'text-gray-600',
    },
    {
      icon: Trash2,
      label: 'Delete Step',
      description: 'Remove from flow',
      onClick: onDelete,
      color: 'text-red-600',
    },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 py-2 min-w-[240px]"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Header */}
      <div className="px-4 py-2 border-b border-gray-100">
        <div className="text-xs font-semibold text-gray-500">Step {stepId}</div>
      </div>

      {/* Menu Items */}
      {menuItems.map((item, index) => {
        if ('divider' in item) {
          return <div key={index} className="my-1 border-t border-gray-100" />;
        }

        const Icon = item.icon;
        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            disabled={item.disabled}
            className={`w-full px-4 py-2.5 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left ${
              item.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <Icon size={18} className={`flex-shrink-0 mt-0.5 ${item.color}`} />
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">{item.description}</div>
            </div>
          </button>
        );
      })}
    </div>
  );
};
