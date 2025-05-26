
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
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchStartTime, setSearchStartTime] = useState(Date.now());
  const [currentQuery, setCurrentQuery] = useState<string>('');
  const { toast } = useToast();

  // Add state for search metadata
  const [searchMetadata, setSearchMetadata] = useState({
    zepto: '',
    blinkit: '',
    instamart: ''
  });

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      // Set a timeout for the search
      timeoutId = setTimeout(() => {
        if (isLoading) {  // Check if still loading
          setIsLoading(false);
          setError('Search timed out. Please try again or try a different search term.');
          toast({
            title: "Search timed out",
            description: "Our search is taking too long. Please try again or try a different search term.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }, 20000); // 20 seconds timeout
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isLoading, toast]);

  const handleLocationGranted = (coords: { latitude: number; longitude: number }) => {
    console.log('Location granted:', coords);
    setLocation(coords);
    
    // Show toast to inform user
    toast({
      title: "Location accessed",
      description: "We can now show you local prices.",
    });
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
    setCurrentQuery(query);
    
    console.log(`Starting search for "${query}" at location: ${location.latitude}, ${location.longitude}`);
    
    try {
      const result = await searchProducts(query, location);
      
      if (isLoading) { // Make sure we're still in loading state (not cancelled)
        if (result.error) {
          setError(result.error);
          setProducts([]);
          // The toast in the catch block will handle unexpected errors.
          // If result.error is present, ErrorState component will display it.
        } else if (result.products && result.products.length === 0) {
          setProducts([]);
          // Existing toast for "No products found" is fine.
          // Consider using result.message for a more specific message if needed in the future.
          setSearchMetadata({ zepto: '', blinkit: '', instamart: '' }); // Clear metadata
          toast({
            title: "No products found",
            description: result.message || "Try a different search term or check back later.",
            duration: 3000,
          });
        } else if (result.products) {
          setProducts(result.products);
          console.log(`Search completed with ${result.products.length} products`);
          
          // Extract search metadata from products if available
          const zeptoInfo = result.products.find(p => p.source === 'zepto' && p.searchInfo)?.searchInfo || '';
          const blinkitInfo = result.products.find(p => p.source === 'blinkit' && p.searchInfo)?.searchInfo || '';
          const instamartInfo = result.products.find(p => p.source === 'instamart' && p.searchInfo)?.searchInfo || '';
          
          setSearchMetadata({
            zepto: zeptoInfo || `Searched for "${query}" on Zepto`,
            blinkit: blinkitInfo || `Searched for "${query}" on Blinkit`,
            instamart: instamartInfo || `Searched for "${query}" on Instamart`
          });
        }
      }
    } catch (err) {
      if (isLoading) { // Make sure we're still in loading state (not cancelled)
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
        console.error(`Search error: ${errorMessage}`);
        
        setError(errorMessage);
        setProducts([]); // Ensure products are cleared on catch
        toast({
          title: "Search failed",
          description: "An unexpected error occurred. Please try again.", // Generic message for catch
          variant: "destructive",
          duration: 3000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const retrySearch = () => {
    if (currentQuery) {
      handleSearch(currentQuery);
    } else if (hasSearched && !error) { // Only auto-retry 'milk' if there wasn't a specific error from last search
      handleSearch('milk');
    } else if (error && currentQuery) { // If there was an error, retry the same query
      handleSearch(currentQuery);
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
        
        <SearchBar 
          onSearch={handleSearch} 
          isLoading={isLoading} 
          locationGranted={!!location}
          currentQuery={currentQuery} 
        />
        
        {/* Show search metadata if available and products found */}
        {hasSearched && !isLoading && !error && products.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background/50 backdrop-blur-sm p-4 rounded-xl shadow-sm max-w-3xl mx-auto"
          >
            <h3 className="text-lg font-medium mb-2 text-center">Search Information</h3>
            <div className="grid gap-2 text-sm">
              {searchMetadata.zepto && (
                <div className="flex items-center gap-2 p-2 bg-[#792FD6]/10 rounded-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png" 
                    alt="Zepto" 
                    className="w-5 h-5 object-contain" 
                  />
                  <span>{searchMetadata.zepto}</span>
                </div>
              )}
              {searchMetadata.blinkit && (
                <div className="flex items-center gap-2 p-2 bg-[#F3CF00]/10 rounded-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png" 
                    alt="Blinkit" 
                    className="w-5 h-5 object-contain" 
                  />
                  <span>{searchMetadata.blinkit}</span>
                </div>
              )}
              {searchMetadata.instamart && (
                <div className="flex items-center gap-2 p-2 bg-[#FC8019]/10 rounded-lg">
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg" 
                    alt="Instamart" 
                    className="w-5 h-5 object-contain" 
                  />
                  <span>{searchMetadata.instamart}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}
        
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
            <p className="text-muted-foreground">{error ? error : "Try a different search term or check back later."}</p>
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
                    disabled={!location}
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
