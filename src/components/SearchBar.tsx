
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  locationGranted: boolean;
  currentQuery?: string; // Add current query prop
}

const POPULAR_SEARCHES = ['Milk', 'Rice', 'Bread', 'Eggs', 'Onion', 'Potato'];

const SearchBar = ({ onSearch, isLoading, locationGranted, currentQuery = '' }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { toast } = useToast();

  // Update query when currentQuery changes (for remembering search)
  useEffect(() => {
    if (currentQuery && currentQuery.trim() !== '') {
      setQuery(currentQuery);
    }
  }, [currentQuery]);

  // Filter suggestions based on current query
  useEffect(() => {
    if (query.trim().length > 0) {
      const filtered = POPULAR_SEARCHES.filter(item => 
        item.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions(POPULAR_SEARCHES);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!locationGranted) {
      toast({
        title: "Location required",
        description: "Please allow location access before searching.",
        variant: "destructive",
      });
      return;
    }
    
    if (query.trim()) {
      console.log(`[SearchBar] Search initiated for: "${query.trim()}"`);
      onSearch(query.trim());
      setShowSuggestions(false);
    } else {
      console.log('[SearchBar] Empty search query, not searching');
      toast({
        title: "Search query required",
        description: "Please enter a search term.",
        variant: "destructive",
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className={`glass-panel overflow-hidden rounded-2xl shadow-sm transition-apple flex items-center ${
          !locationGranted ? 'opacity-60' : ''
        }`}>
          <Input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={locationGranted 
              ? "Search for grocery products (e.g., Milk, Bread, Rice)" 
              : "Allow location access first..."}
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-6 px-4 text-base"
            disabled={isLoading || !locationGranted}
          />
          <div className="px-3">
            <Button 
              type="submit" 
              size="sm" 
              className="rounded-xl transition-apple h-10"
              disabled={isLoading || !query.trim() || !locationGranted}
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              )}
              <span className="ml-2">Search</span>
            </Button>
          </div>
        </div>
        
        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 z-10 bg-background rounded-xl shadow-md overflow-hidden"
          >
            <ul className="py-2">
              {suggestions.map((suggestion) => (
                <li 
                  key={suggestion}
                  className="px-4 py-2 hover:bg-secondary cursor-pointer transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
        
        {!locationGranted && (
          <p className="text-sm text-muted-foreground mt-2 text-center animate-pulse">
            ↑ Allow location access to compare prices in your area ↑
          </p>
        )}
      </form>
      
      {/* Display current search if available */}
      {currentQuery && (
        <div className="mt-2 text-center text-sm text-muted-foreground">
          Currently showing results for: <span className="font-medium">{currentQuery}</span>
        </div>
      )}
      
      {/* Popular searches */}
      {!isLoading && locationGranted && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {POPULAR_SEARCHES.slice(0, 5).map(item => (
            <Button
              key={item}
              variant="secondary"
              size="sm"
              className="text-xs rounded-full"
              onClick={() => handleSuggestionClick(item)}
              disabled={isLoading}
            >
              {item}
            </Button>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default SearchBar;
