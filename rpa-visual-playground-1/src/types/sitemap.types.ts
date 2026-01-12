export interface ElementPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type ElementType =
  | 'button'
  | 'link'
  | 'input'
  | 'select'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'form'
  | 'image'
  | 'video'
  | 'unknown';

export interface ElementMetadata {
  elementId: string;
  type: ElementType;
  tagName: string;
  selectors: {
    css?: string;
    xpath?: string;
    dataTestId?: string;
    ariaLabel?: string;
    role?: string;
    text?: string;
    fallbacks?: string[];
  };
  attributes: Record<string, string>;
  position: ElementPosition;
  visible: boolean;
  interactable: boolean;
  innerHTML?: string;
  textContent?: string;
  leadsTo?: string;
}

export interface FormField {
  fieldId: string;
  name?: string;
  type: string;
  required: boolean;
  placeholder?: string;
  selectors: ElementMetadata['selectors'];
}

export interface FormMetadata {
  formId: string;
  action?: string;
  method: string;
  fields: FormField[];
  submitButton?: string;
  selectors: ElementMetadata['selectors'];
}

export interface PageMetadata {
  pageId: string;
  url: string;
  title: string;
  description?: string;
  elements: ElementMetadata[];
  forms: FormMetadata[];
  navigationLinks: string[];
  loadTime: number;
  hasInfiniteScroll: boolean;
  hasLazyLoading: boolean;
}

export interface GlobalElements {
  header?: ElementMetadata[];
  footer?: ElementMetadata[];
  navigation?: ElementMetadata[];
  sidebar?: ElementMetadata[];
}

export interface SiteMapMetadata {
  totalPages: number;
  totalElements: number;
  crawlDuration: number;
  depth: number;
  timestamp: string;
}

export interface SiteMap {
  siteMapId: string;
  baseUrl: string;
  timestamp: string;
  pages: PageMetadata[];
  globalElements: GlobalElements;
  metadata: SiteMapMetadata;
  version: string;
}