import PostCard from './PostCard';

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
};

export default function PostList({ posts, title, emptyMessage = '投稿がありません' }: PostListProps) {
  return (
    <div className="post-list">
      {title && <h2 className="section-title">{title}</h2>}
      
      {posts.length > 0 ? (
        <div className="post-grid">
          {posts.map((post) => (
            <PostCard
              key={post.slug}
              title={post.title}
              slug={post.slug}
              date={post.date}
              excerpt={post.excerpt}
            />
          ))}
        </div>
      ) : (
        <p className="empty-message">{emptyMessage}</p>
      )}
    </div>
  );
} 