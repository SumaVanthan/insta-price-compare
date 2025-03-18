
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getLocation, storeLocation, retrieveLocation } from '@/utils/location';
import { MapPin, AlertTriangle } from 'lucide-react';

interface LocationPermissionProps {
  onLocationGranted: (coords: { latitude: number; longitude: number }) => void;
}

const LocationPermission = ({ onLocationGranted }: LocationPermissionProps) => {
  // Update the type to include 'granted'
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'denied' | 'requesting' | 'granted'>('prompt');
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);

  const requestLocation = () => {
    setPermissionStatus('requesting');
    setError(null);
    setAttemptCount(prev => prev + 1);
    
    // First try to get location from session storage
    const savedLocation = retrieveLocation();
    if (savedLocation) {
      console.log('Using saved location from session storage');
      setPermissionStatus('granted');
      onLocationGranted(savedLocation);
      return;
    }
    
    // If no saved location, request from browser
    getLocation()
      .then((coords) => {
        console.log('Location permission granted:', coords);
        setPermissionStatus('granted');
        storeLocation(coords); // Save to session storage for future use
        onLocationGranted(coords);
      })
      .catch((err) => {
        console.error('Location permission error:', err);
        setPermissionStatus('denied');
        setError(err.message);
      });
  };

  // Attempt to get location on initial load if permission was previously granted
  useEffect(() => {
    // Check if we have saved location in session storage
    const savedLocation = retrieveLocation();
    if (savedLocation) {
      console.log('Found saved location in session storage');
      setPermissionStatus('granted');
      onLocationGranted(savedLocation);
      return;
    }
    
    if (navigator.geolocation) {
      navigator.permissions?.query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            requestLocation();
          } else {
            setPermissionStatus(result.state as 'prompt' | 'denied');
          }
          
          // Listen for changes to permission state
          result.addEventListener('change', function() {
            if (result.state === 'granted') {
              requestLocation();
            } else {
              setPermissionStatus(result.state as 'prompt' | 'denied');
            }
          });
        })
        .catch(() => {
          // Permissions API not supported, fallback to standard flow
          console.log('Permissions API not supported, using fallback');
        });
    } else {
      setError('Geolocation is not supported by your browser');
    }
  }, []);

  // Content for different permission states
  const renderContent = () => {
    if (permissionStatus === 'requesting') {
      return (
        <div className="text-center py-3">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="mb-3 text-primary"
          >
            <MapPin size={24} className="mx-auto" />
          </motion.div>
          <p className="text-sm text-muted-foreground">
            Requesting location access...
          </p>
        </div>
      );
    }
    
    if (permissionStatus === 'granted') {
      return (
        <div className="p-3 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center justify-center"
          >
            <div className="bg-primary/20 text-primary rounded-full p-1">
              <MapPin size={18} />
            </div>
            <p className="text-sm text-green-600 dark:text-green-400 ml-2">
              Location access granted
            </p>
          </motion.div>
        </div>
      );
    }
    
    return (
      <div className="p-4 text-center">
        {permissionStatus === 'denied' && (
          <div className="mb-3 text-destructive">
            <AlertTriangle size={24} className="mx-auto" />
          </div>
        )}
        
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
          variant={permissionStatus === 'denied' ? "destructive" : "default"}
          size="sm"
          className="w-full"
        >
          <MapPin size={16} className="mr-2" />
          {permissionStatus === 'denied' ? 'Try Again' : 'Allow Location Access'}
        </Button>
        
        {attemptCount > 1 && permissionStatus === 'denied' && (
          <p className="mt-3 text-xs text-muted-foreground">
            If you've denied permission, you may need to reset it in your browser settings:
            <br />
            ⚙️ Site Settings → Location → Allow
          </p>
        )}
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
