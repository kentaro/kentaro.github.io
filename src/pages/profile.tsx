import Head from "next/head";
import { useEffect } from "react";
import {
  PROFILE_DESCRIPTION,
  PROFILE_TITLE,
  PROFILE_URL,
} from "@/lib/profile";

export default function ProfileRedirect() {
  useEffect(() => {
    window.location.replace(PROFILE_URL);
  }, []);

  return (
    <>
      <Head>
        <title>{PROFILE_TITLE}</title>
        <meta name="description" content={PROFILE_DESCRIPTION} />
        <link rel="canonical" href={PROFILE_URL} />
        <meta httpEquiv="refresh" content={`0; url=${PROFILE_URL}`} />
      </Head>
      <main className="wrap article-wrap">
        <h1 className="article-title">プロフィールを移転しました</h1>
        <p>{PROFILE_DESCRIPTION}</p>
        <p>
          <a href={PROFILE_URL}>栗林健太郎のプロフィールを見る</a>
        </p>
      </main>
    </>
  );
}
