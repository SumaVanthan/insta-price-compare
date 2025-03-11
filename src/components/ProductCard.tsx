
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PriceComparison from './PriceComparison';

export interface ProductPrices {
  zepto?: { price: string; unit: string; url?: string };
  blinkit?: { price: string; unit: string; url?: string };
  instamart?: { price: string; unit: string; url?: string };
}

export interface ProductData {
  id: string;
  name: string;
  imageUrl: string;
  prices: ProductPrices;
  unit?: string;
}

interface ProductCardProps {
  product: ProductData;
  index: number;
}

const ProductCard = ({ product, index }: ProductCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Extract unit from the first available price
  const unit = product.unit || 
               (product.prices.zepto?.unit || 
                product.prices.blinkit?.unit || 
                product.prices.instamart?.unit || '');

  // Determine if this is a product with real prices (not just links)
  const hasRealPrices = Object.values(product.prices).some(
    p => p && !p.price.includes('Click to view') && !p.price.includes('Live Price')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group"
    >
      <div className={`glass-panel overflow-hidden rounded-2xl transition-apple hover:shadow-card ${
        hasRealPrices ? 'border-green-100' : ''
      }`}>
        <div className="relative aspect-square overflow-hidden bg-secondary/50">
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 shimmer"></div>
          )}
          
          {!imageError ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className={`w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous" // Add crossOrigin to handle CORS
              referrerPolicy="no-referrer" // Add referrerPolicy to help with some CORS issues
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary text-center p-4">
              <span className="text-xl font-medium text-foreground/70">
                {hasRealPrices ? product.name : 'View on Platform'}
              </span>
            </div>
          )}
        </div>

        <div className="p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold line-clamp-2 min-h-[3.5rem]">{product.name}</h3>
            {unit && (
              <span className="text-sm text-muted-foreground inline-block mt-1 bg-secondary px-2 py-1 rounded-md">
                {unit}
              </span>
            )}
          </div>

          <PriceComparison prices={product.prices} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
