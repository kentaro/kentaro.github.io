import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

type MarkdownRendererProps = {
  title?: string;
  contentHtml: string;
  date?: string;
  children?: ReactNode;
};

/* eslint-disable react/no-danger, @next/next/no-html-link-for-pages */
export default function MarkdownRenderer({ title, contentHtml, date, children }: MarkdownRendererProps) {
  return (
    <>
      <div className="page-header bg-gradient-to-br from-primary/10 to-accent2/10 py-12 md:py-16">
        <div className="container">
          {title && (
            <motion.h1 
              className="text-3xl md:text-4xl font-bold text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h1>
          )}
          {date && (
            <motion.div 
              className="text-center text-gray-600 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {new Date(date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </motion.div>
          )}
        </div>
      </div>
      
      <motion.article 
        className="markdown-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8 max-w-4xl mx-auto">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          {children}
        </div>
      </motion.article>
    </>
  );
}
/* eslint-enable react/no-danger, @next/next/no-html-link-for-pages */ 