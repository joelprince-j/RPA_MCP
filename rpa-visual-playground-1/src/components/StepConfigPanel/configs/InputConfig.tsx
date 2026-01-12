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
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Input Settings</h4>

      <div>
        <label className="form-label">Element ID</label>
        <input
          {...register('params.elementId')}
          className="form-input"
          placeholder="e.g., username-field"
        />
      </div>

      <div>
        <label className="form-label">Value to Input *</label>
        <input
          {...register('params.value')}
          className="form-input"
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
          className="rounded"
          id="clearFirst"
          defaultChecked
        />
        <label htmlFor="clearFirst" className="text-sm text-gray-700">
          Clear field before typing
        </label>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h5 className="text-xs font-semibold text-gray-600 uppercase">Selectors</h5>

        <div>
          <label className="form-label">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="form-input"
            placeholder="#username"
          />
        </div>

        <div>
          <label className="form-label">Data Test ID</label>
          <input
            {...register('params.selectors.dataTestId')}
            className="form-input"
            placeholder="username-input"
          />
        </div>

        <div>
          <label className="form-label">Name Attribute</label>
          <input
            {...register('params.selectors.text')}
            className="form-input"
            placeholder="username"
          />
        </div>
      </div>
    </div>
  );
};