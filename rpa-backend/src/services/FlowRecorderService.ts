import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';
import type { FlowStep, Flow } from './FlowExecutionService';

export interface RecordedAction {
  stepId: number;
  action: 'click' | 'input' | 'select' | 'navigate' | 'wait';
  timestamp: number;
  selector?: string;
  value?: string;
  url?: string;
  description?: string;
}

export interface RecordingSession {
  sessionId: string;
  browser: Browser;
  page: Page;
  startUrl: string;
  actions: RecordedAction[];
  startTime: number;
  stepCounter: number;
}

export class FlowRecorderService {
  private sessions: Map<string, RecordingSession> = new Map();

  /**
   * Start a new recording session
   */
  async startRecording(url: string): Promise<string> {
    const sessionId = uuidv4();
    const browser = await chromium.launch({ 
      headless: false,
      args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1920, height: 1080 });

    const session: RecordingSession = {
      sessionId,
      browser,
      page,
      startUrl: url,
      actions: [],
      startTime: Date.now(),
      stepCounter: 1,
    };

    // Navigate to the URL
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Set up event listeners to record actions
    await this.setupRecordingListeners(page, session);

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  /**
   * Set up event listeners to capture user interactions
   * Uses CDP (Chrome DevTools Protocol) to intercept user actions
   */
  private async setupRecordingListeners(page: Page, session: RecordingSession) {
    // Inject script to capture DOM events - store serializable data immediately
    const injectRecorderScript = async () => {
      await page.evaluate(() => {
        // Capture clicks - store element data immediately (serializable)
        document.addEventListener('click', (e) => {
          const target = e.target as HTMLElement;
          if (!target) return;
          
          (window as any).__playwrightRecorder = (window as any).__playwrightRecorder || { clicks: [] };
          
          // Extract serializable data immediately
          const elementData = {
            id: target.id || '',
            tagName: target.tagName || '',
            className: target.className || '',
            name: (target as HTMLInputElement).name || '',
            dataTestId: target.getAttribute('data-testid') || '',
            textContent: target.textContent?.trim().substring(0, 100) || '',
            ariaLabel: target.getAttribute('aria-label') || '',
            type: (target as HTMLInputElement).type || '',
            timestamp: Date.now(),
          };
          
          (window as any).__playwrightRecorder.clicks.push(elementData);
        }, true);

        // Capture input changes
        document.addEventListener('input', (e) => {
          const target = e.target as HTMLInputElement;
          if (!target) return;
          
          (window as any).__playwrightRecorder = (window as any).__playwrightRecorder || { inputs: [] };
          
          const elementData = {
            id: target.id || '',
            tagName: target.tagName || '',
            className: target.className || '',
            name: target.name || '',
            dataTestId: target.getAttribute('data-testid') || '',
            type: target.type || '',
            value: target.value || '',
            timestamp: Date.now(),
          };
          
          (window as any).__playwrightRecorder.inputs.push(elementData);
        }, true);

        // Capture select changes
        document.addEventListener('change', (e) => {
          const target = e.target as HTMLSelectElement;
          if (!target || target.tagName !== 'SELECT') return;
          
          (window as any).__playwrightRecorder = (window as any).__playwrightRecorder || { selects: [] };
          
          const elementData = {
            id: target.id || '',
            tagName: target.tagName || '',
            className: target.className || '',
            name: target.name || '',
            dataTestId: target.getAttribute('data-testid') || '',
            value: target.value || '',
            timestamp: Date.now(),
          };
          
          (window as any).__playwrightRecorder.selects.push(elementData);
        }, true);
      });
    };

    // Inject the script initially
    await injectRecorderScript();

    // Re-inject script after navigation to new pages
    page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        await page.waitForTimeout(500); // Wait for page to load
        await injectRecorderScript();
      }
    });

    // Poll for recorded events
    const pollInterval = setInterval(async () => {
      try {
        const recorder = await page.evaluate(() => (window as any).__playwrightRecorder);
        
        if (!recorder) return;
        
        // Log total actions found
        const totalEvents = (recorder.clicks?.length || 0) + (recorder.inputs?.length || 0) + (recorder.selects?.length || 0);
        if (totalEvents > 0) {
          console.log(`Polling: Found ${totalEvents} new events (${recorder.clicks?.length || 0} clicks, ${recorder.inputs?.length || 0} inputs, ${recorder.selects?.length || 0} selects)`);
        }
        
        if (recorder?.clicks?.length > 0) {
          for (const click of recorder.clicks) {
            try {
              // Generate selector from stored element data
              const selector = this.generateSelectorFromData(click);
              const description = click.textContent || click.ariaLabel || click.id || click.tagName.toLowerCase();
              
              session.actions.push({
                stepId: session.stepCounter++,
                action: 'click',
                timestamp: click.timestamp,
                selector,
                description: `Click ${description}`,
              });
              console.log(`Recorded click action: ${description} (selector: ${selector})`);
            } catch (error) {
              console.error('Error processing click:', error);
            }
          }
          await page.evaluate(() => {
            if ((window as any).__playwrightRecorder) {
              (window as any).__playwrightRecorder.clicks = [];
            }
          });
        }

        if (recorder?.inputs?.length > 0) {
          for (const input of recorder.inputs) {
            try {
              // Generate selector from stored element data
              const selector = this.generateSelectorFromData(input);
              
              session.actions.push({
                stepId: session.stepCounter++,
                action: 'input',
                timestamp: input.timestamp,
                selector,
                value: input.value || '',
                description: `Input text in ${selector}`,
              });
              console.log(`Recorded input action: ${selector} = ${input.value}`);
            } catch (error) {
              console.error('Error processing input:', error);
            }
          }
          await page.evaluate(() => {
            if ((window as any).__playwrightRecorder) {
              (window as any).__playwrightRecorder.inputs = [];
            }
          });
        }

        if (recorder?.selects?.length > 0) {
          for (const select of recorder.selects) {
            try {
              // Generate selector from stored element data
              const selector = this.generateSelectorFromData(select);
              
              session.actions.push({
                stepId: session.stepCounter++,
                action: 'select',
                timestamp: select.timestamp,
                selector,
                value: select.value || '',
                description: `Select option in ${selector}`,
              });
              console.log(`Recorded select action: ${selector} = ${select.value}`);
            } catch (error) {
              console.error('Error processing select:', error);
            }
          }
          await page.evaluate(() => {
            if ((window as any).__playwrightRecorder) {
              (window as any).__playwrightRecorder.selects = [];
            }
          });
        }
      } catch (error) {
        console.error('Error polling recorder events:', error);
      }
    }, 500); // Poll every 500ms

    // Store interval ID for cleanup
    (session as any).pollInterval = pollInterval;

    // Record navigation (separate from the one that re-injects script)
    page.on('framenavigated', async (frame) => {
      if (frame === page.mainFrame()) {
        const url = frame.url();
        // Only record navigation if it's different from start URL and we haven't already recorded it
        if (url !== session.startUrl && !session.actions.some(a => a.url === url && a.action === 'navigate')) {
          session.actions.push({
            stepId: session.stepCounter++,
            action: 'navigate',
            timestamp: Date.now(),
            url,
            description: `Navigate to ${url}`,
          });
          console.log(`Recorded navigation: ${url}`);
        }
      }
    });
  }

  /**
   * Generate selector from stored element data (serializable)
   */
  private generateSelectorFromData(elementData: any): string {
    try {
      // Try ID first
      if (elementData.id) {
        return `#${elementData.id}`;
      }

      // Try data-testid
      if (elementData.dataTestId) {
        return `[data-testid="${elementData.dataTestId}"]`;
      }

      // Try name attribute (for inputs/selects)
      if (elementData.name && (elementData.tagName === 'INPUT' || elementData.tagName === 'SELECT')) {
        return `[name="${elementData.name}"]`;
      }

      // Try class name
      if (elementData.className) {
        const classes = elementData.className.trim().split(/\s+/).filter((c: string) => c && c.length > 0);
        if (classes.length > 0) {
          return `${elementData.tagName.toLowerCase()}.${classes[0]}`;
        }
      }

      // Fallback to tag name
      return elementData.tagName ? elementData.tagName.toLowerCase() : 'body';
    } catch {
      return 'body';
    }
  }

  /**
   * Generate selector from element handle (legacy method, kept for compatibility)
   */
  private async generateSelectorFromElement(page: Page, elementHandle: any): Promise<string> {
    try {
      return await page.evaluate((el) => {
        if (!el) return 'body';
        if (el.id) return `#${el.id}`;
        if (el.getAttribute('data-testid')) {
          return `[data-testid="${el.getAttribute('data-testid')}"]`;
        }
        if (el.name && (el.tagName === 'INPUT' || el.tagName === 'SELECT')) {
          return `[name="${el.name}"]`;
        }
        // Generate path
        const path: string[] = [];
        let current: any = el;
        while (current && current !== document.body) {
          let selector = current.tagName.toLowerCase();
          if (current.id) {
            selector += `#${current.id}`;
            path.unshift(selector);
            break;
          }
          if (current.className) {
            const classes = current.className.trim().split(/\s+/).filter((c: string) => c.length > 0);
            if (classes.length > 0) {
              selector += `.${classes[0]}`;
            }
          }
          path.unshift(selector);
          current = current.parentElement;
        }
        return path.join(' > ') || 'body';
      }, elementHandle);
    } catch {
      return 'body';
    }
  }

  /**
   * Get description from element handle
   */
  private async getElementDescriptionFromElement(page: Page, elementHandle: any): Promise<string> {
    try {
      return await page.evaluate((el) => {
        if (!el) return 'element';
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          return el.placeholder || el.name || el.type || 'input';
        }
        if (el.tagName === 'BUTTON') {
          return el.textContent?.trim() || el.getAttribute('aria-label') || 'button';
        }
        if (el.tagName === 'SELECT') {
          return el.name || 'select';
        }
        return el.textContent?.trim()?.substring(0, 50) || el.tagName.toLowerCase();
      }, elementHandle);
    } catch {
      return 'element';
    }
  }

  /**
   * Generate a CSS selector for an element (legacy method, kept for compatibility)
   */
  private async generateSelector(page: Page, element: any): Promise<string> {
    try {
      // Try ID first
      const id = await page.evaluate((el) => el.id, element);
      if (id) return `#${id}`;

      // Try data-testid
      const testId = await page.evaluate((el) => el.getAttribute('data-testid'), element);
      if (testId) return `[data-testid="${testId}"]`;

      // Try name attribute
      const name = await page.evaluate((el) => el.getAttribute('name'), element);
      if (name) return `[name="${name}"]`;

      // Generate CSS selector using Playwright's built-in method
      const selector = await page.evaluate((el) => {
        const path: string[] = [];
        while (el && el.nodeType === Node.ELEMENT_NODE) {
          let selector = el.nodeName.toLowerCase();
          if (el.id) {
            selector += `#${el.id}`;
            path.unshift(selector);
            break;
          }
          if (el.className) {
            const classes = el.className.trim().split(/\s+/).filter((c: string) => c && c.length > 0);
            if (classes.length > 0) {
              selector += `.${classes[0]}`;
            }
          }
          let sibling = el;
          let nth = 1;
          while (sibling.previousElementSibling) {
            sibling = sibling.previousElementSibling;
            if (sibling.nodeName === el.nodeName) nth++;
          }
          if (nth > 1) selector += `:nth-of-type(${nth})`;
          path.unshift(selector);
          el = el.parentElement as any;
        }
        return path.join(' > ');
      }, element);

      return selector || 'body';
    } catch (error) {
      console.error('Error generating selector:', error);
      return 'body';
    }
  }

  /**
   * Get a human-readable description of an element
   */
  private async getElementDescription(page: Page, element: any): Promise<string> {
    try {
      const text = await page.evaluate((el) => {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          return el.placeholder || el.name || el.type || 'input';
        }
        if (el.tagName === 'BUTTON') {
          return el.textContent?.trim() || el.getAttribute('aria-label') || 'button';
        }
        if (el.tagName === 'SELECT') {
          return el.name || 'select';
        }
        return el.textContent?.trim() || el.tagName.toLowerCase();
      }, element);
      
      return text?.substring(0, 50) || 'element';
    } catch {
      return 'element';
    }
  }

  /**
   * Stop recording and convert to Flow JSON format
   */
  async stopRecording(sessionId: string): Promise<Flow> {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Recording session ${sessionId} not found`);
    }

    // Clear polling interval
    if ((session as any).pollInterval) {
      clearInterval((session as any).pollInterval);
    }

    // Do one final poll to catch any remaining events
    try {
      const recorder = await session.page.evaluate(() => (window as any).__playwrightRecorder);
      console.log(`Final poll: Found ${recorder?.clicks?.length || 0} clicks, ${recorder?.inputs?.length || 0} inputs, ${recorder?.selects?.length || 0} selects`);
      
      if (recorder?.clicks?.length > 0) {
        for (const click of recorder.clicks) {
          const selector = this.generateSelectorFromData(click);
          const description = click.textContent || click.ariaLabel || click.id || click.tagName.toLowerCase();
          session.actions.push({
            stepId: session.stepCounter++,
            action: 'click',
            timestamp: click.timestamp,
            selector,
            description: `Click ${description}`,
          });
        }
      }
      
      if (recorder?.inputs?.length > 0) {
        for (const input of recorder.inputs) {
          const selector = this.generateSelectorFromData(input);
          session.actions.push({
            stepId: session.stepCounter++,
            action: 'input',
            timestamp: input.timestamp,
            selector,
            value: input.value || '',
            description: `Input text in ${selector}`,
          });
        }
      }
      
      if (recorder?.selects?.length > 0) {
        for (const select of recorder.selects) {
          const selector = this.generateSelectorFromData(select);
          session.actions.push({
            stepId: session.stepCounter++,
            action: 'select',
            timestamp: select.timestamp,
            selector,
            value: select.value || '',
            description: `Select option in ${selector}`,
          });
        }
      }
    } catch (error) {
      console.error('Error in final poll:', error);
    }

    // Sort actions by timestamp to ensure correct order
    session.actions.sort((a, b) => a.timestamp - b.timestamp);
    
    // Renumber steps sequentially
    session.actions.forEach((action, index) => {
      action.stepId = index + 1;
    });

    console.log(`Total actions recorded: ${session.actions.length}`);
    console.log("Session Actions:", JSON.stringify(session.actions, null, 2));

    // Close browser
    await session.browser.close();
    // Convert recorded actions to FlowStep format
    const steps: FlowStep[] = session.actions.map((action) => {
      const step: FlowStep = {
        stepId: action.stepId,
        action: action.action,
        description: action.description || `${action.action} action`,
        params: {
          timeout: 30000,
        },
      };

      // Add action-specific params
      if (action.action === 'click' || action.action === 'input' || action.action === 'select') {
        step.params.elementId = this.extractElementId(action.selector || '');
        step.params.selectors = {
          css: action.selector || '',
          xpath: this.cssToXPath(action.selector || ''),
          text: '',
          dataTestId: this.extractDataTestId(action.selector || ''),
          ariaLabel: '',
        };
      }

      if (action.action === 'input') {
        step.params.value = action.value || '';
        step.params.clearFirst = true;
      }

      if (action.action === 'select') {
        step.params.value = action.value || '';
      }

      if (action.action === 'navigate') {
        step.params.url = action.url || '';
      }

      return step;
    });

    // Remove session
    this.sessions.delete(sessionId);

    return {
      flowId: `flow_${Date.now()}`,
      name: 'Recorded Flow',
      description: `Auto-recorded flow from ${session.startUrl}`,
      startUrl: session.startUrl,
      steps,
      variables: {},
      errorHandling: {
        maxRetries: 3,
        screenshotOnError: true,
        fallbackSelectors: true,
      },
    };
  }

  /**
   * Get current recording status
   */
  getRecordingStatus(sessionId: string): { sessionId: string; actionsCount: number; currentUrl: string } | null {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId,
      actionsCount: session.actions.length,
      currentUrl: session.page.url(),
    };
  }

  /**
   * Cancel/abort a recording session
   */
  async cancelRecording(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Clear polling interval
      if ((session as any).pollInterval) {
        clearInterval((session as any).pollInterval);
      }
      await session.browser.close();
      this.sessions.delete(sessionId);
    }
  }

  /**
   * Extract element ID from selector
   */
  private extractElementId(selector: string): string {
    const idMatch = selector.match(/#([a-zA-Z][\w-]*)/);
    return idMatch ? idMatch[1] : selector.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20);
  }

  /**
   * Extract data-testid from selector
   */
  private extractDataTestId(selector: string): string {
    const match = selector.match(/\[data-testid="([^"]+)"\]/);
    return match ? match[1] : '';
  }

  /**
   * Simple CSS to XPath converter (basic)
   */
  private cssToXPath(cssSelector: string): string {
    // Basic conversion - can be enhanced
    if (cssSelector.startsWith('#')) {
      const id = cssSelector.substring(1);
      return `//*[@id="${id}"]`;
    }
    if (cssSelector.startsWith('.')) {
      const className = cssSelector.substring(1);
      return `//*[@class="${className}"]`;
    }
    if (cssSelector.includes('[')) {
      const tag = cssSelector.split('[')[0] || '*';
      return `//${tag}${cssSelector.substring(cssSelector.indexOf('['))}`;
    }
    return `//${cssSelector}`;
  }
}

