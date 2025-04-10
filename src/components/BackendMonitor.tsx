
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { scraperService } from '@/utils/scraping/ScraperService';
import { Button } from '@/components/ui/button';
import { getAllPlatforms } from '@/utils/types';

// BackendMonitor component to debug and configure the backend behavior
const BackendMonitor = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [useMockData, setUseMockData] = useState(() => 
    localStorage.getItem('use_mock_data') === 'true'
  );
  
  // Update localStorage when useMockData changes
  useEffect(() => {
    localStorage.setItem('use_mock_data', useMockData ? 'true' : 'false');
  }, [useMockData]);

  const toggleMockData = () => {
    setUseMockData(prev => !prev);
    toast({
      title: `${!useMockData ? "Using mock data" : "Using real data"}`,
      description: `${!useMockData 
        ? "Search will use mock data instead of real scraping" 
        : "Search will attempt to scrape real data from platforms"}`,
    });
  };

  const clearCache = () => {
    scraperService.clearCache();
  };

  // If closed, just show a tab that can be clicked to open
  if (!isOpen) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-background border border-border rounded-lg shadow-lg z-50 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        <div className="p-2 text-sm font-medium">
          Backend Monitor
        </div>
      </div>
    );
  }

  // When open, show the full panel
  return (
    <div className="fixed bottom-4 right-4 w-80 bg-background border border-border rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center p-2 border-b border-border">
        <h3 className="font-semibold">Backend Monitor</h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
          ✕
        </Button>
      </div>
      
      <div className="p-3 space-y-4">
        {/* Data source control */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Data Source</h4>
          <div className="flex items-center space-x-2">
            <Button 
              size="sm"
              variant={useMockData ? "outline" : "default"}
              onClick={toggleMockData}
            >
              {useMockData ? "Switch to Real Data" : "Switch to Mock Data"}
            </Button>
            <div className={`h-3 w-3 rounded-full ${useMockData ? "bg-amber-500" : "bg-green-500"}`}></div>
          </div>
          <p className="text-xs text-muted-foreground">
            {useMockData 
              ? "Currently using mock data (faster but not real)" 
              : "Currently attempting to fetch real data (may be slower)"}
          </p>
        </div>

        {/* Cache control */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cache Control</h4>
          <Button size="sm" variant="outline" onClick={clearCache}>
            Clear Cache
          </Button>
        </div>
        
        {/* Platform status */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Platform Status</h4>
          <div className="grid grid-cols-3 gap-2">
            {getAllPlatforms().map(platform => (
              <div 
                key={platform.name} 
                className="flex flex-col items-center border border-border rounded p-2"
              >
                <img 
                  src={platform.logo} 
                  alt={platform.name} 
                  className="w-6 h-6 object-contain mb-1" 
                />
                <span className="text-xs">{platform.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        This panel is for development use only.
      </div>
    </div>
  );
};

export default BackendMonitor;
