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
  | 'type'
  | 'submit'
  | 'wait'
  | 'extract'
  | 'scroll'
  | 'select'
  | 'upload'
  | 'screenshot';

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
  actionType?: ActionType; // For backward compatibility and new format
  params: StepParams;
  description?: string;
  completed?: boolean;
}

// Auth section types
export interface AuthStep {
  stepId: number;
  actionType: ActionType;
  params: StepParams;
  description?: string;
}

export interface Auth {
  enabled: boolean;
  url?: string;
  steps: AuthStep[];
}

// Return section types
export interface ReturnOutput {
  type: 's3' | 'local' | 'api' | 'database';
  enabled: boolean;
  bucket?: string;
  region?: string;
  credentials?: {
    accessKeyId?: string;
    secretAccessKey?: string;
  };
  path?: string;
  format?: 'json' | 'csv' | 'xml';
  acl?: 'private' | 'public-read' | 'public-read-write';
  [key: string]: any; // For other output types
}

export interface Return {
  format: 'json' | 'csv' | 'xml';
  fields?: string[];
  outputs?: ReturnOutput[];
}

export interface ErrorHandling {
  retryOnFailure?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  captureScreenshotOnError?: boolean;
  continueOnError?: boolean;
  screenshotOnError?: boolean; // Legacy
  fallbackSelectors?: boolean; // Legacy
}

export interface Flow {
  flowId: string;
  name: string;
  description: string;
  startUrl: string;
  // New format
  auth?: Auth;
  actions: FlowStep[];
  return?: Return;
  errorHandling?: ErrorHandling;
  // Legacy format (for backward compatibility)
  steps?: FlowStep[];
  variables?: Record<string, string>;
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