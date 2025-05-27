import { ReactNode } from 'react';

type SectionProps = {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gray' | 'white';
  size?: 'sm' | 'md' | 'lg';
};

export default function Section({ 
  children, 
  className = '', 
  variant = 'default',
  size = 'md' 
}: SectionProps) {
  const bgClasses = {
    default: '',
    gray: 'bg-gray-50',
    white: 'bg-white'
  };

  const sizeClasses = {
    sm: 'py-8 sm:py-10 md:py-12',
    md: 'py-12 sm:py-16 md:py-20',
    lg: 'py-16 sm:py-20 md:py-24'
  };

  return (
    <section className={`${bgClasses[variant]} ${sizeClasses[size]} ${className}`}>
      <div className="container">
        {children}
      </div>
    </section>
  );
}

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

export function SectionTitle({ children, className = '' }: SectionTitleProps) {
  return (
    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold text-dark text-center mb-10 sm:mb-12 relative pb-6 ${className}`}>
      {children}
      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-primary rounded-full"></span>
    </h2>
  );
}