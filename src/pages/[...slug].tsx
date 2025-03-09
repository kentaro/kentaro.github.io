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
  console.log('Rendering Post component:', { 
    hasPostData: !!postData
  });
  
  if (postData) {
    console.log('Post data title:', postData.title);
    console.log('Post data content length:', postData.contentHtml.length);
  }
  
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
        title={postData.title || ''}
        description={postData.excerpt || `${postData.title || ''}に関する記事`}
        ogType="article"
      />
      
      <MarkdownRenderer
        title={postData.title || ''}
        contentHtml={postData.contentHtml || ''}
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
  
  console.log('Processing slug:', slug);
  
  // マークダウンファイルのデータを取得
  const postData = await getMarkdownData(slug);
  
  console.log('Post data for slug:', slug, postData ? 'found' : 'not found');
  if (postData) {
    console.log('Title:', postData.title);
    console.log('Content length:', postData.contentHtml.length);
  }
  
  if (!postData) {
    return {
      notFound: true,
    };
  }

  // 日付が確実に文字列または null になるようにする
  if (postData.date instanceof Date) {
    postData.date = postData.date.toISOString();
  } else if (postData.date && typeof postData.date !== 'string') {
    postData.date = String(postData.date);
  } else if (postData.date === undefined) {
    postData.date = null;
  }

  return {
    props: {
      postData,
    },
  };
}; 