import type { ReactNode } from 'react';

type MarkdownRendererProps = {
  title?: string;
  contentHtml: string;
  children?: ReactNode;
};

/* eslint-disable react/no-danger, @next/next/no-html-link-for-pages */
export default function MarkdownRenderer({ title, contentHtml, children }: MarkdownRendererProps) {
  return (
    <article className="markdown-content">
      {title && <h1 className="content-title">{title}</h1>}
      <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
      {children}
    </article>
  );
}
/* eslint-enable react/no-danger, @next/next/no-html-link-for-pages */ 