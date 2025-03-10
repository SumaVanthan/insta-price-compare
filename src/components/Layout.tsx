
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 md:py-8 max-w-7xl">
        {children}
      </main>
      <footer className="py-6 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} InstaPrice Compare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
