import React from 'react';
// import { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { FlowStep } from '../../../types/flow.types';

interface ExtractConfigProps {
  register: UseFormRegister<FlowStep>;
  watch: UseFormWatch<FlowStep>;
}

export const ExtractConfig: React.FC<ExtractConfigProps> = ({ register, watch }) => {
  const dataType = watch('params.dataType');

  return (
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-sm text-gray-700">Extract Settings</h4>

      <div>
        <label className="form-label">Data Type *</label>
        <select {...register('params.dataType')} className="form-select" required>
          <option value="">Select data type</option>
          <option value="text">Text</option>
          <option value="table">Table</option>
          <option value="list">List</option>
        </select>
      </div>

      <div>
        <label className="form-label">Output Variable Name *</label>
        <input
          {...register('params.outputVar')}
          className="form-input"
          placeholder="extractedData"
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          Variable name to store the extracted data
        </p>
      </div>

      <div>
        <label className="form-label">Element Selector *</label>
        <input
          {...register('params.selectors.css')}
          className="form-input"
          placeholder={
            dataType === 'table'
              ? 'table.data-table'
              : dataType === 'list'
              ? 'ul.items li'
              : '.content'
          }
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          CSS selector for the element(s) to extract data from
        </p>
      </div>
    </div>
  );
};