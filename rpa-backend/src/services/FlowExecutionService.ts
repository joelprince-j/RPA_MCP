import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { SiteMapperService, type ElementMetadata, type PageMetadata } from './SiteMapperService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface FlowStep {
  stepId: number;
  action: string;
  params: any;
  description?: string;
}

export interface Flow {
  flowId: string;
  name: string;
  description: string;
  startUrl: string;
  steps: FlowStep[];
  variables?: Record<string, string>;
  errorHandling?: any;
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
    path: string;
    timestamp: string;
  }>;
  extractedData: Record<string, any>;
  currentPage?: PageMetadata;
  pageTransitions?: Array<{
    stepId: number;
    fromUrl: string;
    toUrl: string;
    timestamp: string;
  }>;
}

export class FlowExecutionService {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private screenshotsDir = path.join(__dirname, '../../screenshots');
  private siteMapper: SiteMapperService;
  private currentUrl: string = '';
  private pageTransitions: Array<{
    stepId: number;
    fromUrl: string;
    toUrl: string;
    timestamp: string;
  }> = [];

  constructor() {
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
    this.siteMapper = new SiteMapperService();
  }

  async executeFlow(flow: Flow): Promise<ExecutionReport> {
    const executionId = uuidv4();
    const startTime = new Date().toISOString();

    console.log(`Starting execution: ${executionId} for flow: ${flow.name}`);

    const report: ExecutionReport = {
      executionId,
      flowId: flow.flowId,
      status: 'running',
      startTime,
      stepsCompleted: 0,
      totalSteps: flow.steps.length,
      errors: [],
      screenshots: [],
      extractedData: {},
    };

    try {
      await this.initialize();

      // If a startUrl is defined on the flow, always navigate to it first.
      // This matches how flows are designed in the MCP playground, where
      // the initial page is set via flow.startUrl and steps assume that
      // page is already loaded (e.g. login form fields).
      if (flow.startUrl) {
        console.log(`Navigating to flow startUrl: ${flow.startUrl}`);
        try {
          await this.page!.goto(flow.startUrl, {
            waitUntil: 'networkidle',
            timeout: 30000,
          });
          this.currentUrl = this.page!.url();
        } catch (err) {
          console.error('Error navigating to flow startUrl:', err);
          throw err;
        }
      }

      for (const step of flow.steps) {
        try {
          const previousUrl = this.currentUrl;
          console.log(`Executing step ${step.stepId}: ${step.action}`);
          await this.executeStep(step, report, executionId);
          
          // Wait a bit for any navigation to complete (especially after clicks)
          if (step.action === 'click') {
            await this.page!.waitForTimeout(2000);
          } else {
            await this.page!.waitForTimeout(500);
          }
          
          // Check if URL changed (page navigation occurred)
          const newUrl = this.page!.url();
          if (newUrl !== previousUrl && previousUrl) {
            console.log(`Page transition detected: ${previousUrl} -> ${newUrl}`);
            this.pageTransitions.push({
              stepId: step.stepId,
              fromUrl: previousUrl,
              toUrl: newUrl,
              timestamp: new Date().toISOString(),
            });
            this.currentUrl = newUrl;
            
            // Extract elements from new page
            await this.page!.waitForTimeout(2000); // Wait for page to stabilize
            const currentPageMetadata = await this.extractCurrentPageMetadata();
            report.currentPage = currentPageMetadata;
          } else {
            // Update current URL even if no transition (in case of initial load)
            this.currentUrl = newUrl;
          }
          
          report.stepsCompleted++;
        } catch (error: any) {
          console.error(`Error executing step ${step.stepId}:`, error);
          
          report.errors.push({
            stepId: step.stepId,
            action: step.action,
            error: error.message,
            timestamp: new Date().toISOString(),
          });

          // Capture screenshot on error
          await this.captureScreenshot(executionId, `error_step_${step.stepId}`, report);

          // Decide whether to continue or stop
          if (flow.errorHandling?.stopOnError) {
            break;
          }
        }
      }

      // Add page transitions to report
      report.pageTransitions = this.pageTransitions;
      
      // Extract final page state if we haven't already
      if (this.page && !report.currentPage) {
        report.currentPage = await this.extractCurrentPageMetadata();
      }

      report.status = report.errors.length === 0 ? 'success' : report.errors.length < flow.steps.length ? 'partial' : 'failed';
    } catch (error: any) {
      console.error('Fatal execution error:', error);
      report.status = 'failed';
      report.errors.push({
        stepId: 0,
        action: 'initialization',
        error: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      report.endTime = new Date().toISOString();
      report.duration = Date.now() - new Date(startTime).getTime();
      await this.close();
    }

    return report;
  }

  private async initialize() {
    this.browser = await chromium.launch({ headless: false }); // Set to true for production
    this.page = await this.browser.newPage();
    await this.page.setViewportSize({ width: 1920, height: 1080 });
  }

  private async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
    this.currentUrl = '';
    this.pageTransitions = [];
  }

  private async executeStep(step: FlowStep, report: ExecutionReport, executionId: string) {
    if (!this.page) throw new Error('Page not initialized');

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        switch (step.action) {
          case 'navigate':
            await this.page.goto(step.params.url, { waitUntil: 'networkidle', timeout: 30000 });
            break;

          case 'click':
            // For click actions, wait for potential navigation
            await this.clickElementWithNavigation(step.params);
            break;

          case 'input':
            await this.inputText(step.params);
            break;

          case 'wait':
            await this.waitFor(step.params);
            break;

          case 'extract':
            const data = await this.extractData(step.params);
            report.extractedData[step.params.outputVar || `step_${step.stepId}`] = data;
            break;

          case 'scroll':
            await this.scroll(step.params);
            break;

          case 'select':
            await this.selectOption(step.params);
            break;

          default:
            console.warn(`Unknown action: ${step.action}`);
        }

        // Success, break retry loop
        break;
      } catch (error) {
        attempt++;
        if (attempt >= maxRetries) {
          throw error;
        }
        console.log(`Retry attempt ${attempt} for step ${step.stepId}`);
        await this.page.waitForTimeout(1000);
      }
    }

