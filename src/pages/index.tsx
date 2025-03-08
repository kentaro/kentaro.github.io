import type { GetStaticProps } from 'next';
import { getProfileData, getAllMarkdownFiles, getMarkdownData, getCategories } from '../lib/markdown';
import Layout from '../components/layout/Layout';
import SEO from '../components/common/SEO';
import Profile from '../components/content/Profile';
import CategoryList from '../components/content/CategoryList';
import PostList from '../components/content/PostList';

type HomeProps = {
  profileData: {
    title?: string;
    contentHtml: string;
  };
  categories: {
    name: string;
    slug: string;
    count: number;
  }[];
  recentPosts: {
    slug: string;
    title: string;
    date?: string;
    excerpt?: string;
  }[];
};

export default function Home({ profileData, categories, recentPosts }: HomeProps) {
  return (
    <Layout>
      <SEO />
      
      <Profile profileData={profileData} />
      
      <CategoryList 
        categories={categories} 
        title="コンテンツ" 
      />
      
      <PostList 
        posts={recentPosts} 
        title="最近の投稿" 
      />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const profileData = await getProfileData();
  
  // カテゴリー情報を取得
  const categories = getCategories();
  
  // 最新の投稿を取得
  const files = getAllMarkdownFiles();
  const recentPostsData = await Promise.all(
    files.slice(0, 6).map(async ({ slug }) => {
      const data = await getMarkdownData(slug);
      return {
        slug,
        title: data?.title || slug.split('/').pop() || '',
        date: data?.date,
        excerpt: data?.excerpt,
      };
    })
  );

  return {
    props: {
      profileData: profileData || { title: 'プロフィール', contentHtml: '' },
      categories,
      recentPosts: recentPostsData,
    },
  };
}; 