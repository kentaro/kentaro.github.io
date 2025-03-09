import Link from 'next/link';
import { motion } from 'framer-motion';

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

  // アニメーション設定
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="post-list">
      {title && <h2 className="section-title">{title}</h2>}
      
      {displayPosts.length > 0 ? (
        <motion.div 
          className="posts-grid"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {displayPosts.map((post, index) => (
            <motion.div 
              key={post.slug} 
              className="post-card"
              variants={item}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/${post.slug}`} className="post-card-inner">
                <h3 className="post-card-title">{post.title}</h3>
                
                {post.date && !hideDate && (
                  <div className="post-card-date">
                    {new Date(post.date).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                )}
                
                {post.excerpt && (
                  <p className="post-card-excerpt">{post.excerpt}</p>
                )}
                
                <div className="post-card-more">続きを読む →</div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <p className="empty-message">{emptyMessage}</p>
      )}
    </div>
  );
} 