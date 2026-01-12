import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface WaitConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const WaitConfig: React.FC<WaitConfigProps> = ({ register, watch }) => {
  const condition = watch('params.condition');

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Wait Settings</h4>

      <div>
        <label className="form-label">Wait Condition *</label>
        <select {...register('params.condition')} className="form-select" required>
          <option value="">Select condition</option>
          <option value="element_visible">Element Visible</option>
          <option value="element_hidden">Element Hidden</option>
          <option value="network_idle">Network Idle</option>
          <option value="timeout">Fixed Timeout</option>
        </select>
      </div>

      {(condition === 'element_visible' || condition === 'element_hidden') && (
        <div>
          <label className="form-label">Element Selector *</label>
          <input
            {...register('params.selectors.css')}
            className="form-input"
            placeholder=".loading-spinner"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            CSS selector for the element to wait for
          </p>
        </div>
      )}

      <div>
        <label className="form-label">Timeout (ms)</label>
        <input
          type="number"
          {...register('params.timeout')}
          className="form-input"
          defaultValue={30000}
          min={1000}
          step={1000}
        />
        <p className="text-xs text-gray-500 mt-1">
          Maximum time to wait for the condition
        </p>
      </div>
    </div>
  );
};