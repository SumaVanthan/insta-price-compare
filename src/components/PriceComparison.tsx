
import React from 'react';
import { Button } from './ui/button';
import { ExternalLink } from 'lucide-react';
import { ProductPrices } from './ProductCard';

interface PriceComparisonProps {
  prices: ProductPrices;
}

interface PlatformDetails {
  name: string;
  logo: string;
  color: string;
  baseUrl: string;
}

const platforms: Record<string, PlatformDetails> = {
  zepto: {
    name: 'Zepto',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Zepto_Logo.png',
    color: 'bg-[#792FD6]/10 text-[#792FD6]',
    baseUrl: 'https://www.zeptonow.com/products/'
  },
  blinkit: {
    name: 'Blinkit',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/1/13/Blinkit-yellow-app-icon.png',
    color: 'bg-[#F3CF00]/10 text-[#000000]',
    baseUrl: 'https://blinkit.com/search/'
  },
  instamart: {
    name: 'Instamart',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/9/94/Swiggy_logo.svg',
    color: 'bg-[#FC8019]/10 text-[#FC8019]',
    baseUrl: 'https://www.swiggy.com/instamart-search/'
  },
};

const PriceComparison = ({ prices }: PriceComparisonProps) => {
  // Find the lowest price
  const priceValues = Object.entries(prices)
    .filter(([_, details]) => details?.price)
    .map(([platform, details]) => ({
      platform,
      price: parseFloat(details.price.replace(/[^\d.]/g, '')),
    }));

  const lowestPrice = Math.min(
    ...priceValues.map((item) => item.price)
  );

  const getBestDeal = (platform: string, price?: { price: string; url?: string }) => {
    if (!price) return false;
    
    const numericPrice = parseFloat(price.price.replace(/[^\d.]/g, ''));
    return numericPrice === lowestPrice;
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
