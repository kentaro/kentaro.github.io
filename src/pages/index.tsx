import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaDiscord,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import Layout from "../components/layout/Layout";
import SEO from "../components/common/SEO";

export default function Home() {
  return (
    <Layout>
      <SEO
        title="ホーム"
        description="栗林健太郎のウェブサイト。GMOペパボ株式会社取締役CTO / 一般社団法人日本CTO協会理事 / 博士（情報科学）/ 情報処理安全確保支援士"
      />

      {/* アーティスティックヒーローセクション */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden -mt-[80px]">
        {/* 背景のアニメーション要素 */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.03 }}
            transition={{ duration: 1 }}
            className="absolute inset-0"
            style={{
              background: `
                radial-gradient(circle at 20% 80%, #FF6B6B 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, #4ECDC4 0%, transparent 50%),
                radial-gradient(circle at 40% 40%, #FFE66D 0%, transparent 50%)
              `,
            }}
          />
          
          {/* 動く幾何学的形状 */}
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "linear" 
            }}
            className="absolute top-20 right-20 w-96 h-96 opacity-5"
          >
            <div className="w-full h-full border-8 border-primary rotate-45" />
          </motion.div>
          
          <motion.div
            animate={{ 
              rotate: -360,
              y: [0, 50, 0],
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute bottom-10 left-10 w-64 h-64 opacity-5"
          >
            <div className="w-full h-full bg-gradient-to-br from-secondary to-accent1 rounded-full" />
          </motion.div>
        </div>

        <div className="container max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* テキストコンテンツ */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center md:text-left"
            >
              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display font-black mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <span className="text-dark">
                  栗林健太郎
                </span>
              </motion.h1>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-8"
              >
                <p className="text-2xl sm:text-3xl md:text-4xl text-gray-800 mb-6 font-bold">
                  概念と構造を制作する。
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {["CTO", "技術戦略", "エンジニアリングマネジメント", "博士（情報科学）", "情報処理安全確保支援士"].map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className="px-4 py-2 bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
                className="flex flex-wrap gap-4 justify-center md:justify-start"
              >
                <button 
                  type="button"
                  onClick={() => {
                    const profileSection = document.getElementById('about');
                    if (profileSection) {
                      profileSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group relative px-8 py-4 bg-dark text-white rounded-full overflow-hidden transition-all duration-300 hover:scale-105"
                >
                  <span className="relative z-10 font-bold">詳しく見る</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <Link 
                  href="/profile" 
                  className="px-8 py-4 border-2 border-dark rounded-full font-bold hover:bg-dark hover:text-white transition-all duration-300"
                >
                  プロフィール
                </Link>
              </motion.div>
            </motion.div>

            {/* ビジュアル要素 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative w-80 h-80 sm:w-96 sm:h-96 mx-auto">
                {/* 装飾的な背景要素 */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0"
                >
                  <div className="absolute inset-8 border-4 border-primary/20 rounded-full" />
                  <div className="absolute inset-4 border-4 border-secondary/20 rounded-full rotate-45" />
                  <div className="absolute inset-12 border-4 border-accent1/20 rounded-full rotate-90" />
                </motion.div>
                
                {/* メイン画像 */}
                <div className="absolute inset-12 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                  <Image
                    src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
                    alt="栗林健太郎"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                
                {/* フローティングタグ */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-4 -right-4 bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg"
                >
                  あんちぽ
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* スクロール指示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-dark/30 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-dark/30 rounded-full mt-2" />
          </motion.div>
        </motion.div>
      </section>

      {/* ミッションステートメントセクション */}
      <section className="py-12 md:py-16 relative overflow-hidden bg-gradient-to-br from-white via-light to-white">
        <div className="container max-w-4xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="text-2xl sm:text-3xl md:text-4xl text-gray-700 space-y-10 [&_p]:leading-loose">
              <p>概念と構造を制作する。</p>
              <p className="space-y-2">
                <span className="block">概念は、現実の裂け目から生じる。</span>
                <span className="block">構造は、概念を現実へと仮設する。</span>
              </p>
              <p className="space-y-2">
                <span className="block">迂遠、停滞、訂正を孕みながら、</span>
                <span className="block">制作を反復し、差異が立ち現れる。</span>
              </p>
              <p>世界がまた生成する。</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* アバウトセクション */}
      <section
        id="about"
        className="py-20 md:py-32 relative overflow-hidden"
      >
        {/* 背景パターン */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FF6B6B' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-primary">
                ABOUT ME
              </span>
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-primary to-secondary mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-12 gap-8 items-start">
            {/* 左側 - クリエイティブな肩書き表示 */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="md:col-span-5"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
                <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl">
                  <h3 className="text-3xl font-bold mb-6 text-dark">栗林健太郎</h3>
                  <div className="space-y-4">
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-lg font-medium">GMOペパボ株式会社 取締役CTO</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-secondary rounded-full" />
                      <span className="text-lg font-medium">日本CTO協会 理事</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-accent1 rounded-full" />
                      <span className="text-lg font-medium">博士（情報科学）</span>
                    </motion.div>
                    <motion.div
                      whileHover={{ x: 10 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-2 h-2 bg-purple rounded-full" />
                      <span className="text-lg font-medium">あんちぽ @kentaro</span>
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 右側 - ストーリーテリング */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="md:col-span-7"
            >
              <div className="space-y-6">
                <p className="text-xl leading-relaxed text-gray-700">
                  テクノロジーとビジネスの架け橋として、
                  <span className="text-primary font-bold">組織の成長と技術革新</span>を推進。
                  実践と研究の両輪で価値創造に取り組んでいます。
                </p>
                <p className="text-lg leading-relaxed text-gray-600">
                  GMOペパボ株式会社のCTOとして技術戦略の策定と実行をリード。
                  エンジニアリングマネジメントと組織開発を通じて、
                  開発生産性の向上と技術文化の醸成に注力しています。
                </p>
                <p className="text-lg leading-relaxed text-gray-600">
                  博士（情報科学）としての研究活動と実務経験を活かし、
                  最新技術の事業応用と技術者育成に貢献。
                  日本CTO協会理事として、業界全体の発展にも尽力しています。
                </p>
                <div className="mt-8">
                  <Link
                    href="/profile"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
                  >
                    詳しいプロフィールを見る
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                      →
                    </motion.span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* スキル＆専門分野セクション */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-light via-white to-accent2/10 relative overflow-hidden">
        {/* アニメーション背景 */}
        <motion.div
          animate={{ 
            scale: [1, 1.5, 1],
            rotate: [0, 180, 360],
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity,
            ease: "linear" 
          }}
          className="absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl"
        />

        <div className="container max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                EXPERTISE
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              技術の深さと広さを兼ね備えた、多面的なスキルセット
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 技術スキル */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/20 to-transparent rounded-bl-full" />
                <h3 className="text-2xl font-bold mb-6 text-dark relative z-10">技術スキル</h3>
                <div className="space-y-3">
                  {[
                    "AI活用開発・LLM応用",
                    "クラウドアーキテクチャ",
                    "マイクロサービス設計",
                    "DevOps・CI/CD",
                    "セキュリティ・監査",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full group-hover/item:scale-150 transition-transform" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* マネジメント */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-secondary/20 to-transparent rounded-bl-full" />
                <h3 className="text-2xl font-bold mb-6 text-dark relative z-10">マネジメント</h3>
                <div className="space-y-3">
                  {[
                    "エンジニアリングマネジメント",
                    "技術戦略立案",
                    "組織開発・文化醸成",
                    "リーンプロセス導入",
                    "スクラム開発推進",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className="w-2 h-2 bg-secondary rounded-full group-hover/item:scale-150 transition-transform" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* 研究・執筆 */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="relative bg-white rounded-3xl p-8 shadow-xl overflow-hidden h-full">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent1/20 to-transparent rounded-bl-full" />
                <h3 className="text-2xl font-bold mb-6 text-dark relative z-10">研究・執筆</h3>
                <div className="space-y-3">
                  {[
                    "技術書籍・雑誌執筆",
                    "Webメディア連載・寄稿",
                    "ポッドキャスト配信",
                    "カンファレンス登壇",
                    "メディア取材・インタビュー",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 group/item"
                    >
                      <div className="w-2 h-2 bg-accent1 rounded-full group-hover/item:scale-150 transition-transform" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ワークスタイルセクション */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="container max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-dark to-primary">
                WORK STYLE
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              技術リーダーシップでビジネスの成長を加速
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🏢",
                title: "経営と技術の橋渡し",
                desc: "GMOペパボ取締役CTOとして、技術戦略の策定と実行を推進。経営視点と技術視点の両面からビジネス価値を創出",
                color: "from-primary/20 to-primary/5",
              },
              {
                icon: "👥",
                title: "組織開発とマネジメント",
                desc: "エンジニアリングマネジメントとスクラム開発の推進。技術組織の成長と開発生産性の向上に注力",
                color: "from-secondary/20 to-secondary/5",
              },
              {
                icon: "🎓",
                title: "実務と研究の両立",
                desc: "博士（情報科学）として学術研究に従事。実務で得た知見を研究に活かし、研究成果を事業に応用",
                color: "from-accent1/20 to-accent1/5",
              },
              {
                icon: "📚",
                title: "技術コミュニティへの貢献",
                desc: "日本CTO協会理事として業界発展に尽力。技術記事執筆、カンファレンス登壇、OSS活動を通じて知見を共有",
                color: "from-purple/20 to-purple/5",
              },
            ].map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="relative h-full"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl`} />
                <div className="relative bg-white rounded-3xl p-6 shadow-lg h-full flex flex-col">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-dark">{item.title}</h3>
                  <p className="text-gray-600 text-sm flex-1">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* フォローセクション */}
      <section className="py-20 md:py-32 bg-gradient-to-t from-dark to-gray-900 text-white relative overflow-hidden">

        <div className="container max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-black mb-6 text-white">
              CONNECT
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              最新の技術情報や研究成果、日々の活動をフォローしよう
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {/* X (Twitter) */}
            <motion.a
              href="https://x.com/kentaro"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <FaXTwitter className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">X</h3>
                <p className="text-sm text-gray-600">@kentaro</p>
              </div>
            </motion.a>

            {/* GitHub */}
            <motion.a
              href="https://github.com/kentaro"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <FaGithub className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">GitHub</h3>
                <p className="text-sm text-gray-600">@kentaro</p>
              </div>
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              href="https://www.linkedin.com/in/kentaro-kuribayashi"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <FaLinkedin className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">LinkedIn</h3>
                <p className="text-sm text-gray-600">Kentaro Kuribayashi</p>
              </div>
            </motion.a>

            {/* Discord */}
            <motion.a
              href="https://discord.gg/SXyKFCyMd5"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <FaDiscord className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">Discord</h3>
                <p className="text-sm text-gray-600">Community</p>
              </div>
            </motion.a>

            {/* Facebook */}
            <motion.a
              href="https://facebook.com/kentarok"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <FaFacebook className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">Facebook</h3>
                <p className="text-sm text-gray-600">kentarok</p>
              </div>
            </motion.a>

            {/* メール */}
            <motion.a
              href="mailto:kentarok@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: 2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
              <div className="relative bg-white border border-gray-200 rounded-3xl p-6 text-center hover:shadow-lg transition-shadow">
                <MdEmail className="w-8 h-8 mb-3 mx-auto text-gray-700" />
                <h3 className="font-bold text-lg mb-1 text-dark">Email</h3>
                <p className="text-sm text-gray-600">Contact</p>
              </div>
            </motion.a>
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