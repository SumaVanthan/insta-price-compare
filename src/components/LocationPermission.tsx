
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getLocation } from '@/utils/location';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

interface LocationPermissionProps {
  onLocationGranted: (coords: { latitude: number; longitude: number }) => void;
}

const LocationPermission = ({ onLocationGranted }: LocationPermissionProps) => {
  // Update the type definition to include 'granted'
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const { toast } = useToast();

  useEffect(() => {
    // Check if we have previously stored permission status
    const storedStatus = localStorage.getItem('locationPermission');
    if (storedStatus) {
      setPermissionStatus(storedStatus as 'granted' | 'denied');
      
      // If previously granted, try to get location again
      if (storedStatus === 'granted') {
        requestLocation();
      }
    }
  }, []);

  const requestLocation = async () => {
    setPermissionStatus('requesting');
    
    try {
      const position = await getLocation();
      setPermissionStatus('granted');
      localStorage.setItem('locationPermission', 'granted');
      onLocationGranted({
        latitude: position.latitude,
        longitude: position.longitude
      });
      
      toast({
        title: "Location access granted",
        description: "We'll show you the most relevant prices for your area.",
        duration: 3000,
      });
    } catch (error: any) {
      console.error('Location error:', error);
      setPermissionStatus('denied');
      localStorage.setItem('locationPermission', 'denied');
      
      toast({
        title: "Location access denied",
        description: error.message || "Please enable location access to use all features.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  if (permissionStatus === 'granted') {
    return null;
  }

  return (
    <AnimatePresence>
      {permissionStatus !== 'granted' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="glass-panel rounded-xl p-6 mb-8 max-w-2xl mx-auto"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-shrink-0 bg-primary/10 rounded-full p-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary w-6 h-6"
              >
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Location Access Required</h3>
              <p className="text-muted-foreground mb-4">
                To compare prices from stores in your area, we need your location. 
                Your data is only used to find relevant prices and is never stored.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={requestLocation} 
                  disabled={permissionStatus === 'requesting'}
                  className="transition-apple"
                >
                  {permissionStatus === 'requesting' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Requesting Access
                    </>
                  ) : (
                    'Allow Location Access'
                  )}
                </Button>
                
                {permissionStatus === 'denied' && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      // Open browser settings instructions
                      toast({
                        title: "Enable location in browser settings",
                        description: "Please enable location access in your browser settings and refresh the page.",
                        duration: 5000,
                      });
                    }}
                    className="transition-apple"
                  >
                    Open Settings
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LocationPermission;
