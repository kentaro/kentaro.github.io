import type { GetStaticProps } from 'next';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';

export default function Home() {
  return (
    <Layout>
      <SEO />
      
      <div className="home-container">
        <h1>ようこそ</h1>
        <p>このサイトでは、ブログ記事やジャーナルなどのコンテンツを公開しています。</p>
        <p>メニューから各セクションにアクセスしてください。</p>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
}; 