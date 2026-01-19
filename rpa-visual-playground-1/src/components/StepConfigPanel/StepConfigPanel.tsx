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
  const { 
    selectedStepId, 
    selectedStepIsAuth,
    steps, 
    authSteps,
    updateStep, 
    updateAuthStep,
    setSelectedStepId, 
    duplicateStep 
  } = useFlowStore();

  // Use the flag to determine which array to search
  const currentStep = selectedStepIsAuth 
    ? authSteps.find((s) => s.stepId === selectedStepId)
    : steps.find((s) => s.stepId === selectedStepId);
  const isAuthStep = selectedStepIsAuth;

  const { register, handleSubmit, reset, watch } = useForm<FlowStep>({
    defaultValues: currentStep,
  });

  useEffect(() => {
    if (currentStep) {
      reset(currentStep);
    }
  }, [currentStep, reset]);

  // If the panel is mounted but nothing is selected, render nothing.
  // The parent container should close via the `closeAllPanels` event.
  if (!currentStep) return null;

  const onSubmit = (data: FlowStep) => {
    if (isAuthStep) {
      updateAuthStep(selectedStepId!, data);
    } else {
      updateStep(selectedStepId!, data);
    }
  };

  const action = watch('action') || watch('actionType');

  const handleDuplicate = () => {
    duplicateStep(selectedStepId!);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1d29]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-[#1a1d29]">
        <div>
          <h3 className="font-semibold text-gray-200 text-sm">
            {isAuthStep ? '🔐 Auth' : 'Action'} {currentStep.stepId}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 capitalize">
            {currentStep.actionType || currentStep.action}
          </p>
        </div>
        <div className="flex gap-1.5">
          {!isAuthStep && (
            <button
              onClick={handleDuplicate}
              className="p-1.5 hover:bg-gray-800/50 rounded transition-colors"
              title="Duplicate step"
            >
              <Copy size={16} className="text-gray-400" />
            </button>
          )}
          <button
            onClick={() => {
              setSelectedStepId(null);
              // Close the sidebar (prevents the "empty right panel" gap)
              window.dispatchEvent(new CustomEvent('closeAllPanels'));
            }}
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
            <option value="type" className="bg-gray-800 text-white">Type</option>
            <option value="input" className="bg-gray-800 text-white">Input</option>
            <option value="submit" className="bg-gray-800 text-white">Submit</option>
            <option value="wait" className="bg-gray-800 text-white">Wait</option>
            <option value="extract" className="bg-gray-800 text-white">Extract</option>
            <option value="scroll" className="bg-gray-800 text-white">Scroll</option>
            <option value="screenshot" className="bg-gray-800 text-white">Screenshot</option>
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
            placeholder={currentStep.description || "Describe what this step does"}
          />
        </div>

        {/* Value field for auth steps with type/input actions */}
        {isAuthStep && (action === 'type' || action === 'input') && (
          <div>
            <label className="block mb-1 text-xs font-medium text-gray-400">
              Value {currentStep.params.value?.includes('${') && <span className="text-amber-400">(Variable)</span>}
            </label>
            <input
              {...register('params.value')}
              className="w-full px-3 py-2 text-sm text-gray-200 bg-gray-800/50 border border-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder-gray-500"
              placeholder={currentStep.params.value || "Enter value or use ${VARIABLE_NAME}"}
            />
            <p className="mt-1 text-xs text-gray-500">
              Use ${'{'}VARIABLE_NAME{'}'} for environment variables
            </p>
          </div>
        )}

        {/* Action-specific configurations */}
        {action === 'navigate' && <NavigateConfig register={register} />}
        {action === 'click' && <ClickConfig register={register} watch={watch} />}
        {(action === 'input' || action === 'type') && <InputConfig register={register} watch={watch} />}
        {action === 'submit' && <ClickConfig register={register} watch={watch} />}
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