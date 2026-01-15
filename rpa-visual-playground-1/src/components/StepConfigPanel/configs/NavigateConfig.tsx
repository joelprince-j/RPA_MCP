import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface NavigateConfigProps {
  register: UseFormRegister<FlowStep>;
}

export const NavigateConfig: React.FC<NavigateConfigProps> = ({ register }) => {
  return (
    <div className="space-y-4 border-t border-gray-800/50 pt-4">
      <h4 className="font-semibold text-sm text-gray-300">Navigate Settings</h4>
      
      <div>
        <label className="block mb-1 text-xs font-medium text-gray-400">Target URL *</label>
        <input
          type="url"
          {...register('params.url')}
          className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="https://example.com"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The URL to navigate to
        </p>
      </div>
    </div>
  );
};