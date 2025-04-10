
import React, { useState, useEffect } from 'react';
import { Clock, BarChart3, ArrowDownUp, Zap, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scraperService } from '@/utils/scraping/ScraperService';
import { PLATFORMS } from '@/utils/types';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from '@/components/ui/sidebar';

interface BackendActivity {
  timestamp: number;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

const BackendMonitor: React.FC = () => {
  const [activities, setActivities] = useState<BackendActivity[]>([]);
  const [cacheInfo, setCacheInfo] = useState({ size: 0, lastCleared: 'Never' });
  const { toast } = useToast();
  
  // Add a new activity to the log
  const addActivity = (message: string, type: BackendActivity['type'] = 'info') => {
    setActivities(prev => [{
      timestamp: Date.now(),
      message,
      type
    }, ...prev].slice(0, 100)); // Keep last 100 activities
  };
  
  // Mock monitoring for demo purposes - in a real app, these would come from actual backend events
  useEffect(() => {
    // Add initial activities
    const initialActivities: BackendActivity[] = [
      { timestamp: Date.now() - 60000, message: 'Application started', type: 'info' },
      { timestamp: Date.now() - 55000, message: 'Location services initialized', type: 'success' },
      { timestamp: Date.now() - 40000, message: 'Cache initialized', type: 'info' }
    ];
    setActivities(initialActivities);
    
    // Setup listeners for real events
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    // Intercept console logs to capture backend activities
    console.log = (...args) => {
      originalConsoleLog(...args);
      const message = args.join(' ');
      if (message.includes('[ScraperService]') || 
          message.includes('[API]') || 
          message.includes('[ScraperClient]')) {
        addActivity(message, 'info');
      }
    };
    
    console.error = (...args) => {
      originalConsoleError(...args);
      const message = args.join(' ');
      if (message.includes('[ScraperService]') || 
          message.includes('[API]') || 
          message.includes('[ScraperClient]')) {
        addActivity(message, 'error');
      }
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      const message = args.join(' ');
      if (message.includes('[ScraperService]') || 
          message.includes('[API]') || 
          message.includes('[ScraperClient]')) {
        addActivity(message, 'warning');
      }
    };
    
    // Restore console methods when component unmounts
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  // Handle cache clearing
  const handleClearCache = () => {
    scraperService.clearCache();
    setCacheInfo(prev => ({ ...prev, lastCleared: new Date().toLocaleTimeString() }));
    addActivity('Cache cleared manually', 'success');
  };

  // Format timestamp for display
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <Sidebar side="right" variant="floating">
      <SidebarHeader>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span className="font-semibold">Backend Monitor</span>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sources Status</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="grid grid-cols-3 gap-2 p-2">
              {Object.entries(PLATFORMS).map(([key, platform]) => (
                <div 
                  key={key}
                  className={`flex flex-col items-center justify-center rounded-md p-2 ${platform.color} transition-all hover:scale-105`}
                >
                  <img src={platform.logo} alt={platform.name} className="h-6 w-6 mb-1" />
                  <span className="text-xs font-medium">{platform.name}</span>
                </div>
              ))}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Cache Control</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="p-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs">Last cleared: {cacheInfo.lastCleared}</span>
                <button 
                  onClick={handleClearCache}
                  className="flex items-center space-x-1 rounded-md bg-secondary px-2 py-1 text-xs hover:bg-secondary/80"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear Cache</span>
                </button>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarSeparator />
        
        <SidebarGroup>
          <SidebarGroupLabel>Activity Log</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="max-h-[50vh] overflow-y-auto p-2 space-y-2">
              {activities.map((activity, index) => (
                <div 
                  key={index} 
                  className={`text-xs rounded-md p-2 ${
                    activity.type === 'error' ? 'bg-destructive/10 text-destructive' :
                    activity.type === 'warning' ? 'bg-amber-100 text-amber-800' :
                    activity.type === 'success' ? 'bg-emerald-100 text-emerald-800' :
                    'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{formatTime(activity.timestamp)}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      activity.type === 'error' ? 'bg-destructive text-white' :
                      activity.type === 'warning' ? 'bg-amber-500 text-white' :
                      activity.type === 'success' ? 'bg-emerald-500 text-white' :
                      'bg-muted-foreground/20'
                    }`}>
                      {activity.type.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 break-words whitespace-pre-wrap">{activity.message}</p>
                </div>
              ))}
              
              {activities.length === 0 && (
                <div className="text-center text-muted-foreground text-xs py-4">
                  No activities recorded yet
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex justify-between items-center p-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            <span>Dev Mode</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default BackendMonitor;
