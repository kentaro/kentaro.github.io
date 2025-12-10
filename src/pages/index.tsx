import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaDiscord,
  FaRocket,
  FaBolt,
  FaRobot,
  FaGraduationCap,
  FaBriefcase,
  FaPalette,
  FaArrowRight,
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

      {/* ===== HERO ===== */}
      <section className="h-screen flex items-center justify-center bg-light relative overflow-hidden -mt-20">
        {/* Background decoration */}
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent1/10 to-primary/10 rounded-full blur-3xl" />

        <div className="container max-w-4xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Photo */}
            <div className="w-32 h-32 md:w-40 md:h-40 relative mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-full blur-2xl opacity-30 scale-110" />
              <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white shadow-2xl">
                <Image
                  src="https://pbs.twimg.com/profile_images/1964961444673531905/wD3BXCk2_400x400.jpg"
                  alt="栗林健太郎"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            <p className="text-primary font-bold tracking-[0.3em] text-sm mb-4 uppercase">
              Concept & Architecture
            </p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-dark leading-none mb-6">
              栗林健太郎
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-10">
              概念と構造を制作する
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              {[
                "GMOペパボ取締役CTO",
                "日本CTO協会理事",
                "博士（情報科学）",
              ].map((title) => (
                <span
                  key={title}
                  className="bg-white/80 backdrop-blur border border-gray-200 text-dark px-5 py-2.5 rounded-full text-sm font-bold shadow-sm"
                >
                  {title}
                </span>
              ))}
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-3 bg-dark text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary hover:scale-105 transition-all shadow-lg"
            >
              プロフィールを見る
              <FaArrowRight />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ===== STATEMENT ===== */}
      <section className="py-32 bg-dark">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              <span className="text-primary">概念</span>は、現実の裂け目から生じる。
            </p>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              <span className="text-primary">構造</span>は、概念を現実へと仮設する。
            </p>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              迂遠、停滞、訂正を孕みながら、<span className="text-primary">制作</span>を反復し、差異が立ち現れる。
            </p>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              世界がまた<span className="text-primary">生成</span>する。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== THREE PILLARS ===== */}
      <section className="py-24 bg-white">
        <div className="container max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Three Pillars</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                活動の3つの軸
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaPalette className="text-4xl" />,
                  title: "Culture",
                  subtitle: "カルチャー",
                  desc: "文芸、アート、サブカルチャー。技術と思想をつなぐ語り手。",
                  items: ["年間200冊読書", "歌舞伎・現代アート", "ポッドキャスト配信", "多言語学習"],
                  color: "from-purple to-primary",
                },
                {
                  icon: <FaBriefcase className="text-4xl" />,
                  title: "Business",
                  subtitle: "ビジネス",
                  desc: "上場企業CTOとしてクリエイター支援プラットフォームを技術で支える。",
                  items: ["GMOペパボ取締役CTO", "日本CTO協会理事", "GitHub 400+リポジトリ", "講演・執筆多数"],
                  color: "from-primary to-orange",
                },
                {
                  icon: <FaGraduationCap className="text-4xl" />,
                  title: "Academia",
                  subtitle: "アカデミア",
                  desc: "JAIST博士課程修了。実務と研究の両輪で知見を深化。",
                  items: ["博士（情報科学）", "IoTシステム研究", "Elixir/Erlang/OTP", "情報処理学会優秀論文賞"],
                  color: "from-secondary to-accent2",
                },
              ].map((pillar, i) => (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-primary/20">
                    <div className={`w-20 h-20 bg-gradient-to-br ${pillar.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                      {pillar.icon}
                    </div>
                    <h3 className="text-3xl font-black text-dark mb-1">{pillar.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{pillar.subtitle}</p>
                    <p className="text-gray-600 mb-6 leading-relaxed">{pillar.desc}</p>
                    <ul className="space-y-3">
                      {pillar.items.map((item) => (
                        <li key={item} className="text-sm text-gray-600 flex items-center gap-3">
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CAREER TIMELINE ===== */}
      <section className="py-24 bg-gray-50">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Career</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                キャリアの軌跡
              </h2>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent1 hidden md:block" />

              <div className="space-y-6">
                {[
                  { year: "1976", event: "奄美大島で誕生" },
                  { year: "1995", event: "東京都立大学 法学部入学" },
                  { year: "2000s", event: "奄美市役所勤務（約8年）" },
                  { year: "2008", event: "はてな入社" },
                  { year: "2012", event: "GMOペパボ入社" },
                  { year: "2017", event: "取締役CTO就任" },
                  { year: "2025", event: "博士（情報科学）取得" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-center gap-6 group"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all z-10 border-2 border-transparent group-hover:border-primary">
                      <span className="text-lg font-black text-primary">{item.year}</span>
                    </div>
                    <div className="flex-1 bg-white rounded-2xl px-6 py-4 shadow-sm group-hover:shadow-lg transition-all">
                      <span className="text-gray-700 font-bold text-lg">{item.event}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FUTURE FOCUS ===== */}
      <section className="py-24 bg-dark relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="container max-w-6xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Future Focus</p>
              <h2
                className="text-4xl sm:text-5xl md:text-6xl font-black"
                style={{ color: 'white' }}
              >
                今後の関心領域
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: <FaRocket className="text-4xl" />,
                  title: "Space",
                  items: ["宇宙データセンター", "衛星間通信網", "軌道上計算基盤", "月面工場構想"],
                },
                {
                  icon: <FaBolt className="text-4xl" />,
                  title: "Energy",
                  items: ["AI電力需要対応", "宇宙太陽光発電", "核融合技術", "次世代冷却技術"],
                },
                {
                  icon: <FaRobot className="text-4xl" />,
                  title: "Physical AI",
                  items: ["ヒューマノイドOS", "ロボットプラットフォーム", "シミュレーション連携", "産業導入促進"],
                },
              ].map((area, i) => (
                <motion.div
                  key={area.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <div
                    className="rounded-3xl p-8 h-full transition-all duration-300 hover:-translate-y-2 border border-white/10 hover:border-primary/50"
                    style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                  >
                    <div className="text-primary text-5xl mb-6 group-hover:scale-110 transition-transform">
                      {area.icon}
                    </div>
                    <h3
                      className="text-3xl font-black mb-6"
                      style={{ color: 'white' }}
                    >
                      {area.title}
                    </h3>
                    <ul className="space-y-3">
                      {area.items.map((item) => (
                        <li
                          key={item}
                          className="text-sm flex items-center gap-3"
                          style={{ color: 'rgba(255,255,255,0.7)' }}
                        >
                          <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-center mt-16 text-xl italic"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              「地球規模の制約とAI需要の不整合を、技術・産業・制度設計で更新する」
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ===== PERSONALITY ===== */}
      <section className="py-24 bg-white">
        <div className="container max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Personality</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                人柄と思考様式
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-8"
              >
                <h3 className="text-2xl font-black text-dark mb-6">穏やかさ × 好奇心</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    理論派に見えて実は人情派
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    仕事は革新的、生活は保守的
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    新コンセプト創出が最も楽しい
                  </li>
                </ul>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-accent1/10 to-orange/10 rounded-3xl p-8"
              >
                <h3 className="text-2xl font-black text-dark mb-6">強みと姿勢</h3>
                <ul className="space-y-4 text-gray-600">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    概念を言語化し構造化する力
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    リフレーミングによる成長
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                    普遍的スキル × 目の前の機会
                  </li>
                </ul>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <p className="text-sm font-bold text-gray-400 tracking-[0.2em] mb-6 uppercase">Interests</p>
              <div className="flex flex-wrap justify-center gap-3">
                {["歴史", "哲学", "現代アート", "歌舞伎", "K-POP", "写真展", "美術館巡り", "語学", "社会科学", "批評"].map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full font-medium hover:bg-primary hover:text-white transition-all cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ===== CONNECT ===== */}
      <section className="py-32 bg-gradient-to-br from-primary/5 via-white to-secondary/5">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Connect</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark mb-12">
              つながる
            </h2>

            <div className="flex flex-wrap justify-center gap-4 mb-16">
              {[
                { icon: <FaXTwitter size={24} />, url: "https://x.com/kentaro", label: "X" },
                { icon: <FaGithub size={24} />, url: "https://github.com/kentaro", label: "GitHub" },
                { icon: <FaLinkedin size={24} />, url: "https://www.linkedin.com/in/kentaro-kuribayashi", label: "LinkedIn" },
                { icon: <FaDiscord size={24} />, url: "https://discord.gg/SXyKFCyMd5", label: "Discord" },
                { icon: <FaFacebook size={24} />, url: "https://facebook.com/kentarok", label: "Facebook" },
                { icon: <MdEmail size={24} />, url: "mailto:kentarok@gmail.com", label: "Email" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-gray-600 shadow-lg hover:bg-dark hover:text-white hover:scale-110 hover:-rotate-3 transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-3 bg-dark text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-primary hover:scale-105 transition-all shadow-xl"
            >
              詳しいプロフィールを見る
              <FaArrowRight />
            </Link>
          </motion.div>
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
