import Link from 'next/link';

type PostCardProps = {
  title: string;
  slug: string;
  excerpt?: string;
};

export default function PostCard({ title, slug, excerpt }: PostCardProps) {
  return (
    <div className="post-card">
      <Link href={`/${slug}`} className="post-link">
        <h3 className="post-title">{title}</h3>
      </Link>
      
      {excerpt && <p className="post-excerpt">{excerpt}</p>}
    </div>
  );
} 