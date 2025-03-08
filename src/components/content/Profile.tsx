import MarkdownRenderer from '@/components/content/MarkdownRenderer';

type ProfileProps = {
  profileData: {
    title?: string;
    contentHtml: string;
  };
};

export default function Profile({ profileData }: ProfileProps) {
  return (
    <section className="profile-section">
      <MarkdownRenderer
        title={profileData.title || 'プロフィール'}
        contentHtml={profileData.contentHtml}
      />
    </section>
  );
} 