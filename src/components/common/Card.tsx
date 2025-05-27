import { ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';

type BaseCardProps = {
  className?: string;
  children: ReactNode;
};

export function Card({ className = '', children }: BaseCardProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

type PostCardProps = {
  href: string;
  title: string;
  date?: string;
  excerpt?: string;
  index?: number;
};

export function PostCard({ href, title, date, excerpt, index = 0 }: PostCardProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={item}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:-translate-y-1">
        <Link href={href} className="block p-6 sm:p-8 h-full">
          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-dark hover:text-primary transition-colors">
            {title}
          </h3>
          
          {date && (
            <div className="text-sm sm:text-base text-gray-500 mb-4">
              {new Date(date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          )}
          
          {excerpt && (
            <p className="text-gray-600 text-sm sm:text-base mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}
          
          <div className="text-primary text-sm sm:text-base font-semibold">
            続きを読む →
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

type WorkCardProps = {
  href: string;
  title: string;
  description?: string;
  image?: string;
  isExternal?: boolean;
  index?: number;
};

export function WorkCard({ href, title, description, image, isExternal = false, index = 0 }: WorkCardProps) {
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const linkProps = isExternal ? {
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  return (
    <motion.div
      variants={item}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Card className="hover:-translate-y-1 h-full">
        <Link href={href} {...linkProps} className="flex flex-col h-full">
          {image && (
            <div className="relative h-48 bg-gray-100 flex-shrink-0">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-6 sm:p-8 flex flex-col flex-grow">
            <h3 className="text-xl sm:text-2xl font-bold mb-3 text-dark hover:text-primary transition-colors">
              {title}
            </h3>
            
            {description && (
              <p className="text-gray-600 text-sm sm:text-base line-clamp-2 flex-grow">
                {description}
              </p>
            )}
          </div>
        </Link>
      </Card>
    </motion.div>
  );
}

type IconCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description?: string;
  handle?: string;
  isExternal?: boolean;
  index?: number;
};

export function IconCard({ href, icon, title, description, handle, isExternal = true, index = 0 }: IconCardProps) {
  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 }
  };

  const linkProps = isExternal ? {
    target: '_blank',
    rel: 'noopener noreferrer'
  } : {};

  return (
    <motion.div
      variants={item}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Card className="hover:-translate-y-1">
        <Link href={href} {...linkProps} className="block p-6 sm:p-8 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-primary/10 text-primary rounded-full mx-auto mb-4 hover:bg-primary hover:text-white transition-all duration-300 hover:scale-110">
            {icon}
          </div>
          
          <h3 className="text-xl sm:text-2xl font-bold mb-3 text-dark">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 text-sm sm:text-base mb-3">
              {description}
            </p>
          )}
          
          {handle && (
            <div className="text-primary font-semibold text-base sm:text-lg">
              {handle}
            </div>
          )}
        </Link>
      </Card>
    </motion.div>
  );
}