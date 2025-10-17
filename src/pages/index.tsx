import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
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
  const [language, setLanguage] = useState<'ja' | 'en' | 'fr' | 'ko'>('ja');
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
            {/* 言語インジケーター */}
            <div className="flex justify-center gap-2 mb-8 flex-wrap">
              <button
                onClick={() => setLanguage('ja')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  language === 'ja'
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                日本語
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  language === 'en'
                    ? 'bg-secondary text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('fr')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  language === 'fr'
                    ? 'bg-accent1 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Français
              </button>
              <button
                onClick={() => setLanguage('ko')}
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  language === 'ko'
                    ? 'bg-accent2 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                한국어
              </button>
            </div>

            {/* ミッションステートメント */}
            <motion.div
              key={language}
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: -90 }}
              transition={{ duration: 0.5 }}
              className="text-2xl sm:text-3xl md:text-4xl text-gray-700 space-y-10 [&_p]:leading-loose"
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startY = e.touches[0].clientY;
                const handleTouchEnd = (endEvent: TouchEvent) => {
                  const endX = endEvent.changedTouches[0].clientX;
                  const endY = endEvent.changedTouches[0].clientY;
                  const diffX = startX - endX;
                  const diffY = startY - endY;

                  // 横方向の移動が縦方向より大きい場合のみ言語切り替え
                  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) {
                      // スワイプ左（次へ）
                      if (language === 'ja') setLanguage('en');
                      else if (language === 'en') setLanguage('fr');
                      else if (language === 'fr') setLanguage('ko');
                      else setLanguage('ja');
                    } else {
                      // スワイプ右（前へ）
                      if (language === 'ja') setLanguage('ko');
                      else if (language === 'ko') setLanguage('fr');
                      else if (language === 'fr') setLanguage('en');
                      else setLanguage('ja');
                    }
                  }
                  document.removeEventListener('touchend', handleTouchEnd);
                };
                document.addEventListener('touchend', handleTouchEnd);
              }}
            >
              {language === 'ja' && (
                <>
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
                </>
              )}

              {language === 'en' && (
                <>
                  <p>Concept and structure are produced.</p>
                  <p className="space-y-2">
                    <span className="block">Concept arises from a rupture in the real.</span>
                    <span className="block">Structure sets it within reality, without closure.</span>
                  </p>
                  <p className="space-y-2">
                    <span className="block">Detour, suspension, correction.</span>
                    <span className="block">Production repeats; difference appears.</span>
                  </p>
                  <p>The world becomes again.</p>
                </>
              )}

              {language === 'fr' && (
                <>
                  <p>Je produis le concept et la structure.</p>
                  <p className="space-y-2">
                    <span className="block">Le concept naît de la faille du réel.</span>
                    <span className="block">La structure le dresse dans le réel, sans le clore.</span>
                  </p>
                  <p className="space-y-2">
                    <span className="block">Détour, suspension, rectification :</span>
                    <span className="block">la production se répète, la différence paraît.</span>
                  </p>
                  <p>Le monde devient encore.</p>
                </>
              )}

              {language === 'ko' && (
                <>
                  <p>개념과 구조를 제작한다.</p>
                  <p className="space-y-2">
                    <span className="block">개념은 현실의 틈에서 발생한다.</span>
                    <span className="block">구조는 개념을 현실에 임시로 세운다.</span>
                  </p>
                  <p className="space-y-2">
                    <span className="block">우회, 정지, 수정의 과정을 품으며</span>
                    <span className="block">제작은 반복되고, 차이가 드러난다.</span>
                  </p>
                  <p>세계는 다시 생성된다.</p>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 公的な軸セクション */}
      <section id="domains" className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-light via-white to-accent2/10">
        <div className="container max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-dark">
              Concept & Architecture
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              世界をどう構想し（Concept）、どう実装するか（Architecture）。<br />
              思想・事業・文化・学問を横断する。
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* カルチャー */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl h-full border-t-4 border-primary">
                <h3 className="text-3xl font-bold mb-6 text-primary">カルチャー</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  文芸、アート、サブカルチャー。
                </p>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  技術と思想をつなぐ語り手として、文化的影響を持つ。
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  エッセイ、対談、展覧を通じて、新しい知的ムーブメントを形成する。文化的シーンでのプレゼンス形成は、内的に最も満たされる領域である。
                </p>
              </div>
            </motion.div>

            {/* ビジネス */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl h-full border-t-4 border-secondary">
                <h3 className="text-3xl font-bold mb-6 text-secondary">ビジネス</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  職業的活動、企業経営、技術実践。
                </p>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  コンセプトドリブンな事業を創出し、経済的・社会的影響力を持つ。
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  上場企業CTOとして、思想を実装するプロダクトを複数生み出す。より強い成長と影響力を追求し、組織と技術の革新を推進する。
                </p>
              </div>
            </motion.div>

            {/* アカデミア */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl h-full border-t-4 border-accent1">
                <h3 className="text-3xl font-bold mb-6 text-accent1">アカデミア</h3>
                <p className="text-lg text-gray-700 leading-relaxed mb-4">
                  研究、思想、理論的活動。
                </p>
                <p className="text-base text-gray-600 leading-relaxed mb-4">
                  実装可能な思想を探求する学問領域を確立する。
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">
                  博士号を起点に、実務と研究の両輪で知見を深化させる。独自の学術分野を形成し、論文・教育へ展開、学術的な貢献を行う。
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* プロフィール要約セクション */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-gradient-to-br from-white via-accent2/5 to-light">
        <div className="container max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-8 text-dark">
              Profile
            </h2>
          </motion.div>

          {/* 数字で見る実績 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {[
              { number: "2017~", label: "取締役CTO", icon: "🏢" },
              { number: "2025", label: "博士（情報科学）", icon: "🎓" },
              { number: "17年", label: "エンジニア歴", icon: "💻" },
              { number: "100+", label: "講演・執筆", icon: "🎤" },
            ].map((item, index) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white rounded-2xl p-6 shadow-lg text-center"
              >
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="text-3xl font-bold text-primary mb-1">{item.number}</div>
                <div className="text-sm text-gray-600">{item.label}</div>
              </motion.div>
            ))}
          </div>

          {/* プロフィール要約 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* カルチャー */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-primary">
                <h4 className="text-xl font-bold mb-4 text-primary">カルチャー</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  年間200冊近くの読書を通じて、歴史・アート・思想などの人文系諸ジャンルから情報科学まで幅広く探求。歌舞伎、現代アート、語学など文化的活動を通じて、技術と思想をつなぐ語り手としての視点を育んでいる。
                </p>
              </div>

              {/* ビジネス */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-secondary">
                <h4 className="text-xl font-bold mb-4 text-secondary">ビジネス</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  2008年はてな入社、2012年GMOペパボ入社。2014年より技術責任者、2017年より取締役CTO。エンジニア組織のマネジメント、技術基盤整備、事業開発に従事。ペパボ研究所長、日本CTO協会理事として組織開発と技術戦略を牽引。
                </p>
              </div>

              {/* アカデミア */}
              <div className="bg-white rounded-3xl p-6 shadow-lg border-l-4 border-accent1">
                <h4 className="text-xl font-bold mb-4 text-accent1">アカデミア</h4>
                <p className="text-gray-700 leading-relaxed text-sm">
                  2020年北陸先端科学技術大学院入学、2025年博士（情報科学）取得。IoTシステムの基盤技術、Elixir/Erlang/OTPの応用を研究。国際会議登壇、情報処理学会優秀論文賞受賞。実務と研究の両輪で知見を深化させる。
                </p>
              </div>
            </div>
          </motion.div>

          {/* 詳細プロフィールへのリンク */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              詳しいプロフィールを見る
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