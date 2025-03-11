
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getLocation } from '@/utils/location';

interface LocationPermissionProps {
  onLocationGranted: (coords: { latitude: number; longitude: number }) => void;
}

const LocationPermission = ({ onLocationGranted }: LocationPermissionProps) => {
  // Update the type to include 'granted'
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'denied' | 'requesting' | 'granted'>('prompt');
  const [error, setError] = useState<string | null>(null);

  const requestLocation = () => {
    setPermissionStatus('requesting');
    setError(null);
    
    getLocation()
      .then((coords) => {
        setPermissionStatus('granted');
        onLocationGranted(coords);
      })
      .catch((err) => {
        setPermissionStatus('denied');
        setError(err.message);
      });
  };

  // Attempt to get location on initial load if permission was previously granted
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            requestLocation();
          } else {
            setPermissionStatus(result.state as 'prompt' | 'denied');
          }
        })
        .catch(() => {
          // Permissions API not supported, fallback to standard flow
        });
    }
  }, []);

  // Content for different permission states
  const renderContent = () => {
    if (permissionStatus === 'requesting') {
      return (
        <div className="text-center py-3">
          <div className="animate-pulse">
            <div className="h-4 bg-primary/10 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-primary/10 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      );
    }
    
    if (permissionStatus === 'granted') {
      return (
        <div className="p-3 text-center">
          <p className="text-sm text-green-600 dark:text-green-400">
            📍 Location access granted
          </p>
        </div>
      );
    }
    
    return (
      <div className="p-4 text-center">
        <p className="mb-4 text-sm text-muted-foreground">
          {permissionStatus === 'denied' 
            ? 'Please enable location access in your browser settings to compare prices in your area.'
            : 'Allow location access to compare grocery prices in your area.'}
        </p>
        
        {error && (
          <p className="text-sm text-destructive mb-4">
            Error: {error}
          </p>
        )}
        
        <Button 
          onClick={requestLocation} 
          variant="secondary"
          size="sm"
          className="w-full"
        >
          {permissionStatus === 'denied' ? 'Try Again' : 'Allow Location Access'}
        </Button>
      </div>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="glass-panel overflow-hidden rounded-2xl transition-apple">
        {renderContent()}
      </div>
    </motion.div>
  );
};

export default LocationPermission;
