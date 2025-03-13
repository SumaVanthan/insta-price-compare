
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from '@/components/Layout';
import LocationPermission from '@/components/LocationPermission';
import SearchBar from '@/components/SearchBar';
import ProductGrid from '@/components/ProductGrid';
import LoadingState from '@/components/LoadingState';
import ErrorState from '@/components/ErrorState';
import { searchProducts } from '@/utils/api';
import { ProductData } from '@/components/ProductCard';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState(Date.now());
  const { toast } = useToast();

  // Add a timeout effect to prevent infinite loading
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      timeoutId = setTimeout(() => {
        setIsLoading(false);
        setError('Search timed out. Please try again or try a different search term.');
        toast({
          title: "Search timed out",
          description: "Our search is taking too long. Please try again or try a different search term.",
          variant: "destructive",
          duration: 5000,
        });
      }, 30000); // 30 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, toast]);

  const handleLocationGranted = (coords: { latitude: number; longitude: number }) => {
    setLocation(coords);
  };

  const handleSearch = async (query: string) => {
    if (!location) {
      toast({
        title: "Location required",
        description: "Please allow location access to search for products.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    setSearchStartTime(Date.now());
    
    try {
      const result = await searchProducts(query, location);
      
      // Only update state if we're still in loading state (not timed out)
      if (isLoading) {
        setProducts(result.products);
        
        if (result.products.length === 0) {
          toast({
            title: "No products found",
            description: "Try a different search term or check back later.",
            duration: 3000,
          });
        }
      }
    } catch (err) {
      if (isLoading) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        toast({
          title: "Search failed",
          description: err instanceof Error ? err.message : 'Failed to search for products',
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retrySearch = () => {
    // Re-run the last search
    if (hasSearched) {
      handleSearch('milk'); // In a real app, we'd store the last query
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  return (
    <Layout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <div className="max-w-3xl mx-auto text-center mb-10">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Compare Grocery Prices Instantly
          </motion.h1>
          
          <motion.p 
            className="text-lg text-muted-foreground mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Find the best deals across Zepto, Blinkit, and Swiggy Instamart in your area
          </motion.p>
        </div>
        
        <LocationPermission onLocationGranted={handleLocationGranted} />
        
        <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        
        <AnimatePresence mode="wait">
          {isLoading ? (
            <LoadingState key="loading" startTime={searchStartTime} />
          ) : error ? (
            <ErrorState key="error" message={error} onRetry={retrySearch} />
          ) : hasSearched && products.length === 0 ? (
            <motion.div 
              key="no-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-12 text-center"
            >
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground">Try a different search term or check back later.</p>
            </motion.div>
          ) : (
            <ProductGrid key="results" products={products} />
          )}
        </AnimatePresence>
        
        {!hasSearched && !isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="py-16 text-center"
          >
            <div className="max-w-md mx-auto space-y-4">
              <h3 className="text-xl font-medium">Start by searching for a product</h3>
              <p className="text-muted-foreground">Enter product names like "milk", "rice", or "oil" to compare prices</p>
              
              <div className="pt-8 grid grid-cols-3 gap-4 max-w-xs mx-auto">
                {['Milk', 'Rice', 'Oil'].map((suggestion, index) => (
                  <motion.button
                    key={suggestion}
                    className="py-2 px-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-apple"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: 1, 
                      y: 0,
                      transition: { delay: 0.5 + (index * 0.1) }
                    }}
                    onClick={() => handleSearch(suggestion)}
                  >
                    {suggestion}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Index;
