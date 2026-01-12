import React from 'react';
import type { ElementMetadata } from '../../types/sitemap.types';

interface ElementTreeProps {
  elements: ElementMetadata[];
}

export const ElementTree: React.FC<ElementTreeProps> = ({ elements }) => {
  return (
    <div className="space-y-1">
      {elements.map((element) => (
        <div
          key={element.elementId}
          className="p-2 text-sm rounded cursor-pointer hover:bg-gray-50"
        >
          <div className="font-mono text-xs text-gray-600">
            {element.tagName}
          </div>
          <div className="text-gray-800">{element.textContent}</div>
        </div>
      ))}
    </div>
  );
};