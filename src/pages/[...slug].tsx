import type { GetStaticPaths, GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';

type PostProps = {
  postData: {
    title: string;
    contentHtml: string;
    date?: string;
    excerpt?: string;
    [key: string]: unknown;
  } | null;
};

export default function Post({ postData }: PostProps) {
  if (!postData) {
    return (
      <Layout>
        <div className="error-message">
          <h1>コンテンツが見つかりません</h1>
          <p>お探しのページは存在しないか、移動した可能性があります。</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={postData.title}
        description={postData.excerpt || `${postData.title}に関する記事`}
        ogType="article"
      />
      
      <MarkdownRenderer
        title={postData.title}
        contentHtml={postData.contentHtml}
      />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const files = getAllMarkdownFiles();
  
  // デバッグ用に出力
  console.log('Generated paths:', JSON.stringify(files, null, 2));
  
  const paths = files.map(({ slug }) => {
    // スラッグをパスのパラメータに変換
    return {
      params: {
        slug: slug.split('/').filter(Boolean),
      },
    };
  });

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const slugPath = params?.slug as string[];
  const slug = slugPath.join('/');
  
  const postData = await getMarkdownData(slug);
  
  if (!postData) {
    return {
      notFound: true,
    };
  }

  // Dateオブジェクトを文字列に変換
  if (postData.date instanceof Date) {
    postData.date = postData.date.toISOString();
  } else if (postData.date === undefined) {
    postData.date = null;
  }

  return {
    props: {
      postData,
    },
  };
}; 