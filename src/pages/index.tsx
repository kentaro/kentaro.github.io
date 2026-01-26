import type { GetStaticProps } from "next";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaGithub,
  FaLinkedin,
  FaFacebook,
  FaDiscord,
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
        description="栗林健太郎のウェブサイト。概念と構造を制作する。"
      />

      {/* ===== HERO ===== */}
      <section className="min-h-screen flex items-center justify-center bg-light relative overflow-hidden -mt-20">
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-accent1/10 to-primary/10 rounded-full blur-3xl" />

        <div className="container max-w-4xl px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
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

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-dark leading-none mb-6">
              栗林健太郎
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 mb-6">
              概念と構造を制作する
            </p>
            <p className="text-base text-gray-400 max-w-lg mx-auto leading-relaxed">
              「傑作」を目指さないこと。ただ運動を続けていくこと、<br className="hidden md:block" />
              それも多方向へと無目的に展開していくこと。
            </p>
          </motion.div>
        </div>
      </section>

      {/* ===== ATTRACTIONS ===== */}
      <section className="py-24 bg-white">
        <div className="container max-w-5xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-20">
              <p className="text-primary font-bold tracking-[0.2em] text-sm mb-4 uppercase">Attractions</p>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-dark">
                惹かれるもの
              </h2>
            </div>

            <div className="space-y-16">
              {[
                {
                  title: "軽さと親密さ",
                  body: "ロラン・バルトの晩年のテクスト。スカルラッティのソナタ——何の意味もなくコロコロと転がっているような音楽。ロココの室内文化。重厚さや感傷を避け、軽さと運動性のあるものに惹かれる。大きなものより小さなもの、体系より手触り。",
                  color: "bg-purple/10",
                  accent: "bg-purple",
                },
                {
                  title: "制作すること",
                  body: "ひとは生きていることそのことが制作であるはず。批評もまた制作。技術も制作。あらゆることに制作者として向き合う。「〜のひと」と固定されることへの抵抗。ソフトウェアを書き、文章を書き、写真を撮り、毎日現像する。",
                  color: "bg-primary/10",
                  accent: "bg-primary",
                },
                {
                  title: "読むこと",
                  body: "年間約200冊。歴史、哲学、アート、社会科学、サイエンス。ジャンルを横断しながら、概念を拾い集めて結びつける。2015年から毎日日記を書き続けている。読むことと書くことは同じ運動の表と裏。",
                  color: "bg-secondary/10",
                  accent: "bg-secondary",
                },
                {
                  title: "概念を言語化すること",
                  body: "現実の裂け目から概念が生じる。それを言葉にし、構造にする。ソフトウェアアーキテクチャも、組織設計も、批評も、本質的には同じ営み——混沌に形を与えること。GMOペパボで取締役CTOとして、北陸先端科学技術大学院大学で博士として、その実践を続けてきた。",
                  color: "bg-accent1/10",
                  accent: "bg-accent1",
                },
                {
                  title: "手触りのあるもの",
                  body: "美術館と博物館。現代作家のうつわ。江戸前鮨。歌舞伎。落語。公園の散歩。写真。フランス語——バルトの原文に直接触れたいから。シーシャ。アマチュア無線。ソーシャルVR。小さな趣味を数え上げればきりがない。",
                  color: "bg-orange/10",
                  accent: "bg-orange",
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <div className={`${item.color} rounded-3xl p-8 md:p-12`}>
                    <div className="flex items-start gap-6">
                      <div className={`w-1.5 h-full min-h-[60px] ${item.accent} rounded-full flex-shrink-0 mt-1`} />
                      <div>
                        <h3 className="text-2xl md:text-3xl font-black text-dark mb-4">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed text-lg md:text-xl">{item.body}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== KEYWORDS ===== */}
      <section className="py-24 bg-gray-50">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="flex flex-wrap justify-center gap-3">
              {[
                "バルト", "スカルラッティ", "ロココ", "Elixir", "IoT",
                "歌舞伎", "落語", "現代アート", "写真",
                "フランス語", "批評", "哲学", "歴史",
                "社会科学", "インゴルド", "ナボコフ", "カヴァフィス",
                "うつわ", "江戸前鮨", "シーシャ", "VRChat",
                "アマチュア無線", "散歩",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-white text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium shadow-sm border border-gray-100 hover:bg-primary hover:text-white hover:border-primary transition-all cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== PROFILE LINK ===== */}
      <section className="py-24 bg-dark">
        <div className="container max-w-4xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              仕事と研究の経歴、登壇・執筆実績などの<br className="hidden md:block" />
              パブリックなプロフィールはこちら。
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-3 bg-white/10 text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary hover:scale-105 transition-all border border-white/20"
            >
              プロフィールを見る
              <FaArrowRight />
            </Link>
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

            <div className="flex flex-wrap justify-center gap-4">
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
