import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface ScrollConfigProps {
  register: UseFormRegister<FlowStep>;
}

export const ScrollConfig: React.FC<ScrollConfigProps> = ({ register }) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Scroll Settings</h4>

      <div>
        <label className="form-label">Direction *</label>
        <select {...register('params.direction')} className="form-select" required>
          <option value="down">Down</option>
          <option value="up">Up</option>
          <option value="bottom">To Bottom</option>
          <option value="top">To Top</option>
        </select>
      </div>

      <div>
        <label className="form-label">Scroll Amount (pixels)</label>
        <input
          type="number"
          {...register('params.amount')}
          className="form-input"
          defaultValue={500}
          min={0}
          step={100}
        />
        <p className="text-xs text-gray-500 mt-1">
          Only applicable for "Down" and "Up" directions
        </p>
      </div>
    </div>
  );
};