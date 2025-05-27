import type { GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import PageHeader from '@/components/common/PageHeader';
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
        description="栗林健太郎のブログ記事一覧。技術、マネジメント、読書などについての記事を掲載しています。"
      />
      
      <PageHeader
        title="ブログ"
        description="技術、マネジメント、読書など、さまざまなトピックについての記事を掲載しています。"
        rssLink="/blog/feed.xml"
      />
      
      <section className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container max-w-5xl">
          <PostList 
            posts={posts}
            emptyMessage="ブログ記事はまだありません"
          />
        </div>
      </section>
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