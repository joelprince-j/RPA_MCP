export interface ElementSelector {
  css?: string;
  xpath?: string;
  dataTestId?: string;
  ariaLabel?: string;
  role?: string;
  text?: string;
  fallbacks?: string[];
}

export type ActionType =
  | 'navigate'
  | 'click'
  | 'input'
  | 'wait'
  | 'extract'
  | 'scroll'
  | 'select'
  | 'upload';

export interface StepParams {
  elementId?: string;
  selectors?: ElementSelector;
  value?: any;
  url?: string;
  condition?: string;
  timeout?: number;
  waitAfter?: number;
  clearFirst?: boolean;
  dataType?: 'text' | 'table' | 'list';
  outputVar?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'bottom';
  amount?: number;
  filePath?: string;
}

export interface FlowStep {
  stepId: number;
  action: ActionType;
  params: StepParams;
  description?: string;
  completed?: boolean;
}

export interface ErrorHandling {
  maxRetries: number;
  screenshotOnError: boolean;
  fallbackSelectors: boolean;
}

export interface Flow {
  flowId: string;
  name: string;
  description: string;
  startUrl: string;
  steps: FlowStep[];
  variables?: Record<string, string>;
  errorHandling?: ErrorHandling;
}

export interface ExecutionReport {
  executionId: string;
  flowId: string;
  status: 'success' | 'failed' | 'partial' | 'running';
  startTime: string;
  endTime?: string;
  duration?: number;
  stepsCompleted: number;
  totalSteps: number;
  errors: Array<{
    stepId: number;
    action: string;
    error: string;
    timestamp: string;
  }>;
  screenshots: Array<{
    name: string;
    s3Key: string;
    timestamp: string;
  }>;
  extractedData: Record<string, any>;
}