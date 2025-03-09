import Link from 'next/link';

type Post = {
  slug: string;
  title: string;
  date?: string;
  excerpt?: string;
};

type PostListProps = {
  posts: Post[];
  title?: string;
  emptyMessage?: string;
  limit?: number;
  hideDate?: boolean;
};

export default function PostList({ posts, title, emptyMessage = '投稿がありません', limit, hideDate = false }: PostListProps) {
  // 日付でソート（新しい順）
  const sortedPosts = [...posts].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // 表示件数を制限
  const displayPosts = limit ? sortedPosts.slice(0, limit) : sortedPosts;

  return (
    <div className="post-list">
      {title && <h2 className="section-title">{title}</h2>}
      
      {displayPosts.length > 0 ? (
        <ul className="posts">
          {displayPosts.map((post) => (
            <li key={post.slug} className="post-item">
              <Link href={`/${post.slug}`} className="post-link">
                {post.title}
              </Link>
              {post.date && !hideDate && (
                <span className="post-date">
                  {new Date(post.date).toLocaleDateString('ja-JP', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">{emptyMessage}</p>
      )}
    </div>
  );
} 