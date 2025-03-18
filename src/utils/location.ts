
interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

interface LocationError {
  code: number;
  message: string;
}

export const getLocation = (): Promise<Coordinates> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 0,
        message: 'Geolocation is not supported by your browser'
      });
      return;
    }

    console.log('Requesting geolocation permission...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('Geolocation permission granted, coordinates obtained');
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let message = 'Unknown error occurred while getting location';
        
        switch (error.code) {
          case 1:
            message = 'Permission denied. Please allow location access to use this feature.';
            break;
          case 2:
            message = 'Position unavailable. Please try again later.';
            break;
          case 3:
            message = 'Timeout. Please try again.';
            break;
        }
        
        console.error(`Geolocation error: ${message}`);
        reject({
          code: error.code,
          message
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

export const formatLocation = (coordinates: Coordinates): string => {
  return `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`;
};

// Store location in session storage
export const storeLocation = (coordinates: Coordinates): void => {
  try {
    sessionStorage.setItem('userLocation', JSON.stringify(coordinates));
    console.log('Location stored in session storage');
  } catch (error) {
    console.error('Failed to store location in session storage:', error);
  }
};

// Retrieve location from session storage
export const retrieveLocation = (): Coordinates | null => {
  try {
    const locationData = sessionStorage.getItem('userLocation');
    if (locationData) {
      console.log('Retrieved location from session storage');
      return JSON.parse(locationData);
    }
    return null;
  } catch (error) {
    console.error('Failed to retrieve location from session storage:', error);
    return null;
  }
};
