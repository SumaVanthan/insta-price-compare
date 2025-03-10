
import React from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';

const About = () => {
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

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <Layout>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-3xl mx-auto"
      >
        <motion.h1 
          className="text-3xl md:text-4xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          variants={itemVariants}
        >
          About InstaPrice Compare
        </motion.h1>
        
        <motion.div 
          className="glass-panel rounded-2xl p-6 md:p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold mb-4">What is InstaPrice Compare?</h2>
          <p className="text-muted-foreground mb-4">
            InstaPrice Compare is a web application designed to help you save money on your groceries by comparing 
            prices across popular quick-commerce platforms in India - Zepto, Blinkit, and Swiggy Instamart.
          </p>
          <p className="text-muted-foreground">
            Simply search for a product, and we'll show you the best price available near your location, 
            helping you make informed decisions and save money.
          </p>
        </motion.div>
        
        <motion.div 
          className="glass-panel rounded-2xl p-6 md:p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold mb-4">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">1</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Enable Location</h3>
                <p className="text-muted-foreground text-sm">
                  Allow location access so we can show prices from stores near you. Your location is only used
                  to find relevant prices and is never stored.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">2</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Search Products</h3>
                <p className="text-muted-foreground text-sm">
                  Enter the name of the product you're looking for. You can search for specific brands 
                  or generic product names.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-primary font-semibold">3</span>
              </div>
              <div>
                <h3 className="font-medium mb-1">Compare Prices</h3>
                <p className="text-muted-foreground text-sm">
                  View real-time prices from Zepto, Blinkit, and Swiggy Instamart. We highlight the best
                  deal to help you make quick decisions.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        
        <motion.div 
          className="glass-panel rounded-2xl p-6 md:p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-xl font-semibold mb-4">Privacy & Data</h2>
          <p className="text-muted-foreground mb-4">
            We take privacy seriously. InstaPrice Compare:
          </p>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Only uses your location to find relevant prices</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Does not store your search history</span>
            </li>
            <li className="flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Does not share your data with third parties</span>
            </li>
          </ul>
        </motion.div>
        
        <motion.div className="glass-panel rounded-2xl p-6 md:p-8" variants={itemVariants}>
          <h2 className="text-xl font-semibold mb-4">Contact</h2>
          <p className="text-muted-foreground">
            Have questions, feedback, or feature requests? Contact us at 
            <a href="mailto:info@instaprice.com" className="text-primary hover:text-primary/80 ml-1 transition-colors">
              info@instaprice.com
            </a>
          </p>
        </motion.div>
      </motion.div>
    </Layout>
  );
};

export default About;
