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
        description="栗林健太郎のウェブサイト。概念と構造を制作する。GMOペパボ株式会社取締役CTO / 博士（情報科学）"
      />

      {/* ===== HERO ===== */}
      <section className="h-screen flex items-center justify-center bg-light relative overflow-hidden -mt-20">
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

            <p className="text-base text-gray-400 max-w-xl mx-auto mb-12 leading-relaxed">
              GMOペパボ取締役CTO。博士（情報科学）。<br />
              技術と文化の両面から、概念を言語化し構造化する。
            </p>

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
              ひとは生きていることそのことが<span className="text-primary">制作</span>であるはず。
            </p>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              「傑作」を目指さないこと。ただ<span className="text-primary">運動</span>を続けていくこと。
            </p>
            <p
              className="text-2xl sm:text-3xl md:text-4xl font-bold leading-relaxed"
              style={{ color: 'white' }}
            >
              それも多方向へと無目的に<span className="text-primary">展開</span>していくこと。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== WHAT I DO ===== */}
      <section className="py-24 bg-white">
        <div className="container max-w-6xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">What I Do</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                制作と仕事
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {[
                {
                  title: "技術と経営",
                  desc: "GMOペパボ株式会社で取締役CTOとして、クリエイターを支えるプラットフォームの技術基盤を統括。ペパボ研究所長として研究開発も率いる。日本CTO協会理事。",
                  color: "from-primary to-secondary",
                },
                {
                  title: "研究",
                  desc: "北陸先端科学技術大学院大学で博士（情報科学）を取得。IoTシステムの統合的アーキテクチャ、Elixir/Erlang/OTPの応用を研究。IEEE WF-IoT等の国際会議で発表。",
                  color: "from-secondary to-accent2",
                },
                {
                  title: "文化と批評",
                  desc: "年間約200冊の読書。歴史、アート、思想、社会科学、サイエンス。批評もまた制作。2015年から毎日日記を書き続け、ポッドキャストを配信し、フランス語を学んでいる。",
                  color: "from-purple to-primary",
                },
                {
                  title: "生活と美学",
                  desc: "公園を散歩し、美術館や博物館に通い、写真を撮り、毎日現像する。歌舞伎、現代アート、江戸前鮨、シーシャ。軽さと親密さ——大きなものより小さなもの、体系より手触り。",
                  color: "from-accent1 to-orange",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="group"
                >
                  <div className="bg-gray-50 rounded-3xl p-8 h-full hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-transparent hover:border-primary/20">
                    <div className={`w-3 h-16 bg-gradient-to-b ${item.color} rounded-full mb-6`} />
                    <h3 className="text-3xl font-black text-dark mb-4">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed text-lg">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== CAREER HIGHLIGHTS ===== */}
      <section className="py-24 bg-gray-50">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Journey</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                これまでの道のり
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-secondary to-accent1 hidden md:block" />

              <div className="space-y-6">
                {[
                  { year: "1976", event: "奄美大島で生まれる" },
                  { year: "1995", event: "東京都立大学法学部に入学。政治学科で日本政治史・行政学を学ぶ" },
                  { year: "2002", event: "奄美市役所に入所。PHPでブログを自作し、プログラミングにハマる" },
                  { year: "2008", event: "はてなにWebアプリケーションエンジニアとして入社" },
                  { year: "2012", event: "GMOペパボに入社。技術基盤整備、開発プロセス改善に従事" },
                  { year: "2017", event: "取締役CTO就任" },
                  { year: "2020", event: "北陸先端科学技術大学院大学に入学" },
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

      {/* ===== INTERESTS ===== */}
      <section className="py-24 bg-white">
        <div className="container max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-16">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Interests</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                関心の地図
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { label: "ロラン・バルト", size: "text-xl px-7 py-4" },
                { label: "Elixir/Erlang", size: "text-lg px-6 py-3" },
                { label: "現代アート", size: "text-xl px-7 py-4" },
                { label: "IoT", size: "text-base px-5 py-3" },
                { label: "スカルラッティ", size: "text-lg px-6 py-3" },
                { label: "歌舞伎", size: "text-base px-5 py-3" },
                { label: "フランス語", size: "text-lg px-6 py-3" },
                { label: "写真", size: "text-base px-5 py-3" },
                { label: "哲学", size: "text-lg px-6 py-3" },
                { label: "VRChat", size: "text-base px-5 py-3" },
                { label: "批評", size: "text-xl px-7 py-4" },
                { label: "社会科学", size: "text-lg px-6 py-3" },
                { label: "落語", size: "text-base px-5 py-3" },
                { label: "アマチュア無線", size: "text-base px-5 py-3" },
                { label: "江戸前鮨", size: "text-base px-5 py-3" },
                { label: "歴史", size: "text-lg px-6 py-3" },
                { label: "語学", size: "text-base px-5 py-3" },
                { label: "うつわ", size: "text-base px-5 py-3" },
                { label: "シーシャ", size: "text-base px-5 py-3" },
              ].map((tag) => (
                <span
                  key={tag.label}
                  className={`${tag.size} bg-gray-50 text-gray-700 rounded-full font-medium hover:bg-primary hover:text-white transition-all cursor-default shadow-sm border border-gray-100`}
                >
                  {tag.label}
                </span>
              ))}
            </div>
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
