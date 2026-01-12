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
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Click Settings</h4>

      <div>
        <label className="form-label">Element ID</label>
        <input
          {...register('params.elementId')}
          className="form-input"
          placeholder="e.g., submit-button"
        />
        <p className="text-xs text-gray-500 mt-1">
          Unique identifier for the element
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h5 className="text-xs font-semibold text-gray-600 uppercase">Selectors</h5>

        <div>
          <label className="form-label">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="form-input"
            placeholder="#submit-button"
          />
        </div>

        <div>
          <label className="form-label">XPath</label>
          <input
            {...register('params.selectors.xpath')}
            className="form-input"
            placeholder="//button[@id='submit']"
          />
        </div>

        <div>
          <label className="form-label">Data Test ID</label>
          <input
            {...register('params.selectors.dataTestId')}
            className="form-input"
            placeholder="submit-btn"
          />
        </div>

        <div>
          <label className="form-label">ARIA Label</label>
          <input
            {...register('params.selectors.ariaLabel')}
            className="form-input"
            placeholder="Submit form"
          />
        </div>

        <div>
          <label className="form-label">Text Content</label>
          <input
            {...register('params.selectors.text')}
            className="form-input"
            placeholder="Submit"
          />
        </div>
      </div>
    </div>
  );
};
