import axios from 'axios';
import type { SiteMap } from '../types/sitemap.types';
import type { Flow, ExecutionReport } from '../types/flow.types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const siteMapApi = {
  // Create new site map with real crawling
  createSiteMap: async (url: string, options?: {
    depth?: number;
    maxPages?: number;
  }): Promise<{ siteMapId: string; siteMap: SiteMap }> => {
    const response = await api.post('/site-maps', {
      url,
      depth: options?.depth || 2,
      maxPages: options?.maxPages || 10,
    });
    return response.data;
  },

  // Get site map by ID
  getSiteMap: async (siteMapId: string): Promise<SiteMap> => {
    const response = await api.get(`/site-maps/${siteMapId}`);
    return response.data;
  },

  // List all site maps
  listSiteMaps: async (): Promise<any[]> => {
    const response = await api.get('/site-maps');
    return response.data;
  },
};

export const flowApi = {
  // Save flow
  saveFlow: async (flow: Flow): Promise<{ flowId: string }> => {
    const response = await api.post('/flows', flow);
    return response.data;
  },

  // Get flow by ID
  getFlow: async (flowId: string): Promise<Flow> => {
    const response = await api.get(`/flows/${flowId}`);
    return response.data;
  },

  // List all flows
  listFlows: async (): Promise<any[]> => {
    const response = await api.get('/flows');
    return response.data;
  },
};

export const executionApi = {
  // Execute flow
  executeFlow: async (flowId: string, variables?: Record<string, string>): Promise<ExecutionReport> => {
    const response = await api.post('/executions', {
      flowId,
      variables,
    });
    return response.data;
  },

  // Execute flow partially and extract current page
  executeFlowPartial: async (flowId: string, upToStepId?: number): Promise<{
    executionId: string;
    stepsCompleted: number;
    currentPage: any;
    currentUrl: string;
  }> => {
    const response = await api.post('/executions/partial', {
      flowId,
      upToStepId,
    });
    return response.data;
  },

  // Get execution report
  getExecutionReport: async (executionId: string): Promise<ExecutionReport> => {
    const response = await api.get(`/executions/${executionId}`);
    return response.data;
  },
};

export default api;