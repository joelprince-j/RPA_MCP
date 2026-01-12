import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface SelectConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const SelectConfig: React.FC<SelectConfigProps> = ({ register, watch }) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Select Settings</h4>

      <div>
        <label className="form-label">Element ID</label>
        <input
          {...register('params.elementId')}
          className="form-input"
          placeholder="e.g., country-select"
        />
      </div>

      <div>
        <label className="form-label">Option Value *</label>
        <input
          {...register('params.value')}
          className="form-input"
          placeholder="Option value or text"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          The value or visible text of the option to select
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h5 className="text-xs font-semibold text-gray-600 uppercase">Selectors</h5>

        <div>
          <label className="form-label">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="form-input"
            placeholder="#country-dropdown"
          />
        </div>

        <div>
          <label className="form-label">Name Attribute</label>
          <input
            {...register('params.selectors.text')}
            className="form-input"
            placeholder="country"
          />
        </div>
      </div>
    </div>
  );
};