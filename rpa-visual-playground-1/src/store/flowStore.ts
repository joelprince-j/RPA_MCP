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
  updateStep: (stepId: number, step: Partial<FlowStep>) => void;
  removeStep: (stepId: number) => void;
  reorderSteps: (fromIndex: number, toIndex: number) => void;
  duplicateStep: (stepId: number) => void;

  // Selected step
  selectedStepId: number | null;
  setSelectedStepId: (stepId: number | null) => void;

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

  // Utilities
  reset: () => void;
  exportFlow: () => Flow;
  mergePageIntoSiteMap: (pageMetadata: any) => void;
}

export const useFlowStore = create<FlowState>((set, get) => ({
  // Site Map
  siteMap: null,
  setSiteMap: (siteMap) => set({ siteMap }),
  loadingSiteMap: false,
  setLoadingSiteMap: (loading) => set({ loadingSiteMap: loading }),

  // Flow
  flow: null,
  setFlow: (flow) => set({ flow, steps: flow.steps }),
  updateFlowMetadata: (metadata) => {
    const currentFlow = get().flow;
    if (currentFlow) {
      set({ flow: { ...currentFlow, ...metadata } });
    }
  },

  // Steps
  steps: [],
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

    set({ steps: [...steps, newStep], selectedStepId: newStepId });
  },

  updateStep: (stepId, updatedStep) => {
    const steps = get().steps.map((step) =>
      step.stepId === stepId ? { ...step, ...updatedStep } : step
    );
    set({ steps });
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
    }
  },

  // Selected step
  selectedStepId: null,
  setSelectedStepId: (stepId) => set({ selectedStepId: stepId }),

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

  exportFlow: () => {
    const { flow, steps, siteMap } = get();
    
    return {
      flowId: flow?.flowId || `flow_${Date.now()}`,
      name: flow?.name || 'Untitled Flow',
      description: flow?.description || '',
      startUrl: flow?.startUrl || siteMap?.baseUrl || '',
      steps,
      variables: flow?.variables || {},
      errorHandling: flow?.errorHandling || {
        maxRetries: 3,
        screenshotOnError: true,
        fallbackSelectors: true,
      },
    };
  },
}));