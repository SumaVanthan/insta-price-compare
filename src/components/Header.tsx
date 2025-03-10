
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const Header = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3 backdrop-blur-md bg-background/80 shadow-sm' : 'py-4 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between max-w-7xl">
        <Link to="/" className="flex items-center space-x-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
          >
            <span className="bg-primary text-primary-foreground font-bold p-2 rounded-lg">IPC</span>
          </motion.div>
          <motion.h1 
            className="text-xl font-semibold text-foreground"
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            InstaPrice Compare
          </motion.h1>
        </Link>

        <nav className="hidden md:flex space-x-6">
          <NavLink to="/" label="Home" active={location.pathname === '/'} />
          <NavLink to="/about" label="About" active={location.pathname === '/about'} />
        </nav>

        <div className="md:hidden">
          <button className="subtle-neumorph w-10 h-10 rounded-full flex items-center justify-center text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, label, active }: { to: string; label: string; active: boolean }) => (
  <Link 
    to={to} 
    className={`relative py-1 text-base font-medium transition-colors hover:text-primary ${
      active ? 'text-primary' : 'text-foreground/80'
    }`}
  >
    {label}
    {active && (
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" 
        layoutId="underline"
        transition={{ type: 'spring', duration: 0.3 }}
      />
    )}
  </Link>
);

export default Header;
