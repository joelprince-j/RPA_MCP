import { chromium, Browser, Page } from 'playwright';
import { v4 as uuidv4 } from 'uuid';

export interface ElementSelector {
  css?: string;
  xpath?: string;
  dataTestId?: string;
  ariaLabel?: string;
  role?: string;
  text?: string;
  fallbacks?: string[];
}

export interface ElementMetadata {
  elementId: string;
  type: string;
  tagName: string;
  selectors: ElementSelector;
  attributes: Record<string, string>;
  position: { x: number; y: number; width: number; height: number };
  visible: boolean;
  interactable: boolean;
  textContent?: string;
  innerHTML?: string;
  leadsTo?: string;
}

export interface PageMetadata {
  pageId: string;
  url: string;
  title: string;
  description?: string;
  elements: ElementMetadata[];
  forms: any[];
  navigationLinks: string[];
  loadTime: number;
  hasInfiniteScroll: boolean;
  hasLazyLoading: boolean;
}

export interface SiteMap {
  siteMapId: string;
  baseUrl: string;
  timestamp: string;
  pages: PageMetadata[];
  globalElements: any;
  metadata: {
    totalPages: number;
    totalElements: number;
    crawlDuration: number;
    depth: number;
    timestamp: string;
  };
  version: string;
}

export class SiteMapperService {
  private browser: Browser | null = null;

