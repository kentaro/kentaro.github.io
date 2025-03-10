import type { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTwitter, FaGithub, FaYoutube, FaFacebook, FaLinkedin } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import Layout from '../components/layout/Layout';
import SEO from '../components/common/SEO';

export default function Home() {
  return (
    <Layout>
      <SEO 
        title="ホーム" 
        description="栗林健太郎のウェブサイト。GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）/ 情報処理安全確保支援士"
      />
      
      {/* ヒーローセクション */}
      <section className="relative bg-gradient-to-br from-primary/10 to-accent2/10 py-8 sm:py-12 md:py-16 mt-14">
        <div className="container max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center md:items-center gap-6 md:gap-8">
            <div className="md:flex-1 order-2 md:order-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center md:text-left"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-dark">
                  <span className="text-primary">技術と知見</span>で<br className="hidden sm:block" />
                  未来を創造する
                </h1>
                <p className="text-base sm:text-lg mb-5 sm:mb-6 text-gray-700 max-w-xl">
                  異分野を横断する視点と経験。
                  法学から情報科学へ、公務員からCTOへ。
                  境界を越えて技術の新たな可能性を切り拓きます。
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4">
                  <Link href="/profile" className="btn btn-primary">
                    プロフィールを見る
                  </Link>
                  <Link href="/blog" className="btn btn-secondary">
                    ブログを読む
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="order-1 md:order-2 flex-shrink-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex justify-center"
              >
                <div className="relative w-40 h-40 sm:w-44 sm:h-44 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  <Image
                    src="https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg"
                    alt="栗林健太郎"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      
      {/* プロフィールセクション */}
      <section id="profile" className="pt-6 sm:pt-8 md:pt-12 pb-10 sm:pb-14 md:pb-20 bg-white">
        <div className="container">
          <h2 className="section-title">プロフィール</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 text-primary text-center">栗林健太郎</h3>
              <div className="bg-primary/5 py-3 px-4 rounded-lg mb-6 max-w-3xl mx-auto">
                <p className="text-center text-base sm:text-lg text-gray-700 font-medium leading-relaxed">
                  <span className="inline-block">GMOペパボ株式会社取締役CTO</span> <span className="text-primary/70 mx-1">/</span> 
                  <span className="inline-block">一般社団法人日本CTO協会理事</span> <span className="text-primary/70 mx-1">/</span> 
                  <span className="inline-block">博士（情報科学）</span>
                  <br />
                  <span className="inline-block">インターネット上では「あんちぽ」として知られる</span>
                </p>
              </div>
              
              <div className="space-y-4 sm:space-y-5 mb-6">
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">学歴・資格</h4>
                    <p className="text-gray-700 text-sm sm:text-base">1976年奄美大島生まれ。東京都立大学法学部卒業後、48歳で北陸先端科学技術大学院から博士号取得。IoTシステム基盤技術の研究で情報処理学会から優秀論文賞・優秀プレゼンテーション賞をW受賞。情報処理安全確保支援士、TOEIC 890点、G検定、Google Cloud Professional MLエンジニア資格保有。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">経歴</h4>
                    <p className="text-gray-700 text-sm sm:text-base">自作ブログがプログラミングの起点に。奄美市役所から2008年に株式会社はてなへ転身。2012年にGMOペパボに参画し、技術基盤整備とサービス開発に従事。2014年に技術責任者、2015年に執行役員CTO、2017年に取締役CTOへ。リーンプロセスやスクラムの導入など、開発プロセス改善にも注力。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">趣味・活動</h4>
                    <p className="text-gray-700 text-sm sm:text-base">年間200冊を読破する知の探究者。人文科学から情報科学まで幅広く学び続ける。アマチュア無線（JK1RZR）やWeb3（antipop.eth）など最新技術にも精通。VRChatなどのソーシャルVRでの活動や、歌舞伎・落語鑑賞、現代作家のうつわコレクション、江戸前鮨など、デジタルとアナログを行き来する多彩な趣味を持つ。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">研究分野</h4>
                    <p className="text-gray-700 text-sm sm:text-base">IoTシステムの基盤技術、ElixirやErlang/OTPのIoTシステムへの応用について研究。ペパボ研究所では技術研究と実用化の架け橋となる活動を推進。情報処理学会優秀論文賞・優秀プレゼンテーション賞受賞。国際会議での発表実績あり。</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-primary/10 p-2 rounded-full mr-3 mt-0.5 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-base sm:text-lg">執筆・講演</h4>
                    <p className="text-gray-700 text-sm sm:text-base">『Elixir実践入門』（共著）、『入門Puppet』（単著）など書籍の執筆。WEB+DB PRESSでの特集記事多数。国内外での講演多数（ElixirConf US、RedDotRubyConfなど）。GMO Developers Day、BIT VALLEYなどでのパネルディスカッション登壇多数。</p>
                  </div>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-bold mb-3 flex items-center text-sm sm:text-base">
                  <span className="bg-primary/10 p-1 rounded-full mr-2 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-primary" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" role="img">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </span>
                  スキル・専門分野
                </h4>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">Elixir</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">IoT</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">分散システム</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">AI技術</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">エンジニアリングマネジメント</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">研究開発</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">リーンプロセス</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">技術戦略</span>
                  <span className="bg-primary/10 text-primary px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2xs sm:text-xs">組織開発</span>
                </div>
              </div>
              
              <div className="text-center">
                <Link href="/profile" className="btn btn-primary">
                  詳細プロフィールを見る
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* フォローセクション */}
      <section className="section bg-gradient-to-br from-accent1/10 to-accent2/10">
        <div className="container">
          <h2 className="section-title">栗林健太郎をフォローしよう！</h2>
          <p className="text-center text-gray-700 mb-8 sm:mb-16 max-w-2xl mx-auto text-sm sm:text-base">
            最新の技術情報や研究成果、日々の活動などをSNSで発信しています。
            ぜひフォローして、最新情報をチェックしてください。
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
            {/* X (Twitter) */}
            <a 
              href="https://x.com/kentaro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <FaTwitter className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">X (Twitter)</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                日々の活動や技術的な気づきを発信しています
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">@kentaro</span>
            </a>
            
            {/* GitHub */}
            <a 
              href="https://github.com/kentaro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <FaGithub className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">GitHub</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                オープンソースプロジェクトやコード例を公開しています
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">@kentaro</span>
            </a>
            
            {/* YouTube */}
            <a 
              href="https://youtube.com/@kentarok" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <FaYoutube className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">YouTube</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                音楽や動画作成等の趣味に関する動画を配信しています
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">@kentarok</span>
            </a>
            
            {/* Facebook */}
            <a 
              href="https://facebook.com/kentarok" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <FaFacebook className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Facebook</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                イベント情報やプロフェッショナルな活動を共有しています
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">kentarok</span>
            </a>
            
            {/* LinkedIn */}
            <a 
              href="https://www.linkedin.com/in/kentaro-kuribayashi" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <FaLinkedin className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">LinkedIn</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                職歴やプロフェッショナルなネットワークを公開しています
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">kentaro-kuribayashi</span>
            </a>
            
            {/* メール */}
            <a 
              href="mailto:kentarok@gmail.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="card flex flex-col items-center text-center hover:bg-primary/5 p-4 sm:p-6"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-primary/10 text-primary rounded-full mb-3 sm:mb-4">
                <MdEmail className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">メール</h3>
              <p className="text-gray-600 mb-2 sm:mb-4 text-xs sm:text-sm">
                お問い合わせやご連絡はこちらからどうぞ
              </p>
              <span className="text-primary font-medium text-sm sm:text-base">kentarok@gmail.com</span>
            </a>
          </div>
      </div>
      </section>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
}; 