
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchBar = ({ onSearch, isLoading }: SearchBarProps) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log(`[SearchBar] Search initiated for: "${query.trim()}"`);
      onSearch(query.trim());
    } else {
      console.log('[SearchBar] Empty search query, not searching');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full max-w-2xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="relative">
        <div className="glass-panel overflow-hidden rounded-2xl shadow-sm transition-apple flex items-center">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for grocery products (e.g., Milk, Bread, Rice)"
            className="border-none bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 py-6 px-4 text-base"
            disabled={isLoading}
          />
          <div className="px-3">
            <Button 
              type="submit" 
              size="sm" 
              className="rounded-xl transition-apple h-10"
              disabled={isLoading || !query.trim()}
              onClick={() => {
                if (!isLoading && query.trim()) {
                  console.log(`[SearchBar] Search button clicked for: "${query.trim()}"`);
                }
              }}
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
      </form>
    </motion.div>
  );
};

export default SearchBar;
