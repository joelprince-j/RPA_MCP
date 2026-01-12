import React, { useState } from 'react';
import { useFlowStore } from '../../store/flowStore';
import { ElementCard } from './ElementCard';
import { Globe, Search, Filter, RefreshCw, Loader2 } from 'lucide-react';
import { siteMapApi } from '../../services/api';

export const SiteMapViewer: React.FC = () => {
  const { 
    siteMap, 
    setSiteMap, 
    loadingSiteMap, 
    setLoadingSiteMap,
    selectedPageIndex,
    setSelectedPageIndex,
  } = useFlowStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [customUrl, setCustomUrl] = useState('https://example.com');

  const handleLoadSiteMap = async () => {
    if (!customUrl) {
      alert('Please enter a URL');
      return;
    }

    setLoadingSiteMap(true);
    
    try {
      console.log('Starting site map for:', customUrl);
      
      // Call real API
      const result = await siteMapApi.createSiteMap(customUrl, {
        depth: 2,
        maxPages: 10,
      });
      
      console.log('Site map created:', result);
      setSiteMap(result.siteMap);
      alert(`Site map created successfully! Found ${result.siteMap.metadata.totalElements} elements`);
    } catch (error: any) {
      console.error('Error loading site map:', error);
      alert('Failed to load site map: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoadingSiteMap(false);
    }
  };

  const currentPage = siteMap?.pages[selectedPageIndex];

  const filteredElements = currentPage?.elements.filter((elem) => {
    const matchesSearch = searchTerm
      ? elem.elementId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elem.textContent?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elem.type.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesFilter = filterType === 'all' || elem.type === filterType;

    return matchesSearch && matchesFilter;
  });

  if (!siteMap) {
    return (
      <div className="h-full flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md w-full">
            <div className="text-blue-400 mb-6">
              <Globe size={80} className="mx-auto" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">
              Map a Website
            </h3>
            <p className="text-gray-600 mb-6 text-sm">
              Enter a URL to crawl the website and extract all interactive elements using Playwright
            </p>
            
            {/* URL INPUT */}
            <div className="mb-6">
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="https://example.com"
                disabled={loadingSiteMap}
              />
              <p className="text-xs text-gray-500 mt-2 text-left">
                Try: example.com, httpbin.org/forms/post, or your own site
              </p>
            </div>
            
            {/* LOAD BUTTON */}
            <button
              onClick={handleLoadSiteMap}
              disabled={loadingSiteMap || !customUrl}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {loadingSiteMap ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Mapping Website...</span>
                </>
              ) : (
                <>
                  <Globe size={20} />
                  <span>Map Website</span>
                </>
              )}
            </button>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 font-medium mb-2">
                ⚡ What happens when you map:
              </p>
              <ul className="text-xs text-blue-700 text-left space-y-1">
                <li>• Playwright crawls the website</li>
                <li>• Extracts all buttons, inputs, links</li>
                <li>• Generates CSS selectors & XPath</li>
                <li>• Takes 10-30 seconds depending on site size</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b space-y-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Site Map</h2>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">{siteMap.baseUrl}</p>
          </div>
          <button
            onClick={handleLoadSiteMap}
            disabled={loadingSiteMap}
            className="p-2 hover:bg-gray-200 rounded transition-colors disabled:opacity-50"
            title="Refresh site map"
          >
            <RefreshCw size={18} className={`text-gray-600 ${loadingSiteMap ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search elements..."
            className="w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="flex-1 text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Elements ({currentPage?.elements.length || 0})</option>
            <option value="button">Buttons</option>
            <option value="input">Inputs</option>
            <option value="link">Links</option>
            <option value="select">Dropdowns</option>
          </select>
        </div>

        {/* Page Selector */}
        {siteMap.pages.length > 0 && (
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              Page {siteMap.pages.length > 1 ? `(${siteMap.pages.length} pages)` : ''}
            </label>
            <select
              value={selectedPageIndex}
              onChange={(e) => setSelectedPageIndex(Number(e.target.value))}
              className="w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {siteMap.pages.map((page, index) => (
                <option key={page.pageId} value={index}>
                  {page.title || new URL(page.url).pathname || page.url}
                </option>
              ))}
            </select>
            {currentPage && (
              <p className="text-xs text-gray-400 mt-1 truncate" title={currentPage.url}>
                {currentPage.url}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Elements List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {filteredElements && filteredElements.length > 0 ? (
          <>
            <p className="text-xs text-gray-500 mb-2">
              Click any element to add it to your flow
            </p>
            {filteredElements.map((element) => (
              <ElementCard key={element.elementId} element={element} />
            ))}
          </>
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 text-sm">No elements found</p>
            <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="p-4 border-t bg-gradient-to-r from-gray-50 to-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">
              {siteMap.metadata.totalPages}
            </div>
            <div className="text-xs text-gray-500">Pages</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {currentPage?.elements.length || 0}
            </div>
            <div className="text-xs text-gray-500">Elements</div>
          </div>
          <div>
            <div className="text-lg font-bold text-purple-600">
              {currentPage?.forms.length || 0}
            </div>
            <div className="text-xs text-gray-500">Forms</div>
          </div>
        </div>
      </div>
    </div>
  );
};