    // Wait after step if specified
    if (step.params.waitAfter) {
      const waitTime = typeof step.params.waitAfter === 'string' 
        ? parseInt(step.params.waitAfter, 10) || 0
        : step.params.waitAfter;
      if (waitTime > 0) {
        await this.page.waitForTimeout(waitTime);
      }
    }
  }

  private async clickElement(params: any) {
    const selector = this.getSelector(params);
    await this.page!.waitForSelector(selector, { timeout: 10000 });
    await this.page!.click(selector);
  }

  /**
   * Click element and wait for potential navigation
   * This is used for buttons/links that might cause page redirects
   */
  private async clickElementWithNavigation(params: any) {
    const selector = this.getSelector(params);
    await this.page!.waitForSelector(selector, { timeout: 10000 });
    
    const currentUrl = this.page!.url();
    console.log(`Current URL before click: ${currentUrl}`);
    
    // Click the element
    await this.page!.click(selector);
    
    // Wait for navigation - try multiple approaches
    try {
      // Wait for load state (network idle)
      await this.page!.waitForLoadState('networkidle', { timeout: 15000 });
      console.log(`Page loaded after click`);
    } catch (e) {
      console.log(`Navigation timeout or no navigation occurred`);
    }
    
    // Wait a bit more for any dynamic content
    await this.page!.waitForTimeout(2000);
    
    const newUrl = this.page!.url();
    console.log(`Current URL after click: ${newUrl}`);
    
    if (newUrl !== currentUrl) {
      console.log(`✅ URL changed from ${currentUrl} to ${newUrl}`);
    } else {
      console.log(`⚠️ URL did not change after click`);
    }
  }


  private async inputText(params: any) {
    const selector = this.getSelector(params);
    await this.page!.waitForSelector(selector, { timeout: 10000 });
    
    if (params.clearFirst) {
      await this.page!.fill(selector, '');
    }
    
    await this.page!.type(selector, params.value, { delay: 50 });
  }

  private async waitFor(params: any) {
    switch (params.condition) {
      case 'element_visible':
        await this.page!.waitForSelector(params.selectors.css, { state: 'visible', timeout: params.timeout });
        break;
      case 'element_hidden':
        await this.page!.waitForSelector(params.selectors.css, { state: 'hidden', timeout: params.timeout });
        break;
      case 'network_idle':
        await this.page!.waitForLoadState('networkidle');
        break;
      case 'timeout':
        await this.page!.waitForTimeout(params.timeout);
        break;
    }
  }

  private async extractData(params: any): Promise<any> {
    const selector = params.selectors?.css || params.elementId;

    switch (params.dataType) {
      case 'text':
        return await this.page!.textContent(selector);
      
      case 'table':
        return await this.page!.$$eval(selector, (rows: any) => {
          return rows.map((row: any) => 
            Array.from(row.querySelectorAll('td, th')).map((cell: any) => cell.textContent)
          );
        });
      
      case 'list':
        return await this.page!.$$eval(selector, (items: any) => 
          items.map((item: any) => item.textContent)
        );
      
      default:
        return await this.page!.textContent(selector);
    }
  }

  private async scroll(params: any) {
    switch (params.direction) {
      case 'down':
        await this.page!.evaluate((amount) => window.scrollBy(0, amount), params.amount || 500);
        break;
      case 'up':
        await this.page!.evaluate((amount) => window.scrollBy(0, -amount), params.amount || 500);
        break;
      case 'bottom':
        await this.page!.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        break;
      case 'top':
        await this.page!.evaluate(() => window.scrollTo(0, 0));
        break;
    }
  }

  private async selectOption(params: any) {
    const selector = this.getSelector(params);
    await this.page!.selectOption(selector, params.value);
  }

  private getSelector(params: any): string {
    if (params.selectors?.dataTestId) {
      return `[data-testid="${params.selectors.dataTestId}"]`;
    }
    if (params.selectors?.css) {
      return params.selectors.css;
    }
    if (params.selectors?.xpath) {
      return params.selectors.xpath;
    }
    if (params.elementId) {
      return `#${params.elementId}`;
    }
    throw new Error('No valid selector found');
  }

  private async captureScreenshot(executionId: string, name: string, report: ExecutionReport) {
    if (!this.page) return;

    const filename = `${executionId}_${name}_${Date.now()}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    await this.page.screenshot({ path: filepath, fullPage: true });

    report.screenshots.push({
      name,
      path: filepath,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Extract current page metadata (elements, forms, etc.)
   * This is used to provide elements from the current page state
   * after partial flow execution (e.g., after login redirects)
   */
  private async extractCurrentPageMetadata(): Promise<PageMetadata> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const url = this.page.url();
    const title = await this.page.title();
    const loadTime = 0; // Not applicable for in-memory extraction

    // Extract elements using SiteMapperService logic
    const elements = await this.siteMapper.extractElements(this.page);
    
    // Extract forms
    const forms = await this.page.evaluate(() => {
      const forms = document.querySelectorAll('form');
      return Array.from(forms).map((form: any, index) => ({
        formId: form.id || `form_${index + 1}`,
        action: form.action,
        method: form.method || 'GET',
        fields: Array.from(form.querySelectorAll('input, select, textarea')).map((field: any) => ({
          fieldId: field.id || field.name || `field_${Math.random()}`,
          name: field.name,
          type: field.type,
          required: field.required,
          placeholder: field.placeholder,
        })),
      }));
    });

    // Extract navigation links
    const navigationLinks = await this.page.$$eval('a[href]', (links: any[]) =>
      links.map(link => link.href).filter(href => href && !href.startsWith('javascript:'))
    );

    return {
      pageId: `page_${uuidv4()}`,
      url,
      title,
      description: undefined,
      elements,
      forms,
      navigationLinks: [...new Set(navigationLinks)],
      loadTime,
      hasInfiniteScroll: false,
      hasLazyLoading: false,
    };
  }

  /**
   * Execute flow partially up to a specific step and return current page state
   * This allows extracting elements from intermediate pages during flow building
   */
  async executeFlowPartial(flow: Flow, upToStepId?: number): Promise<{
    executionId: string;
    stepsCompleted: number;
    currentPage: PageMetadata;
    currentUrl: string;
  }> {
    const executionId = uuidv4();
    
    try {
      await this.initialize();

      if (flow.startUrl) {
        await this.page!.goto(flow.startUrl, {
          waitUntil: 'networkidle',
          timeout: 30000,
        });
        this.currentUrl = this.page!.url();
      }

      const targetStepId = upToStepId || flow.steps.length;
      let stepsCompleted = 0;

      for (const step of flow.steps) {
        if (step.stepId > targetStepId) {
          break;
        }

        const previousUrl = this.currentUrl;
        await this.executeStep(step, {
          executionId,
          flowId: flow.flowId,
          status: 'running',
          startTime: new Date().toISOString(),
          stepsCompleted: 0,
          totalSteps: flow.steps.length,
          errors: [],
          screenshots: [],
          extractedData: {},
        }, executionId);

        const newUrl = this.page!.url();
        if (newUrl !== previousUrl) {
          this.currentUrl = newUrl;
          await this.page!.waitForTimeout(2000);
        }

        stepsCompleted++;
      }

      const currentPage = await this.extractCurrentPageMetadata();

      return {
        executionId,
        stepsCompleted,
        currentPage,
        currentUrl: this.currentUrl,
      };
    } finally {
      await this.close();
    }
  }
}