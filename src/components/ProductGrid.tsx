
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ProductCard, { ProductData } from './ProductCard';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from './ui/pagination';

interface ProductGridProps {
  products: ProductData[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12; // Show 12 products per page
  
  if (!products.length) {
    return null;
  }

  // Calculate pagination
  const totalPages = Math.ceil(products.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);
  
  // Generate page numbers array
  const pageNumbers = [];
  const maxPagesToShow = 5; // Show maximum 5 page numbers
  
  if (totalPages <= maxPagesToShow) {
    // If total pages are less than max, show all pages
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always include first page
    pageNumbers.push(1);
    
    // Calculate start and end of middle pages
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);
    
    // Adjust if we're at the beginning or end
    if (currentPage <= 2) {
      endPage = 3;
    } else if (currentPage >= totalPages - 1) {
      startPage = totalPages - 2;
    }
    
    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    // Always include last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    // Scroll to top when changing page
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="space-y-8">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {currentProducts.map((product, index) => (
          <ProductCard 
            key={product.id || `product-${index}`}
            product={product} 
            index={index} 
          />
        ))}
      </motion.div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            {currentPage > 1 && (
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
            
            {pageNumbers.map((pageNumber, index) => (
              <React.Fragment key={pageNumber}>
                {/* Add ellipsis if needed */}
                {index > 0 && pageNumber - pageNumbers[index - 1] > 1 && (
                  <PaginationItem>
                    <PaginationLink disabled>...</PaginationLink>
                  </PaginationItem>
                )}
                
                <PaginationItem>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => handlePageChange(pageNumber)}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              </React.Fragment>
            ))}
            
            {currentPage < totalPages && (
              <PaginationItem>
                <PaginationNext 
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="cursor-pointer"
                />
              </PaginationItem>
            )}
          </PaginationContent>
        </Pagination>
      )}
      
      <div className="text-center text-sm text-muted-foreground">
        Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, products.length)} of {products.length} products
      </div>
    </div>
  );
};

export default ProductGrid;
