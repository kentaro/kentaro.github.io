import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaYoutube,
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
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent1">
                  KENTARO
                </span>
                <span className="block text-2xl sm:text-3xl md:text-4xl font-bold text-dark mt-2">
                  KURIBAYASHI
                </span>
              </motion.h1>
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="mb-8"
              >
                <p className="text-lg sm:text-xl text-gray-700 mb-4 font-light">
                  技術と芸術が交差する場所で、新しい価値を創造
                </p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {["CTO", "AI Pioneer", "音楽家", "VJ", "Tool Builder"].map((tag, index) => (
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
                  <span className="relative z-10 font-bold">EXPLORE</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
                
                <Link 
                  href="/profile" 
                  className="px-8 py-4 border-2 border-dark rounded-full font-bold hover:bg-dark hover:text-white transition-all duration-300"
                >
                  PROFILE
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
                    src="https://pbs.twimg.com/profile_images/1893532407988367361/5EfifO80_400x400.jpg"
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
                  コードを書き、音楽を創り、ツールを生み出す。
                  <span className="text-primary font-bold">技術と芸術の境界を超えて</span>、
                  実用と表現の新しい形を探求し続けています。
                </p>
                <p className="text-lg leading-relaxed text-gray-600">
                  日々の開発では、Claude APIを活用した革新的なツールや、
                  開発者の生産性を高めるCLIツールを創造。
                  夜は音楽家・VJとして、Max for LiveやHydraを駆使し、
                  コードが生み出すリアルタイムな音と映像の世界を表現しています。
                </p>
                <p className="text-lg leading-relaxed text-gray-600">
                  GMOペパボのCTOとして組織を導きながら、研究者として学術の世界に貢献。
                  Motion JamやVibepadなど、体験型の音楽アプリも開発。
                  140を超える作品群が、技術と創造性の融合を物語っています。
                </p>
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
                    "AI活用開発・ツール作成",
                    "開発者向けCLIツール",
                    "Elixir/IoTシステム",
                    "Web技術・WebAssembly",
                    "音楽テクノロジー",
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
              境界を越えて、新しい価値を創造する
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🔬",
                title: "実践と理論の融合",
                desc: "CTOとして現場で実践しながら、博士として学術研究を推進。実務の課題を研究テーマに、研究成果を実務に還元",
                color: "from-primary/20 to-primary/5",
              },
              {
                icon: "🌊",
                title: "境界を超える探求",
                desc: "法学から情報科学、公務員からエンジニア、日中は経営者、夜は音楽家。異分野の知見が生む独自の視点",
                color: "from-secondary/20 to-secondary/5",
              },
              {
                icon: "🎭",
                title: "創造的な問題解決",
                desc: "開発ツールは音楽的に、音楽制作はプログラマティックに。異なる分野の手法を組み合わせた革新的アプローチ",
                color: "from-accent1/20 to-accent1/5",
              },
              {
                icon: "📡",
                title: "オープンな知の共有",
                desc: "コード、音楽、記事、講演、ポッドキャスト。あらゆるメディアで知見を発信し、コミュニティと共に成長",
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
                className="relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} rounded-3xl blur-xl`} />
                <div className="relative bg-white rounded-3xl p-6 shadow-lg">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-2 text-dark">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 制作物セクション */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-white via-light to-primary/5 relative overflow-hidden">
        {/* 背景の装飾 */}
        <div className="absolute inset-0">
          <motion.div
            animate={{ 
              x: [0, 100, 0],
              y: [0, -100, 0],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent1/10 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{ 
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ 
              duration: 25, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
            className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-secondary/10 to-transparent rounded-full blur-3xl"
          />
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
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent1 animate-text-gradient">
                CREATIONS
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              140を超える作品 ー コード、音楽、映像、そして言葉で表現する世界
            </p>
          </motion.div>

          {/* カテゴリタブ */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {[
              { type: "all", name: "すべて", icon: "✨" },
              { type: "tech-blog", name: "技術記事", icon: "📝" },
              { type: "video", name: "動画", icon: "🎬" },
              { type: "music", name: "音楽", icon: "🎵" },
              { type: "slide", name: "スライド", icon: "📊" },
              { type: "podcast", name: "ポッドキャスト", icon: "🎙️" },
            ].map((category, index) => (
              <motion.button
                key={category.type}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.05 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-sm font-medium hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10 hover:border-primary/20 transition-all duration-300"
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </motion.button>
            ))}
          </motion.div>

          {/* 制作物グリッド */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 技術記事サンプル */}
            <motion.a
              href="https://zenn.dev/pepabo/articles/af77d4502ef881"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <article className="relative bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="https://res.cloudinary.com/zenn/image/upload/s--AfCHL56x--/c_fit%2Cg_north_west%2Cl_text:notosansjp-medium.otf_55:Claude%2520API%25E3%2582%2592%2524100%252F%25E6%2597%25A5%25E4%25BD%25BF%25E3%2582%258F%25E3%2581%25AA%25E3%2581%2584%25E3%2581%25A8%25E6%2580%2592%25E3%2582%2589%25E3%2582%258C%25E3%2582%258B%25E3%2582%25A2%25E3%2583%2597%25E3%2583%25AA%25E3%2582%2592%25E4%25BD%259C%25E3%2581%25A3%25E3%2581%259F%25E8%25A9%25B1%2Cw_1010%2Cx_90%2Cy_100/g_south_west%2Cl_text:notosansjp-medium.otf_34:%25E6%25A0%2597%25E6%259E%2597%25E5%2581%25A5%25E5%25A4%25AA%25E9%2583%258E%2Cx_220%2Cy_108/bo_3px_solid_rgb:d6e3ed%2Cg_south_west%2Ch_90%2Cl_fetch:aHR0cHM6Ly9zdG9yYWdlLmdvb2dsZWFwaXMuY29tL3plbm4tdXNlci11cGxvYWQvYXZhdGFyLzA0ZTQxODhhYTMuanBlZw==%2Cr_20%2Cw_90%2Cx_92%2Cy_102/co_rgb:6e7b85%2Cg_south_west%2Cl_text:notosansjp-medium.otf_30:GMO%25E3%2583%259A%25E3%2583%2591%25E3%2583%259C%25E6%25A0%25AA%25E5%25BC%258F%25E4%25BC%259A%25E7%25A4%25BE%2Cx_220%2Cy_160/bo_4px_solid_white%2Cg_south_west%2Ch_50%2Cl_fetch:aHR0cHM6Ly9saDMuZ29vZ2xldXNlcmNvbnRlbnQuY29tL2EtL0FPaDE0R2l3Z0U0ekNxckk1TXgtbG95T0VURDdrdzkyRlVZNjNpendmVHMxaU9FPXMyNTAtYw==%2Cr_max%2Cw_50%2Cx_139%2Cy_84/v1627283836/default/og-base-w1200-v2.png"
                    alt="Claude APIを$100/日使わないと怒られるアプリ"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-primary to-secondary text-white text-xs font-bold rounded-full">
                    技術ブログ
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 text-dark group-hover:text-primary transition-colors line-clamp-2">
                    Claude APIを$100/日使わないと怒られるアプリを作った話
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    Claude APIの使用量が1日$100未満だと激怒してくるアプリ「Hundred Dollar Enforcer」を作りました。
                  </p>
                  <time className="text-xs text-gray-500 mt-auto pt-3 block">
                    2025年6月27日
                  </time>
                </div>
              </article>
            </motion.a>

            {/* 動画サンプル */}
            <motion.a
              href="https://www.youtube.com/watch?v=_G3XRMXgDcw"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent1/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <article className="relative bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src="https://i.ytimg.com/vi/_G3XRMXgDcw/hqdefault.jpg"
                    alt="Motion Jam"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-red-600 text-white text-xs font-bold rounded-full">
                    動画
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-l-[20px] border-l-red-600 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1" />
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 text-dark group-hover:text-primary transition-colors line-clamp-2">
                    Motion Jam: Move Your Body, Create the Beat
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    体の動きで音楽を生成する、インタラクティブなWebアプリケーション
                  </p>
                  <time className="text-xs text-gray-500 mt-auto pt-3 block">
                    2025年5月14日
                  </time>
                </div>
              </article>
            </motion.a>

            {/* 音楽サンプル */}
            <motion.a
              href="https://soundcloud.com/kentarok/launch"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent1/20 to-purple/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <article className="relative bg-white rounded-3xl overflow-hidden shadow-lg h-full flex flex-col">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src="https://i1.sndcdn.com/artworks-XegKbK6E7A4dpIzK-3AziEg-t3000x3000.jpg"
                    alt="Launch"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-orange-600 text-white text-xs font-bold rounded-full">
                    音楽
                  </div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="h-16 flex items-end gap-1">
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ 
                            height: ["20%", "100%", "20%"],
                          }}
                          transition={{ 
                            duration: 1, 
                            repeat: Infinity,
                            delay: i * 0.05,
                            ease: "easeInOut" 
                          }}
                          className="flex-1 bg-white/80 rounded-full"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold mb-2 text-dark group-hover:text-primary transition-colors">
                    Launch
                  </h3>
                  <p className="text-sm text-gray-600">
                    24, May 2025
                  </p>
                  <time className="text-xs text-gray-500 mt-auto pt-3 block">
                    2025年5月24日
                  </time>
                </div>
              </article>
            </motion.a>
          </div>

          {/* もっと見るボタン */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Link
              href="/works"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              すべての制作物を見る
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                →
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* フォローセクション */}
      <section className="py-20 md:py-32 bg-gradient-to-t from-dark to-gray-900 text-white relative overflow-hidden">
        {/* 装飾的な要素 */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-20 left-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary rounded-full blur-3xl" />
          </div>
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
              <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <FaXTwitter className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">X</h3>
                <p className="text-sm text-gray-300">@kentaro</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-purple-800 to-indigo-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <FaGithub className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">GitHub</h3>
                <p className="text-sm text-gray-300">@kentaro</p>
              </div>
            </motion.a>

            {/* YouTube */}
            <motion.a
              href="https://youtube.com/@kentarok"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-800 to-pink-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <FaYoutube className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">YouTube</h3>
                <p className="text-sm text-gray-300">@kentarok</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 to-blue-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <FaDiscord className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">Discord</h3>
                <p className="text-sm text-gray-300">Community</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-cyan-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <FaFacebook className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">Facebook</h3>
                <p className="text-sm text-gray-300">kentarok</p>
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
              <div className="absolute inset-0 bg-gradient-to-br from-green-800 to-emerald-900 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6 text-center">
                <MdEmail className="w-8 h-8 mb-3 mx-auto" />
                <h3 className="font-bold text-lg mb-1">Email</h3>
                <p className="text-sm text-gray-300">Contact</p>
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