  async initialize() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async mapSite(url: string, options: { depth?: number; maxPages?: number } = {}): Promise<SiteMap> {
    const startTime = Date.now();
    const { depth = 2, maxPages = 10 } = options;

    await this.initialize();

    const siteMapId = uuidv4();
    const visitedUrls = new Set<string>();
    const pages: PageMetadata[] = [];

    try {
      await this.crawlPage(url, 0, depth, maxPages, visitedUrls, pages);

      const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);

      const siteMap: SiteMap = {
        siteMapId,
        baseUrl: url,
        timestamp: new Date().toISOString(),
        pages,
        globalElements: this.identifyGlobalElements(pages),
        metadata: {
          totalPages: pages.length,
          totalElements,
          crawlDuration: Date.now() - startTime,
          depth,
          timestamp: new Date().toISOString(),
        },
        version: '1.0',
      };

      return siteMap;
    } finally {
      await this.close();
    }
  }

  private async crawlPage(
    url: string,
    currentDepth: number,
    maxDepth: number,
    maxPages: number,
    visitedUrls: Set<string>,
    pages: PageMetadata[]
  ): Promise<void> {
    if (currentDepth > maxDepth || pages.length >= maxPages || visitedUrls.has(url)) {
      return;
    }

    visitedUrls.add(url);
    console.log(`Crawling: ${url} (depth: ${currentDepth})`);

    const page = await this.browser!.newPage();
    const loadStartTime = Date.now();

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Wait for dynamic content

      const loadTime = Date.now() - loadStartTime;

      // Extract page metadata
      const pageMetadata = await this.extractPageMetadata(page, url, loadTime);
      pages.push(pageMetadata);

      // If we haven't reached max depth, crawl linked pages
      if (currentDepth < maxDepth && pages.length < maxPages) {
        const baseUrl = new URL(url);
        const internalLinks = pageMetadata.navigationLinks
          .filter(link => link.startsWith(baseUrl.origin))
          .slice(0, 3); // Limit to 3 links per page

        for (const link of internalLinks) {
          await this.crawlPage(link, currentDepth + 1, maxDepth, maxPages, visitedUrls, pages);
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error);
    } finally {
      await page.close();
    }
  }

  private async extractPageMetadata(page: Page, url: string, loadTime: number): Promise<PageMetadata> {
    const pageId = `page_${uuidv4()}`;

    // Get page title
    const title = await page.title();

    // Get meta description
    const description = await page.$eval('meta[name="description"]', (el: any) => el.content).catch(() => undefined);

    // Extract all interactive elements
    const elements = await this.extractElements(page);

    // Extract forms
    const forms = await this.extractForms(page);

    // Extract navigation links
    const navigationLinks = await page.$$eval('a[href]', (links: any[]) =>
      links.map(link => link.href).filter(href => href && !href.startsWith('javascript:'))
    );

    // Check for infinite scroll
    const hasInfiniteScroll = await page.evaluate(() => {
      return document.body.scrollHeight > window.innerHeight * 2;
    });

    return {
      pageId,
      url,
      title,
      description,
      elements,
      forms,
      navigationLinks: [...new Set(navigationLinks)],
      loadTime,
      hasInfiniteScroll,
      hasLazyLoading: false,
    };
  }

  async extractElements(page: Page): Promise<ElementMetadata[]> {
    const elements = await page.evaluate(() => {
      const interactiveSelectors = [
        'button',
        'a[href]',
        'input',
        'select',
        'textarea',
        '[role="button"]',
        '[onclick]',
        '[role="link"]',
      ];

      const allElements: any[] = [];

      interactiveSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el: any) => {
          const rect = el.getBoundingClientRect();
          
          // Skip invisible elements
          if (rect.width === 0 || rect.height === 0) return;

          const computedStyle = window.getComputedStyle(el);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') return;

          // Extract attributes
          const attributes: Record<string, string> = {};
          Array.from(el.attributes).forEach((attr: any) => {
            attributes[attr.name] = attr.value;
          });

          // Determine element type
          let type = 'unknown';
          if (el.tagName.toLowerCase() === 'button' || el.getAttribute('role') === 'button') {
            type = 'button';
          } else if (el.tagName.toLowerCase() === 'a') {
            type = 'link';
          } else if (el.tagName.toLowerCase() === 'input') {
            type = el.getAttribute('type') || 'input';
          } else if (el.tagName.toLowerCase() === 'select') {
            type = 'select';
          } else if (el.tagName.toLowerCase() === 'textarea') {
            type = 'textarea';
          }

          allElements.push({
            tagName: el.tagName.toLowerCase(),
            type,
            attributes,
            textContent: el.textContent?.trim().substring(0, 100) || '',
            innerHTML: el.innerHTML?.substring(0, 200) || '',
            position: {
              x: Math.round(rect.x),
              y: Math.round(rect.y),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            },
            visible: rect.width > 0 && rect.height > 0,
          });
        });
      });

      return allElements;
    });

    // Generate selectors for each element
    return elements.map((el, index) => {
      const elementId = el.attributes.id || `elem_${index + 1}`;
      
      const selectors: ElementSelector = {
        css: this.generateCSSSelector(el),
        xpath: this.generateXPath(el, index),
        dataTestId: el.attributes['data-testid'],
        ariaLabel: el.attributes['aria-label'],
        role: el.attributes['role'],
        text: el.textContent,
      };

      return {
        elementId,
        type: el.type,
        tagName: el.tagName,
        selectors,
        attributes: el.attributes,
        position: el.position,
        visible: el.visible,
        interactable: true,
        textContent: el.textContent,
        innerHTML: el.innerHTML,
      };
    });
  }

  private generateCSSSelector(element: any): string {
    if (element.attributes.id) {
      return `#${element.attributes.id}`;
    }
    
    if (element.attributes['data-testid']) {
      return `[data-testid="${element.attributes['data-testid']}"]`;
    }

    if (element.attributes.class) {
      const classes = element.attributes.class.split(' ').filter((c: string) => c.length > 0);
      if (classes.length > 0) {
        return `${element.tagName}.${classes[0]}`;
      }
    }

    return element.tagName;
  }

  private generateXPath(element: any, index: number): string {
    if (element.attributes.id) {
      return `//${element.tagName}[@id="${element.attributes.id}"]`;
    }
    return `//${element.tagName}[${index + 1}]`;
  }

  private async extractForms(page: Page): Promise<any[]> {
    return await page.evaluate(() => {
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
  }

  private identifyGlobalElements(pages: PageMetadata[]): any {
    // Simple implementation: elements that appear in 70%+ of pages
    const elementFrequency = new Map<string, number>();

    pages.forEach(page => {
      page.elements.forEach(element => {
        const key = element.selectors.css || element.elementId;
        elementFrequency.set(key, (elementFrequency.get(key) || 0) + 1);
      });
    });

    const threshold = pages.length * 0.7;
    const globalElementKeys = Array.from(elementFrequency.entries())
      .filter(([_, count]) => count >= threshold)
      .map(([key]) => key);

    return {
      header: [],
      navigation: [],
      footer: [],
    };
  }
}