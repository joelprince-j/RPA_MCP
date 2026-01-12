import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface UploadConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const UploadConfig: React.FC<UploadConfigProps> = ({ register, watch }) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Upload Settings</h4>

      <div>
        <label className="form-label">File Input Element ID</label>
        <input
          {...register('params.elementId')}
          className="form-input"
          placeholder="e.g., file-upload"
        />
      </div>

      <div>
        <label className="form-label">File Path *</label>
        <input
          {...register('params.filePath')}
          className="form-input"
          placeholder="/path/to/file.pdf"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Path to the file to upload (supports variables)
        </p>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg space-y-3">
        <h5 className="text-xs font-semibold text-gray-600 uppercase">Selectors</h5>

        <div>
          <label className="form-label">CSS Selector</label>
          <input
            {...register('params.selectors.css')}
            className="form-input"
            placeholder="input[type='file']"
          />
        </div>
      </div>
    </div>
  );
};