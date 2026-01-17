import { create } from 'zustand';
import type { Flow, FlowStep } from '../types/flow.types';
import type { SiteMap, ElementMetadata } from '../types/sitemap.types';

interface FlowState {
  // Site Map
  siteMap: SiteMap | null;
  setSiteMap: (siteMap: SiteMap) => void;
  loadingSiteMap: boolean;
  setLoadingSiteMap: (loading: boolean) => void;

  // Flow
  flow: Flow | null;
  setFlow: (flow: Flow) => void;
  updateFlowMetadata: (metadata: Partial<Flow>) => void;

  // Steps
  steps: FlowStep[];
  addStep: (step?: Partial<FlowStep>) => void;
  insertStepBefore: (stepId: number, step?: Partial<FlowStep>) => void;
  insertStepAfter: (stepId: number, step?: Partial<FlowStep>) => void;
  updateStep: (stepId: number, step: Partial<FlowStep>) => void;
  removeStep: (stepId: number) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  swapSteps: (stepId1: number, stepId2: number) => void;
  duplicateStep: (stepId: number) => void;

  // Undo/Redo
  history: FlowStep[][];
  historyIndex: number;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  saveHistory: () => void;

  // Selected step
  selectedStepId: number | null;
  selectedStepIsAuth: boolean;
  setSelectedStepId: (stepId: number | null, isAuth?: boolean) => void;

  // Swap mode
  swapModeStepId: number | null;
  setSwapModeStepId: (stepId: number | null) => void;

  // Selected element (from site map)
  selectedElement: ElementMetadata | null;
  setSelectedElement: (element: ElementMetadata | null) => void;

  // UI state
  isPreviewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  isSiteMapOpen: boolean;
  setSiteMapOpen: (open: boolean) => void;

  // Execution state
  isExecuting: boolean;
  setExecuting: (executing: boolean) => void;
  executionId: string | null;
  setExecutionId: (id: string | null) => void;
  isExtractingPage: boolean;
  setExtractingPage: (extracting: boolean) => void;
  
  // Page transition state
  pendingPageTransition: {
    stepId: number;
    fromUrl: string;
    toUrl: string;
    timestamp: string;
  } | null;
  setPendingPageTransition: (transition: {
    stepId: number;
    fromUrl: string;
    toUrl: string;
    timestamp: string;
  } | null) => void;
  
  // Site Map page selection
  selectedPageIndex: number;
  setSelectedPageIndex: (index: number) => void;

  // JSON Editor state
  isJsonEditorOpen: boolean;
  setJsonEditorOpen: (open: boolean) => void;

  // Utilities
  reset: () => void;
  exportFlow: () => Flow;
  importFlow: (flowJson: Flow) => void;
  mergePageIntoSiteMap: (pageMetadata: any) => void;
  
  // Auth section
  authSteps: FlowStep[];
  addAuthStep: (step?: Partial<FlowStep>) => void;
  updateAuthStep: (stepId: number, step: Partial<FlowStep>) => void;
  removeAuthStep: (stepId: number) => void;
  setAuthEnabled: (enabled: boolean) => void;
  setAuthUrl: (url: string) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  // Site Map
  siteMap: null,
  setSiteMap: (siteMap) => set({ siteMap }),
  loadingSiteMap: false,
  setLoadingSiteMap: (loading) => set({ loadingSiteMap: loading }),

  // Flow
  flow: null,
  setFlow: (flow) => {
    // Convert new format to internal format
    const actions = flow.actions || flow.steps || [];
    const steps = actions.map(step => ({
      stepId: step.stepId,
      action: step.actionType || step.action || 'click',
      actionType: step.actionType || step.action || 'click',
      params: step.params,
      description: step.description,
      completed: false,
    }));
    
    const authSteps = flow.auth?.steps?.map(step => ({
      stepId: step.stepId,
      action: step.actionType || 'click',
      actionType: step.actionType || 'click',
      params: step.params,
      description: step.description,
      completed: false,
    })) || [];
    
    set({ 
      flow, 
      steps,
      authSteps,
      // Initialize history with the flow steps
      history: [JSON.parse(JSON.stringify(steps))],
      historyIndex: 0,
    });
  },
  updateFlowMetadata: (metadata) => {
    const currentFlow = get().flow;
    if (currentFlow) {
      set({ flow: { ...currentFlow, ...metadata } });
    }
  },

