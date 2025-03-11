import React from 'react';
import { ExternalLink } from 'lucide-react';
import { ProductPrices } from './ProductCard';
import { extractPrice } from '@/utils/string_similarity';
import { platforms } from '@/utils/platformConfig';

interface PriceComparisonProps {
  prices: ProductPrices;
}

const PriceComparison = ({ prices }: PriceComparisonProps) => {
  // Find the lowest price
  const priceValues = Object.entries(prices)
    .filter(([_, details]) => details?.price && !details.price.includes('Click to view') && !details.price.includes('Live Price'))
    .map(([platform, details]) => {
      // Extract the numeric price
      const numericPrice = extractPrice(details.price) || 0;
      
      return {
        platform,
        price: numericPrice,
      };
    });

  const lowestPrice = priceValues.length > 0 
    ? Math.min(...priceValues.map((item) => item.price)) 
    : 0;

  const getBestDeal = (platform: string, price?: { price: string; url?: string }) => {
    if (!price || price.price.includes('Click to view') || price.price.includes('Live Price')) return false;
    
    try {
      // Extract the numeric price
      const numericPrice = extractPrice(price.price) || 0;
      return numericPrice === lowestPrice && lowestPrice > 0;
    } catch {
      return false;
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {Object.entries(platforms).map(([key, platform]) => {
        const price = prices[key as keyof ProductPrices];
        const isBestDeal = getBestDeal(key, price);
        const productUrl = price?.url || `${platform.baseUrl}${encodeURIComponent(key)}`;

        return (
          <div 
            key={key}
            className={`flex items-center py-2 pl-2 pr-3 rounded-lg transition-apple ${
              isBestDeal ? 'bg-accent/30' : 'hover:bg-secondary/80'
            }`}
          >
            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 mr-2 bg-secondary flex items-center justify-center">
              <img 
                src={platform.logo} 
                alt={platform.name} 
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  // Create a text element with the first letter
                  const textSpan = document.createElement('span');
                  textSpan.textContent = platform.name.charAt(0);
                  textSpan.className = 'font-bold text-lg';
                  
                  if (target.parentElement) {
                    target.parentElement.appendChild(textSpan);
                    target.parentElement.classList.add('bg-secondary', 'flex', 'items-center', 'justify-center');
                  }
                }}
              />
            </div>
            
            <div className="flex-1">
              <span className="text-sm font-medium">
                {platform.name}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              {price ? (
                <>
                  <div className="relative">
                    <span className={`font-semibold text-base ${isBestDeal ? 'text-primary' : ''}`}>
                      {price.price}
                    </span>
                    
                    {isBestDeal && (
                      <span className="absolute -top-3 -right-2 bg-primary text-primary-foreground text-[10px] px-1 py-0.5 rounded font-medium">
                        BEST
                      </span>
                    )}
                  </div>
                  <a 
                    href={productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                    aria-label={`View on ${platform.name}`}
                  >
                    <ExternalLink size={16} />
                  </a>
                </>
              ) : (
                <span className="text-sm text-muted-foreground">Not available</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriceComparison;
