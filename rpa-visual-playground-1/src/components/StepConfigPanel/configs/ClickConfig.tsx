import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';

import type { FlowStep } from '../../../types/flow.types';

interface ClickConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const ClickConfig: React.FC<ClickConfigProps> = ({ register, watch }) => {
  return (
    <div className="space-y-4 border-t border-gray-800/50 pt-4">
      <h4 className="font-semibold text-sm text-gray-300">Click Settings</h4>

      <div>
        <label className="block mb-1 text-xs font-medium text-gray-400">Element ID</label>
        <input
          {...register('params.elementId')}
          className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="e.g., submit-button"
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the element
        </p>
      </div>

      <div className="bg-gray-800/30 p-3 rounded-lg space-y-3 border border-gray-700/30">
        <h5 className="text-xs font-semibold text-gray-400 uppercase">Selectors</h5>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="#submit-button"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">XPath</label>
          <input
            {...register('params.selectors.xpath')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="//button[@id='submit']"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Data Test ID</label>
          <input
            {...register('params.selectors.dataTestId')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="submit-btn"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">ARIA Label</label>
          <input
            {...register('params.selectors.ariaLabel')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="Submit form"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Text Content</label>
          <input
            {...register('params.selectors.text')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="Submit"
          />
        </div>
      </div>
    </div>
  );
};
