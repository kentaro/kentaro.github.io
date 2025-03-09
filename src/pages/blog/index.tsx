import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PostList from '@/components/content/PostList';

type BlogPageProps = {
  posts: {
    slug: string;
    title: string;
    date?: string;
    excerpt?: string;
  }[];
};

export default function BlogPage({ posts }: BlogPageProps) {
  return (
    <Layout>
      <SEO 
        title="ブログ"
        description="ブログ記事の一覧"
      />
      
      <h1 className="category-title">ブログ</h1>
      
      <PostList 
        posts={posts}
        emptyMessage="ブログ記事はまだありません"
      />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  // blogディレクトリ内のマークダウンファイルを取得
  const allFiles = getAllMarkdownFiles();
  const blogPostsPromises = allFiles
    .filter(({ slug }) => slug.startsWith('blog/'))
    .map(async ({ slug }) => {
      const data = await getMarkdownData(slug);
      
      // 日付が確実に文字列または null になるようにする
      let date = data?.date;
      if (date instanceof Date) {
        date = date.toISOString();
      } else if (date && typeof date !== 'string') {
        date = String(date);
      } else if (date === undefined) {
        date = null;
      }
      
      return {
        slug,
        title: data?.title || slug.split('/').pop() || '',
        date,
        excerpt: data?.excerpt,
      };
    });
  
  const posts = await Promise.all(blogPostsPromises);

  return {
    props: {
      posts,
    },
  };
}; 