
import React from 'react';
import { motion } from 'framer-motion';
import ProductCard, { ProductData } from './ProductCard';

interface ProductGridProps {
  products: ProductData[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  if (!products.length) {
    return null;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </motion.div>
  );
};

export default ProductGrid;
