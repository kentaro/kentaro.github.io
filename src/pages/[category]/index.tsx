import type { GetStaticPaths, GetStaticProps } from 'next';
import { getAllMarkdownFiles, getMarkdownData } from '../../lib/markdown';
import Layout from '../../components/layout/Layout';
import SEO from '../../components/common/SEO';
import PostList from '../../components/content/PostList';
import fs from 'node:fs';
import path from 'node:path';

type CategoryPageProps = {
  category: string;
  posts: {
    slug: string;
    title: string;
    date?: string;
    excerpt?: string;
  }[];
};

export default function CategoryPage({ category, posts }: CategoryPageProps) {
  const categoryTitle = category.charAt(0).toUpperCase() + category.slice(1);
  
  return (
    <Layout>
      <SEO 
        title={categoryTitle}
        description={`${categoryTitle}に関する記事一覧`}
      />
      
      <h1 className="category-title">{categoryTitle}</h1>
      
      <PostList 
        posts={posts}
        emptyMessage={`${categoryTitle}に関する投稿はまだありません`}
      />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const obsidianPublicDir = path.join(process.cwd(), 'obsidian/public');
  
  if (!fs.existsSync(obsidianPublicDir)) {
    return {
      paths: [],
      fallback: false,
    };
  }
  
  const directories = fs.readdirSync(obsidianPublicDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  const paths = directories.map(dir => ({
    params: { category: dir },
  }));

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const category = params?.category as string;
  
  // カテゴリーに属する投稿を取得
  const allFiles = getAllMarkdownFiles();
  const categoryPostsPromises = allFiles
    .filter(({ slug }) => slug.startsWith(`${category}/`))
    .map(async ({ slug }) => {
      const data = await getMarkdownData(slug);
      return {
        slug,
        title: data?.title || slug.split('/').pop() || '',
        date: data?.date,
        excerpt: data?.excerpt,
      };
    });
  
  const posts = await Promise.all(categoryPostsPromises);

  return {
    props: {
      category,
      posts,
    },
  };
}; 