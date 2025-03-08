import Link from 'next/link';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

type PostCardProps = {
  title: string;
  slug: string;
  date?: string;
  excerpt?: string;
};

export default function PostCard({ title, slug, date, excerpt }: PostCardProps) {
  return (
    <div className="post-card">
      <Link href={`/${slug}`} className="post-link">
        <h3 className="post-title">{title}</h3>
      </Link>
      
      {date && (
        <div className="post-date">
          {format(new Date(date), 'yyyy年MM月dd日', { locale: ja })}
        </div>
      )}
      
      {excerpt && <p className="post-excerpt">{excerpt}</p>}
    </div>
  );
} 