  // Steps
  steps: [],
  
  // Undo/Redo
  history: [[]],
  historyIndex: 0,

  saveHistory: () => {
    const { steps, history, historyIndex } = get();
    
    // Check if current state is already saved (avoid duplicates)
    const currentStateStr = JSON.stringify(steps);
    const lastSavedStateStr = JSON.stringify(history[historyIndex]);
    
    if (currentStateStr === lastSavedStateStr) {
      // Current state already saved, don't duplicate
      return;
    }
    
    // Remove any future history if we're not at the end
    const newHistory = history.slice(0, historyIndex + 1);
    // Add current state (before the change)
    newHistory.push(JSON.parse(JSON.stringify(steps)));
    
    // Limit history to 50 states
    if (newHistory.length > 50) {
      newHistory.shift();
      // Don't increment index if we removed from start
      set({ history: newHistory });
    } else {
      set({ history: newHistory, historyIndex: newHistory.length - 1 });
    }
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousSteps = JSON.parse(JSON.stringify(history[newIndex]));
      set({ steps: previousSteps, historyIndex: newIndex });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextSteps = JSON.parse(JSON.stringify(history[newIndex]));
      set({ steps: nextSteps, historyIndex: newIndex });
    }
  },

  canUndo: () => {
    const { historyIndex } = get();
    return historyIndex > 0;
  },

  canRedo: () => {
    const { history, historyIndex } = get();
    return historyIndex < history.length - 1;
  },
  addStep: (stepData) => {
    const steps = get().steps;
    const newStepId = steps.length > 0 ? Math.max(...steps.map(s => s.stepId)) + 1 : 1;
    
    const newStep: FlowStep = {
      stepId: newStepId,
      action: stepData?.action || 'click',
      params: {
        timeout: 30000,
        ...stepData?.params,
      },
      description: stepData?.description || '',
    };

    const newSteps = [...steps, newStep];
    set({ steps: newSteps, selectedStepId: newStepId });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  insertStepBefore: (stepId, stepData) => {
    const steps = get().steps;
    const targetIndex = steps.findIndex(s => s.stepId === stepId);
    
    if (targetIndex === -1) return;

    const newStep: FlowStep = {
      stepId: 0, // Will be renumbered
      action: stepData?.action || 'click',
      params: {
        timeout: 30000,
        ...stepData?.params,
      },
      description: stepData?.description || '',
    };

    const newSteps = [...steps];
    newSteps.splice(targetIndex, 0, newStep);

    // Renumber all steps
    const renumberedSteps = newSteps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));

    set({ steps: renumberedSteps, selectedStepId: targetIndex + 1 });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  insertStepAfter: (stepId, stepData) => {
    const steps = get().steps;
    const targetIndex = steps.findIndex(s => s.stepId === stepId);
    
    if (targetIndex === -1) return;

    const newStep: FlowStep = {
      stepId: 0, // Will be renumbered
      action: stepData?.action || 'click',
      params: {
        timeout: 30000,
        ...stepData?.params,
      },
      description: stepData?.description || '',
    };

    const newSteps = [...steps];
    newSteps.splice(targetIndex + 1, 0, newStep);

    // Renumber all steps
    const renumberedSteps = newSteps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));

    set({ steps: renumberedSteps, selectedStepId: targetIndex + 2 });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  updateStep: (stepId, updatedStep) => {
    const steps = get().steps.map((step) =>
      step.stepId === stepId ? { ...step, ...updatedStep } : step
    );
    set({ steps });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  removeStep: (stepId) => {
    const steps = get().steps.filter((step) => step.stepId !== stepId);
    
    // Renumber steps
    const renumberedSteps = steps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));

    set({ 
      steps: renumberedSteps,
      selectedStepId: null,
    });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  reorderSteps: (fromIndex, toIndex) => {
    const steps = [...get().steps];
    const [removed] = steps.splice(fromIndex, 1);
    steps.splice(toIndex, 0, removed);

    // Renumber steps
    const renumberedSteps = steps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));

    set({ steps: renumberedSteps });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  swapSteps: (stepId1, stepId2) => {
    const steps = [...get().steps];
    const index1 = steps.findIndex(s => s.stepId === stepId1);
    const index2 = steps.findIndex(s => s.stepId === stepId2);

    if (index1 === -1 || index2 === -1) return;

    // Swap the steps
    [steps[index1], steps[index2]] = [steps[index2], steps[index1]];

    // Renumber steps
    const renumberedSteps = steps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));

    set({ steps: renumberedSteps, swapModeStepId: null });
    
    // Save the NEW state to history AFTER making changes
    get().saveHistory();
  },

  duplicateStep: (stepId) => {
    const steps = get().steps;
    const stepToDuplicate = steps.find(s => s.stepId === stepId);
    
    if (stepToDuplicate) {
      const newStepId = Math.max(...steps.map(s => s.stepId)) + 1;
      const duplicatedStep: FlowStep = {
        ...stepToDuplicate,
        stepId: newStepId,
        description: `${stepToDuplicate.description} (copy)`,
      };

      set({ steps: [...steps, duplicatedStep] });
      
      // Save the NEW state to history AFTER making changes
      get().saveHistory();
    }
  },

  // Selected step
  selectedStepId: null,
  selectedStepIsAuth: false,
  setSelectedStepId: (stepId, isAuth = false) => set({ selectedStepId: stepId, selectedStepIsAuth: isAuth }),

  // Swap mode
  swapModeStepId: null,
  setSwapModeStepId: (stepId) => set({ swapModeStepId: stepId }),

  // Selected element
  selectedElement: null,
  setSelectedElement: (element) => set({ selectedElement: element }),

  // UI state
  isPreviewOpen: false,
  setPreviewOpen: (open) => set({ isPreviewOpen: open }),
  isSiteMapOpen: true,
  setSiteMapOpen: (open) => set({ isSiteMapOpen: open }),

  // Execution state
  isExecuting: false,
  setExecuting: (executing) => set({ isExecuting: executing }),
  executionId: null,
  setExecutionId: (id) => set({ executionId: id }),
  isExtractingPage: false,
  setExtractingPage: (extracting) => set({ isExtractingPage: extracting }),
  
  // Page transition state
  pendingPageTransition: null,
  setPendingPageTransition: (transition) => set({ pendingPageTransition: transition }),
  
  // Site Map page selection
  selectedPageIndex: 0,
  setSelectedPageIndex: (index) => set({ selectedPageIndex: index }),

  // JSON Editor state
  isJsonEditorOpen: false,
  setJsonEditorOpen: (open) => set({ isJsonEditorOpen: open }),

  // Utilities
  reset: () => set({
    flow: null,
    steps: [],
    selectedStepId: null,
    selectedElement: null,
    isPreviewOpen: false,
    isExecuting: false,
    executionId: null,
    isExtractingPage: false,
    pendingPageTransition: null,
    selectedPageIndex: 0,
  }),


  mergePageIntoSiteMap: (pageMetadata) => {
    const { siteMap } = get();
    if (!siteMap) {
      // Create new site map if none exists
      const newSiteMap = {
        siteMapId: `sitemap_${Date.now()}`,
        baseUrl: pageMetadata.url,
        timestamp: new Date().toISOString(),
        pages: [pageMetadata],
        globalElements: {},
        metadata: {
          totalPages: 1,
          totalElements: pageMetadata.elements.length,
          crawlDuration: 0,
          depth: 0,
          timestamp: new Date().toISOString(),
        },
        version: '1.0',
      };
      set({ siteMap: newSiteMap });
      return;
    }

    // Check if page already exists
    const existingPageIndex = siteMap.pages.findIndex(
      p => p.url === pageMetadata.url
    );

    let updatedPages: any[];
    if (existingPageIndex >= 0) {
      // Update existing page
      updatedPages = [...siteMap.pages];
      updatedPages[existingPageIndex] = pageMetadata;
    } else {
      // Add new page
      updatedPages = [...siteMap.pages, pageMetadata];
    }

    const totalElements = updatedPages.reduce(
      (sum, page) => sum + page.elements.length,
      0
    );

    const updatedSiteMap = {
      ...siteMap,
      pages: updatedPages,
      metadata: {
        ...siteMap.metadata,
        totalPages: updatedPages.length,
        totalElements,
      },
    };

    set({ siteMap: updatedSiteMap });
  },

  // Auth section
  authSteps: [],
  addAuthStep: (stepData) => {
    const authSteps = get().authSteps;
    const newStepId = authSteps.length > 0 ? Math.max(...authSteps.map(s => s.stepId)) + 1 : 1;
    
    const newStep: FlowStep = {
      stepId: newStepId,
      action: stepData?.action || 'click',
      actionType: stepData?.actionType || stepData?.action || 'click',
      params: {
        timeout: 30000,
        ...stepData?.params,
      },
      description: stepData?.description || '',
    };

    set({ authSteps: [...authSteps, newStep] });
    get().saveHistory();
  },
  updateAuthStep: (stepId, updatedStep) => {
    const authSteps = get().authSteps.map((step) =>
      step.stepId === stepId ? { ...step, ...updatedStep } : step
    );
    set({ authSteps });
    get().saveHistory();
  },
  removeAuthStep: (stepId) => {
    const authSteps = get().authSteps.filter((step) => step.stepId !== stepId);
    const renumberedSteps = authSteps.map((step, index) => ({
      ...step,
      stepId: index + 1,
    }));
    set({ authSteps: renumberedSteps });
    get().saveHistory();
  },
  setAuthEnabled: (enabled) => {
    const flow = get().flow;
    if (flow) {
      set({
        flow: {
          ...flow,
          auth: {
            ...flow.auth,
            enabled,
            steps: get().authSteps,
          },
        },
      });
    }
  },
  setAuthUrl: (url) => {
    const flow = get().flow;
    if (flow) {
      set({
        flow: {
          ...flow,
          auth: {
            ...flow.auth,
            url,
            steps: get().authSteps,
          },
        },
      });
    }
  },

  exportFlow: () => {
    const { flow, steps, authSteps, siteMap } = get();
    
    // Convert steps to new format (actions)
    const actions = steps.map(step => ({
      stepId: step.stepId,
      actionType: step.actionType || step.action,
      params: step.params,
      description: step.description,
    }));

    // Convert auth steps
    const auth = flow?.auth?.enabled ? {
      enabled: true,
      url: flow.auth.url,
      steps: authSteps.map(step => ({
        stepId: step.stepId,
        actionType: step.actionType || step.action,
        params: step.params,
        description: step.description,
      })),
    } : undefined;

    return {
      flowId: flow?.flowId || `flow_${Date.now()}`,
      name: flow?.name || 'Untitled Flow',
      description: flow?.description || '',
      startUrl: flow?.startUrl || siteMap?.baseUrl || '',
      ...(auth && { auth }),
      actions,
      return: flow?.return,
      errorHandling: flow?.errorHandling || {
        retryOnFailure: true,
        maxRetries: 3,
        retryDelay: 5000,
        captureScreenshotOnError: true,
        continueOnError: false,
      },
      // Legacy format for backward compatibility
      steps: steps.length > 0 && !actions.length ? steps : undefined,
      variables: flow?.variables,
    };
  },
  
  importFlow: (flowJson: Flow) => {
    // Convert new format to internal format
    const actions = flowJson.actions || flowJson.steps || [];
    const steps = actions.map(step => ({
      stepId: step.stepId,
      action: step.actionType || step.action || 'click',
      actionType: step.actionType || step.action || 'click',
      params: step.params,
      description: step.description,
      completed: false,
    }));

    const authSteps = flowJson.auth?.steps?.map(step => ({
      stepId: step.stepId,
      action: step.actionType || 'click',
      actionType: step.actionType || 'click',
      params: step.params,
      description: step.description,
      completed: false,
    })) || [];

    set({
      flow: flowJson,
      steps,
      authSteps,
      selectedStepId: null,
      history: [JSON.parse(JSON.stringify(steps))],
      historyIndex: 0,
    });
  },
}));