import type { ReactNode } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaRss } from 'react-icons/fa';
import { motion } from 'framer-motion';

type PageHeaderProps = {
  title: string;
  description?: string;
  backLink?: {
    href: string;
    label: string;
  };
  rssLink?: string;
  children?: ReactNode;
};

export default function PageHeader({ 
  title, 
  description, 
  backLink, 
  rssLink,
  children 
}: PageHeaderProps) {
  return (
    <div className="bg-primary/5 border-b border-primary/10 h-[30vh] flex items-center justify-center">
      <div className="container w-full">
        {backLink && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link 
              href={backLink.href} 
              className="inline-flex items-center text-primary hover:text-primary-dark transition-all duration-200 font-medium hover:scale-105 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm hover:shadow-md"
            >
              <FaArrowLeft className="mr-2 text-sm" />
              <span>{backLink.label}</span>
            </Link>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark mb-6">
            {title}
          </h1>
          
          {description && (
            <p className="text-gray-700 text-lg sm:text-xl max-w-3xl mx-auto mb-6">
              {description}
            </p>
          )}
          
          {rssLink && (
            <Link 
              href={rssLink} 
              className="inline-flex items-center text-primary hover:text-primary-dark transition-all duration-200 font-medium hover:scale-105"
            >
              <FaRss className="mr-2" />
              <span>RSS</span>
            </Link>
          )}
          
          {children}
        </motion.div>
      </div>
    </div>
  );
}