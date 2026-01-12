import React from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface NavigateConfigProps {
  register: UseFormRegister<FlowStep>;
}

export const NavigateConfig: React.FC<NavigateConfigProps> = ({ register }) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Navigate Settings</h4>
      
      <div>
        <label className="form-label">Target URL *</label>
        <input
          type="url"
          {...register('params.url')}
          className="form-input"
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