import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useFlowStore } from '../../store/flowStore';
import type { FlowStep } from '../../types/flow.types';
import { X, Copy } from 'lucide-react';
import { NavigateConfig } from './configs/NavigateConfig';
import { ClickConfig } from './configs/ClickConfig';
import { InputConfig } from './configs/InputConfig';
import { WaitConfig } from './configs/WaitConfig';
import { ExtractConfig } from './configs/ExtractConfig';
import { ScrollConfig } from './configs/ScrollConfig';
import { SelectConfig } from './configs/SelectConfig';
import { UploadConfig } from './configs/UploadConfig';

export const StepConfigPanel: React.FC = () => {
  const { selectedStepId, steps, updateStep, setSelectedStepId, duplicateStep } = useFlowStore();

  const selectedStep = steps.find((s) => s.stepId === selectedStepId);

  const { register, handleSubmit, reset, watch, setValue } = useForm<FlowStep>({
    defaultValues: selectedStep,
  });

  useEffect(() => {
    if (selectedStep) {
      reset(selectedStep);
    }
  }, [selectedStep, reset]);

  if (!selectedStep) {
    return (
      <div className="flex items-center justify-center h-full p-8 bg-[#1a1d29]">
        <div className="text-center max-w-xs">
          <div className="mb-3 text-gray-600">
            <svg
              className="w-10 h-10 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  }

  const onSubmit = (data: FlowStep) => {
    updateStep(selectedStepId!, data);
  };

  const action = watch('action');

  const handleDuplicate = () => {
    duplicateStep(selectedStepId!);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1d29]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#1a1d29]">
        <div>
          <h3 className="font-semibold text-gray-200 text-sm">
            Step {selectedStep.stepId}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {selectedStep.action}
          </p>
        </div>
        <div className="flex gap-1.5">
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-gray-800/50 rounded transition-colors"
            title="Duplicate step"
          >
            <Copy size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setSelectedStepId(null)}
            className="p-1.5 hover:bg-gray-800/50 rounded transition-colors"
            title="Close"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 p-4 space-y-4 overflow-y-auto bg-[#1a1d29]"
      >
        {/* Action Type */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Action Type</label>
          <select {...register('action')} className="w-full px-3 py-2 text-sm text-white bg-gray-800/50 border border-gray-700/50 rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="navigate" className="bg-gray-800 text-white">Navigate</option>
            <option value="click" className="bg-gray-800 text-white">Click</option>
            <option value="input" className="bg-gray-800 text-white">Input</option>
            <option value="wait" className="bg-gray-800 text-white">Wait</option>
            <option value="extract" className="bg-gray-800 text-white">Extract</option>
            <option value="scroll" className="bg-gray-800 text-white">Scroll</option>
            <option value="select" className="bg-gray-800 text-white">Select</option>
            <option value="upload" className="bg-gray-800 text-white">Upload</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 text-xs font-medium text-gray-400">Description</label>
          <input
            {...register('description')}
            className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
            placeholder="Describe what this step does"
          />
        </div>

        {/* Action-specific configurations */}
        {action === 'navigate' && <NavigateConfig register={register} />}
        {action === 'click' && <ClickConfig register={register} watch={watch} />}
        {action === 'input' && <InputConfig register={register} watch={watch} />}
        {action === 'wait' && <WaitConfig register={register} watch={watch} />}
        {action === 'extract' && <ExtractConfig register={register} watch={watch} />}
        {action === 'scroll' && <ScrollConfig register={register} />}
        {action === 'select' && <SelectConfig register={register} watch={watch} />}
        {action === 'upload' && <UploadConfig register={register} watch={watch} />}

        {/* Common Settings */}
        <div className="pt-4 mt-6 border-t border-gray-800/50">
          <h4 className="mb-3 text-sm font-semibold text-gray-300">
            Advanced Settings
          </h4>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 text-xs font-medium text-gray-400">Timeout (ms)</label>
              <input
                type="number"
                {...register('params.timeout')}
                className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                defaultValue={30000}
                min={1000}
                step={1000}
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum time to wait for this action to complete
              </p>
            </div>

            <div>
              <label className="block mb-1 text-xs font-medium text-gray-400">Wait After (ms)</label>
              <input
                type="number"
                {...register('params.waitAfter')}
                className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                placeholder="0"
                min={0}
                step={100}
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional delay after this step completes
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="sticky bottom-0 pt-4 bg-[#1a1d29] border-t border-gray-800/50">
          <button
            type="submit"
            className="w-full px-4 py-2 text-sm text-white transition-colors bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            Update Step
          </button>
        </div>
      </form>
    </div>
  );
};