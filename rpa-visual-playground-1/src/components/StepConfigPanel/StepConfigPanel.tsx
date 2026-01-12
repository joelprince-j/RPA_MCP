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
      <div className="flex items-center justify-center h-full p-8 bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-gray-300">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">
            Select a step from the canvas to configure it
          </p>
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
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-gray-50 to-white">
        <h3 className="font-bold text-gray-800">
          Configure Step {selectedStep.stepId}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleDuplicate}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Duplicate step"
          >
            <Copy size={18} className="text-gray-600" />
          </button>
          <button
            onClick={() => setSelectedStepId(null)}
            className="p-1.5 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex-1 p-4 space-y-4 overflow-y-auto"
      >
        {/* Action Type */}
        <div>
          <label className="form-label">Action Type</label>
          <select {...register('action')} className="form-select">
            <option value="navigate">Navigate</option>
            <option value="click">Click</option>
            <option value="input">Input</option>
            <option value="wait">Wait</option>
            <option value="extract">Extract</option>
            <option value="scroll">Scroll</option>
            <option value="select">Select</option>
            <option value="upload">Upload</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <input
            {...register('description')}
            className="form-input"
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
        <div className="pt-4 mt-6 border-t">
          <h4 className="mb-3 text-sm font-semibold text-gray-700">
            Advanced Settings
          </h4>

          <div className="space-y-3">
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
              <p className="mt-1 text-xs text-gray-500">
                Maximum time to wait for this action to complete
              </p>
            </div>

            <div>
              <label className="form-label">Wait After (ms)</label>
              <input
                type="number"
                {...register('params.waitAfter')}
                className="form-input"
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
        <div className="sticky bottom-0 pt-4 bg-white border-t">
          <button
            type="submit"
            className="w-full shadow-sm btn-primary"
          >
            Update Step
          </button>
        </div>
      </form>
    </div>
  );
};