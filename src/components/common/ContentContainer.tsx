import { ReactNode } from 'react';

type ContentContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return (
    <div className={`bg-white rounded-xl shadow-sm p-8 sm:p-10 md:p-12 max-w-4xl mx-auto ${className}`}>
      {children}
    </div>
  );
}