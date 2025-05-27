import { motion } from 'framer-motion';
import { PostCard } from '@/components/common/Card';

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
      {title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-dark text-center mb-10 sm:mb-12">{title}</h2>}
      
      {displayPosts.length > 0 ? (
        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {displayPosts.map((post, index) => (
            <PostCard
              key={post.slug}
              href={`/${post.slug}`}
              title={post.title}
              date={hideDate ? undefined : post.date}
              excerpt={post.excerpt}
              index={index}
            />
          ))}
        </motion.div>
      ) : (
        <p className="text-center text-gray-600 text-lg py-12">{emptyMessage}</p>
      )}
    </div>
  );
} 