import type { GetStaticProps } from 'next';
import { getProfileData } from '@/lib/markdown';
import Layout from '@/components/layout/Layout';
import SEO from '@/components/common/SEO';
import Profile from '@/components/content/Profile';

type HomeProps = {
  profileData: {
    title?: string;
    contentHtml: string;
  };
};

export default function Home({ profileData }: HomeProps) {
  return (
    <Layout>
      <SEO />
      
      <Profile profileData={profileData} />
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const profileData = await getProfileData();

  return {
    props: {
      profileData: profileData || { title: 'プロフィール', contentHtml: '' },
    },
  };
}; 