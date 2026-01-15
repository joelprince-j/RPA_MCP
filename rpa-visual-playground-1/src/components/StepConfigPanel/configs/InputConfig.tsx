import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface InputConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const InputConfig: React.FC<InputConfigProps> = ({ register, watch }) => {
  return (
    <div className="space-y-4 border-t border-gray-800/50 pt-4">
      <h4 className="font-semibold text-sm text-gray-300">Input Settings</h4>

      <div>
        <label className="block mb-1 text-xs font-medium text-gray-400">Element ID</label>
        <input
          {...register('params.elementId')}
          className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="e.g., username-field"
        />
      </div>

      <div>
        <label className="block mb-1 text-xs font-medium text-gray-400">Value to Input *</label>
        <input
          {...register('params.value')}
          className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="Enter the text to input"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Supports variables: $&#123;env.VAR_NAME&#125; or $&#123;ctx.VAR_NAME&#125;
        </p>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          {...register('params.clearFirst')}
          className="rounded border-gray-700 bg-gray-800/50 text-blue-600 focus:ring-blue-500"
          id="clearFirst"
          defaultChecked
        />
        <label htmlFor="clearFirst" className="text-sm text-gray-300">
          Clear field before typing
        </label>
      </div>

      <div className="bg-gray-800/30 p-3 rounded-lg space-y-3 border border-gray-700/30">
        <h5 className="text-xs font-semibold text-gray-400 uppercase">Selectors</h5>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="#username"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Data Test ID</label>
          <input
            {...register('params.selectors.dataTestId')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="username-input"
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Name Attribute</label>
          <input
            {...register('params.selectors.text')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="username"
          />
        </div>
      </div>
    </div>
  );
};