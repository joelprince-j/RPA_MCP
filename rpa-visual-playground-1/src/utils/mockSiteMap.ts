import type { SiteMap } from '../types/sitemap.types'

export const createMockSiteMap = (url: string): SiteMap => {
  return {
    siteMapId: `sitemap_${Date.now()}`,
    baseUrl: url,
    timestamp: new Date().toISOString(),
    version: '1.0',
    pages: [
      {
        pageId: 'page_1',
        url: url,
        title: 'Home Page',
        description: 'Main landing page',
        elements: [
          {
            elementId: 'login_btn',
            type: 'button',
            tagName: 'button',
            selectors: {
              css: '#login-button',
              dataTestId: 'login-btn',
              text: 'Login',
            },
            attributes: {
              id: 'login-button',
              class: 'btn btn-primary',
              type: 'button',
            },
            position: { x: 100, y: 200, width: 120, height: 40 },
            visible: true,
            interactable: true,
            textContent: 'Login',
          },
          {
            elementId: 'email_input',
            type: 'input',
            tagName: 'input',
            selectors: {
              css: '#email',
              dataTestId: 'email-input',
            },
            attributes: {
              id: 'email',
              name: 'email',
              type: 'email',
              placeholder: 'Enter your email',
            },
            position: { x: 100, y: 150, width: 300, height: 40 },
            visible: true,
            interactable: true,
          },
          {
            elementId: 'password_input',
            type: 'input',
            tagName: 'input',
            selectors: {
              css: '#password',
              dataTestId: 'password-input',
            },
            attributes: {
              id: 'password',
              name: 'password',
              type: 'password',
              placeholder: 'Enter your password',
            },
            position: { x: 100, y: 195, width: 300, height: 40 },
            visible: true,
            interactable: true,
          },
          {
            elementId: 'submit_btn',
            type: 'button',
            tagName: 'button',
            selectors: {
              css: '#submit',
              dataTestId: 'submit-btn',
              text: 'Submit',
            },
            attributes: {
              id: 'submit',
              type: 'submit',
            },
            position: { x: 100, y: 240, width: 100, height: 35 },
            visible: true,
            interactable: true,
            textContent: 'Submit',
          },
          {
            elementId: 'search_input',
            type: 'input',
            tagName: 'input',
            selectors: {
              css: '#search',
              dataTestId: 'search-input',
            },
            attributes: {
              id: 'search',
              name: 'search',
              type: 'text',
              placeholder: 'Search...',
            },
            position: { x: 500, y: 50, width: 250, height: 35 },
            visible: true,
            interactable: true,
          },
          {
            elementId: 'menu_link',
            type: 'link',
            tagName: 'a',
            selectors: {
              css: 'a.menu-item',
              text: 'Products',
            },
            attributes: {
              href: '/products',
              class: 'menu-item',
            },
            position: { x: 200, y: 20, width: 80, height: 30 },
            visible: true,
            interactable: true,
            textContent: 'Products',
            leadsTo: `${url}/products`,
          },
        ],
        forms: [
          {
            formId: 'login_form',
            action: '/api/login',
            method: 'POST',
            fields: [
              {
                fieldId: 'email_field',
                name: 'email',
                type: 'email',
                required: true,
                placeholder: 'Enter your email',
                selectors: {
                  css: '#email',
                  dataTestId: 'email-input',
                },
              },
              {
                fieldId: 'password_field',
                name: 'password',
                type: 'password',
                required: true,
                placeholder: 'Enter your password',
                selectors: {
                  css: '#password',
                  dataTestId: 'password-input',
                },
              },
            ],
            submitButton: 'submit_btn',
            selectors: {
              css: '#login-form',
            },
          },
        ],
        navigationLinks: [`${url}/products`, `${url}/about`, `${url}/contact`],
        loadTime: 1200,
        hasInfiniteScroll: false,
        hasLazyLoading: false,
      },
    ],
    globalElements: {
      header: [
        {
          elementId: 'logo',
          type: 'image',
          tagName: 'img',
          selectors: {
            css: '.logo',
            ariaLabel: 'Company Logo',
          },
          attributes: {
            src: '/logo.png',
            alt: 'Company Logo',
          },
          position: { x: 20, y: 10, width: 150, height: 50 },
          visible: true,
          interactable: false,
        },
      ],
      navigation: [
        {
          elementId: 'nav_menu',
          type: 'unknown',
          tagName: 'nav',
          selectors: {
            css: '.main-nav',
          },
          attributes: {
            class: 'main-nav',
          },
          position: { x: 200, y: 20, width: 600, height: 40 },
          visible: true,
          interactable: true,
        },
      ],
    },
    metadata: {
      totalPages: 1,
      totalElements: 6,
      crawlDuration: 5000,
      depth: 1,
      timestamp: new Date().toISOString(),
    },
  }
}
