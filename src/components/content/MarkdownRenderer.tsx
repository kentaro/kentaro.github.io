import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

type MarkdownRendererProps = {
  title?: string;
  contentHtml: string;
  date?: string;
  hideDate?: boolean;
  children?: ReactNode;
  prevPost?: {
    slug: string;
    title: string;
  } | null;
  nextPost?: {
    slug: string;
    title: string;
  } | null;
  isJournalPost?: boolean;
};

/* eslint-disable react/no-danger, @next/next/no-html-link-for-pages */
export default function MarkdownRenderer({ 
  title, 
  contentHtml, 
  date, 
  hideDate = false, 
  children,
  prevPost,
  nextPost,
  isJournalPost = false
}: MarkdownRendererProps) {
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
          {date && !hideDate && (
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
          <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
          {children}
          
          {isJournalPost && (prevPost || nextPost) && (
            <div className="journal-navigation mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                {prevPost ? (
                  <Link 
                    href={`/${prevPost.slug}`} 
                    className="flex items-center text-primary hover:text-primary-dark transition-colors"
                  >
                    <FaArrowLeft className="mr-2" />
                    <span>
                      <span className="text-sm text-gray-500 block">前の日記</span>
                      <span className="font-medium">{prevPost.title}</span>
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
                
                {nextPost ? (
                  <Link 
                    href={`/${nextPost.slug}`} 
                    className="flex items-center text-primary hover:text-primary-dark transition-colors text-right"
                  >
                    <span>
                      <span className="text-sm text-gray-500 block">次の日記</span>
                      <span className="font-medium">{nextPost.title}</span>
                    </span>
                    <FaArrowRight className="ml-2" />
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          )}
        </div>
      </motion.article>
    </>
  );
}
/* eslint-enable react/no-danger, @next/next/no-html-link-for-pages */ 