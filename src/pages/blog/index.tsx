import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PostList from '@/components/content/PostList';
import { FaRss } from 'react-icons/fa';
import Link from 'next/link';

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
        description="栗林健太郎のブログ記事一覧。技術、マネジメント、読書などについての記事を掲載しています。"
      />
      
      <div className="page-header bg-gradient-to-br from-primary/10 to-accent2/10 py-12 md:py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-center">ブログ</h1>
          <p className="text-center text-gray-600 mt-4 max-w-2xl mx-auto">
            技術、マネジメント、読書など、さまざまなトピックについての記事を掲載しています。
          </p>
          <div className="flex justify-center mt-4">
            <Link href="/blog/feed.xml" className="inline-flex items-center text-primary hover:text-primary-dark">
              <FaRss className="mr-1" />
              <span>RSS</span>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="py-12">
        <PostList 
          posts={posts}
          emptyMessage="ブログ記事はまだありません"
        />
      </div>
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