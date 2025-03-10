
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

const ErrorState = ({ 
  message = 'Unable to fetch prices at the moment', 
  onRetry 
}: ErrorStateProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-xl p-8 max-w-xl mx-auto flex flex-col items-center text-center"
    >
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
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
          className="text-destructive"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>
      
      <h3 className="text-xl font-semibold mb-2">Something went wrong</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      
      {onRetry && (
        <Button 
          onClick={onRetry}
          className="transition-apple"
        >
          Try Again
        </Button>
      )}
    </motion.div>
  );
};

export default ErrorState;
