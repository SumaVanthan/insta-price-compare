
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface LoadingStateProps {
  message?: string;
  startTime?: number;
}

const LoadingState = ({ 
  message = 'Searching for the best prices...',
  startTime = Date.now()
}: LoadingStateProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime]);
  
  // Dynamic messages based on elapsed time
  const getTimedMessage = () => {
    if (elapsedTime > 20) {
      return "This is taking longer than expected. Please wait a moment...";
    } else if (elapsedTime > 10) {
      return "Still working on getting the best prices for you...";
    }
    return message;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative w-20 h-20 mb-6">
        <motion.div 
          className="absolute inset-0 rounded-full border-t-2 border-primary"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="absolute inset-2 rounded-full border-t-2 border-primary/70"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
        
        <motion.div 
          className="absolute inset-4 rounded-full border-t-2 border-primary/40"
          animate={{ rotate: 360 }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <motion.p 
        className="text-lg text-foreground/80 max-w-md text-center"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        key={getTimedMessage()} // Force re-render when message changes
      >
        {getTimedMessage()}
      </motion.p>

      {elapsedTime > 5 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 text-sm text-muted-foreground"
        >
          Time elapsed: {elapsedTime} seconds
        </motion.p>
      )}

      <motion.div 
        className="mt-8 flex flex-col items-center space-y-2 text-sm text-muted-foreground"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p>We're scanning multiple stores for you</p>
        <div className="flex space-x-2">
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3, delay: 0.2 }}
          />
          <motion.div 
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3, delay: 0.4 }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingState;
