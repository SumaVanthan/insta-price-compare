
import React, { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { scraperService } from '@/utils/scraping/ScraperService';
import { Button } from '@/components/ui/button';
import { getAllPlatforms } from '@/utils/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

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
    const newValue = !useMockData;
    setUseMockData(newValue);
    
    toast({
      title: `${newValue ? "Using mock data" : "Using real data"}`,
      description: `${newValue 
        ? "Search will use mock data instead of real scraping" 
        : "Search will attempt to scrape real data from platforms"}`,
    });
    
    // Clear cache after changing mode to ensure fresh results
    scraperService.clearCache();
  };

  const clearCache = () => {
    scraperService.clearCache();
  };

  // If closed, just show a tab that can be clicked to open
  if (!isOpen) {
    return (
      <div 
        className={`fixed bottom-4 right-4 bg-background border ${useMockData ? 'border-amber-500' : 'border-border'} rounded-lg shadow-lg z-50 cursor-pointer`}
        onClick={() => setIsOpen(true)}
      >
        <div className="p-2 text-sm font-medium flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${useMockData ? "bg-amber-500" : "bg-green-500"}`}></div>
          Backend Monitor {useMockData && "(Mock Mode)"}
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
        <div className={`space-y-2 p-3 rounded-md ${useMockData ? 'bg-amber-100/50' : 'bg-green-100/50'}`}>
          <h4 className="text-sm font-medium">Data Source</h4>
          <div className="flex items-center space-x-2">
            <Switch 
              id="mock-mode" 
              checked={useMockData}
              onCheckedChange={toggleMockData}
            />
            <Label htmlFor="mock-mode">
              {useMockData ? "Using Mock Data" : "Using Real Data"}
            </Label>
          </div>
          <p className="text-xs text-muted-foreground">
            {useMockData 
              ? "Currently using mock data (faster but not real results)" 
              : "Currently attempting to fetch real data (may be slower)"}
          </p>
          {useMockData && (
            <div className="mt-2 bg-amber-200/50 p-2 rounded text-xs">
              <strong>Note:</strong> Mock mode is enabled. Products shown are sample data not real results. Switch this off to attempt real scraping.
            </div>
          )}
        </div>

        {/* Cache control */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Cache Control</h4>
          <Button size="sm" variant="outline" onClick={clearCache}>
            Clear Cache
          </Button>
          <p className="text-xs text-muted-foreground">
            Clear cache to force new data to be fetched on next search
          </p>
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
        {useMockData 
          ? "Switch to real data for actual product prices"
          : "Switch to mock data if real data isn't working"}
      </div>
    </div>
  );
};

export default BackendMonitor;
