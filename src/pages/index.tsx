import { useState } from "react";
import type { GetStaticProps } from "next";
import Link from "next/link";
import fs from "node:fs";
import path from "node:path";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/common/SEO";
import { getAllMarkdownFiles, getMarkdownData } from "@/lib/markdown";
import { getAllPhotoGalleries, type PhotoGallery } from "@/lib/photo";
import { fetchPodcastFeed, type PodcastEpisode } from "@/lib/podcast";

type JournalSummary = {
	slug: string;
	title: string;
	date: string | null;
	excerpt: string;
};
type WorkSummary = {
	title: string;
	url: string;
	date: string;
	sourceName: string;
	source: string;
	image: string | null;
};
type PhotoSummary = {
	slug: string;
	title: string;
	date: string | null;
	cover: string | null;
	images: string[];
};
type PodcastSummary = {
	slug: string;
	title: string;
	pubDate: string;
	duration: string;
	description: string;
};
type Props = {
	journals: JournalSummary[];
	blogs: JournalSummary[];
	works: WorkSummary[];
	photos: PhotoSummary[];
	podcasts: PodcastSummary[];
	journalCount: number;
	blogCount: number;
};

function formatDateJP(date: string | null | undefined): string {
	if (!date) return "";
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) return "";
	return new Intl.DateTimeFormat("ja-JP", {
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		timeZone: "Asia/Tokyo",
	})
		.format(d)
		.replaceAll("/", ".");
}
function stripTags(s: string): string {
	return s
		.replace(/<[^>]+>/g, "")
		.replace(/&nbsp;/g, " ")
		.replace(/&amp;/g, "&")
		.replace(/\s+/g, " ")
		.trim();
}
function Arrow({ diagonal = false }: { diagonal?: boolean }) {
	return <span aria-hidden="true">{diagonal ? "↗" : "→"}</span>;
}
function SectionHeading({
	number,
	label,
	title,
	href,
	link,
}: {
	number: string;
	label: string;
	title: string;
	href: string;
	link: string;
}) {
	return (
		<div className="section-heading">
			<div className="section-caption">
				<span>{number}</span>
				<span>{label}</span>
			</div>
			<h2>{title}</h2>
			<Link href={href} className="quiet-link">
				{link}
				<Arrow />
			</Link>
		</div>
	);
}

export default function Home({
	journals,
	blogs,
	works,
	photos,
	podcasts,
	journalCount,
	blogCount,
}: Props) {
	const [writing, setWriting] = useState<"journal" | "blog">("journal");
	const entries = writing === "journal" ? journals : blogs;
	const frames = photos
		.flatMap((p) =>
			p.images.map((src, i) => ({
				src,
				slug: p.slug,
				title: p.title,
				number: i + 1,
			})),
		)
		.slice(0, 6);
	return (
		<Layout activeNav="home">
			<SEO
				title="栗林健太郎のホームページ"
				description="栗林健太郎（あんちぽ）のホームページ。日記、ブログ、制作物、写真、ポッドキャストを掲載しています。"
			/>
            <div className="editorial">
            <section className="magazine-front" aria-label="エッセイ連載のお知らせ">
                <header className="magazine-mast wrap">
                    <div className="magazine-dateline"><span>KENTARO KURIBAYASHI</span><span>WORDS / CODE / IMAGES / SOUND</span></div>
                </header>
                <div className="cover-caption wrap">
                    <div className="essay-feature">
                        <p className="essay-kicker">エッセイ集、連載中</p>
                        <h1><span>あの頃みんな</span><span>AIの話ばかりしてたね</span></h1>
                        <p className="essay-lede">AIが世界を変えるあいだ、私たちは何を食べ、誰を育て、何を忘れ、どう働いていたのか。</p>
                        <a href="https://note.com/kentarok/m/m6938ee37aa8e" className="quiet-link">noteで読む<Arrow diagonal /></a>
                    </div>
                    <a href="#writing" className="cover-down">日記を読む<span aria-hidden="true">↓</span></a>
                </div>
            </section>
            <section className="profile-summary wrap" aria-labelledby="profile-heading">
                <div className="profile-heading">
                    <span className="section-caption">PROFILE</span>
                    <h2 id="profile-heading">栗林健太郎<span>あんちぽ / Kentaro Kuribayashi</span></h2>
                    <Link href="/profile" className="quiet-link">経歴・研究実績・登壇など<Arrow diagonal /></Link>
                </div>
                <div className="profile-text">
                    <p>1976年生まれ、奄美大島育ち。東京都立大学で政治学を学び、卒業後は奄美市役所に勤務。PHPでブログを自作したのをきっかけに、プログラミングにのめり込む。2008年にはてな、2012年に現在のGMOペパボへ入社。</p>
                    <p>GMOペパボの取締役CTOとして、技術基盤やエンジニア組織のマネジメントに携わる。ペパボ研究所長、日本CTO協会理事、人間中心のAIコンソーシアム理事も務める。</p>
                    <dl className="profile-details">
                        <div><dt>研究</dt><dd>IoTシステムの開発を簡単にするための基盤技術。ElixirやErlang/OTPの応用を研究し、2025年に北陸先端科学技術大学院大学で博士（情報科学）を取得。</dd></div>
                        <div><dt>関心</dt><dd>読書、アート、うつわ、歌舞伎、落語、語学、ソーシャルVR、アマチュア無線。歴史・思想から情報科学まで、本を年間約200冊読む。</dd></div>
                    </dl>
                </div>
            </section>
			<section className="writing-section wrap" id="writing">
				<SectionHeading
					number="01"
					label="WRITING"
					title={writing === "journal" ? "日記" : "ブログ"}
					href={`/${writing}`}
					link="すべて読む"
				/>
				<div className="writing-toolbar">
					<div role="group" aria-label="表示する文章">
						<button
							type="button"
							aria-pressed={writing === "journal"}
							onClick={() => setWriting("journal")}
						>
							日記<span>{journalCount.toLocaleString("ja-JP")}</span>
						</button>
						<button
							type="button"
							aria-pressed={writing === "blog"}
							onClick={() => setWriting("blog")}
						>
							ブログ<span>{blogCount.toLocaleString("ja-JP")}</span>
						</button>
					</div>
					<span>新着順</span>
				</div>
				<div className="writing-grid" aria-live="polite">
					{entries.length ? (
						entries.map((entry, i) => (
							<article className="writing-item" key={entry.slug}>
								<Link href={`/${entry.slug}`}>
									<div className="writing-meta">
										<time dateTime={entry.date || undefined}>
											{formatDateJP(entry.date)}
										</time>
										<span>{String(i + 1).padStart(2, "0")}</span>
									</div>
									<h3>{entry.title}</h3>
									<p>{entry.excerpt}</p>
									<span className="writing-read">
										続きを読む
										<Arrow diagonal />
									</span>
								</Link>
							</article>
						))
					) : (
						<p className="empty-state">まだ記事がありません。</p>
					)}
				</div>
			</section>
			<section className="making-section">
				<div className="wrap">
					<SectionHeading
						number="02"
						label="MAKING"
						title="制作物"
						href="/works"
						link="制作物の一覧"
					/>
					<p className="section-intro">
						noteの記事、技術ブログ、スライド、音楽、動画。
					</p>
					<div className="making-list">
						{works.map((w, i) => (
							<a
								href={w.url}
								key={`${w.url}-${i}`}
								target="_blank"
								rel="noopener noreferrer"
							>
                                <div className="work-art">
                                    {w.image ? <img src={w.image} alt="" loading="lazy" /> : <span className="work-type">{w.sourceName}<span>{String(i + 1).padStart(2, "0")}</span></span>}
                                    <span className="work-number">{String(i + 1).padStart(2, "0")}</span>
                                </div>
								<div>
									<span className="work-source">{w.sourceName}</span>
									<h3>{w.title}</h3>
								</div>
								<time dateTime={w.date}>{formatDateJP(w.date)}</time>
								<span className="work-arrow" aria-label="外部サイトを開く">
									↗
								</span>
							</a>
						))}
					</div>
					{!works.length && (
						<p className="empty-state">制作物はまだありません。</p>
					)}
				</div>
			</section>
			<section className="visual-section wrap">
				<SectionHeading
					number="03"
					label="IMAGES"
					title="写真・イメージ"
					href="/photo"
					link="写真・イメージを見る"
				/>
				<div className="visual-grid">
					{frames.slice(1, 5).map((frame, i) => (
						<Link
							href={`/photo/${frame.slug}`}
							key={frame.src}
							className={`visual-frame visual-frame-${i}`}
						>
							<img
								src={frame.src}
								alt={`${frame.title} ${frame.number}`}
								loading="lazy"
							/>
							<div>
								<span>{frame.title}</span>
								<span>{String(frame.number).padStart(2, "0")} ↗</span>
							</div>
						</Link>
					))}
				</div>
				{!frames.length && (
					<p className="empty-state">写真・イメージはまだありません。</p>
				)}
			</section>
			<section className="sound-section wrap">
				<div className="sound-intro">
					<div className="section-caption">
						<span>04</span>
						<span>LISTENING</span>
					</div>
					<h2>ポッドキャスト</h2>
					<Link href="/podcast" className="quiet-link">
						ポッドキャストを聴く
						<Arrow />
					</Link>
				</div>
				<div className="sound-episodes">
					{podcasts.map((ep) => (
						<Link href={`/podcast/${ep.slug}`} key={ep.slug}>
							<span className="sound-play" aria-hidden="true">
								▶
							</span>
							<div>
								<time dateTime={ep.pubDate}>{formatDateJP(ep.pubDate)}</time>
								<h3>{ep.title}</h3>
								<p>{ep.description}</p>
							</div>
							<Arrow diagonal />
						</Link>
					))}
					{!podcasts.length && (
						<p className="empty-state">エピソードはまだありません。</p>
					)}
				</div>
			</section>

            </div>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
	// Latest writing and the size of the public archive.
	const allFiles = getAllMarkdownFiles();
	const journalCount = allFiles.filter(({ slug }) =>
		slug.startsWith("journal/"),
	).length;
	const blogCount = allFiles.filter(({ slug }) =>
		slug.startsWith("blog/"),
	).length;
	const latestBlogFiles = allFiles.filter(({ slug }) =>
		slug.startsWith("blog/"),
	);
	const blogEntries = await Promise.all(
		latestBlogFiles.map(async ({ slug }) => {
			const d = await getMarkdownData(slug);
			return {
				slug,
				title: String(d?.title || slug.split("/").pop()),
				date:
					d?.date instanceof Date
						? d.date.toISOString()
						: typeof d?.date === "string"
							? d.date
							: null,
				excerpt: stripTags(String(d?.contentHtml || d?.excerpt || "")).slice(
					0,
					180,
				),
			};
		}),
	);
	const blogs = blogEntries
		.sort(
			(a, b) =>
				new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
		)
		.slice(0, 3);
	// Journals — latest 3
	let journals: JournalSummary[] = [];
	try {
		const allFiles = getAllMarkdownFiles();
		const journalFiles = allFiles.filter(({ slug }) =>
			slug.startsWith("journal/"),
		);
		const data = await Promise.all(
			journalFiles.map(async ({ slug }) => {
				const d = await getMarkdownData(slug);
				let date: string | null = null;
				if (d?.date instanceof Date) date = d.date.toISOString();
				else if (typeof d?.date === "string") date = d.date;
				return {
					slug,
					title: (d?.title as string) || slug.split("/").pop() || "",
					date,
					excerpt: stripTags(String(d?.contentHtml || d?.excerpt || "")).slice(
						0,
						180,
					),
				};
			}),
		);
		journals = data
			.filter((j) => j.date)
			.sort(
				(a, b) =>
					new Date(b.date as string).getTime() -
					new Date(a.date as string).getTime(),
			)
			.slice(0, 3);
	} catch (e) {
		console.error("Top: journal load failed", e);
	}

	// Works — top 6
	let works: WorkSummary[] = [];
	try {
		const feedPath = path.join(
			process.cwd(),
			"public",
			"works",
			"feed-data.json",
		);
		if (fs.existsSync(feedPath)) {
			const raw = fs.readFileSync(feedPath, "utf8");
			const feed = JSON.parse(raw) as {
				items: Array<{
					title: string;
					url: string;
					date: string;
					sourceName: string;
					source: string;
					image?: string | null;
				}>;
			};
			works = feed.items.slice(0, 6).map((i) => ({
				title: i.title,
				url: i.url,
				date: i.date,
				sourceName: i.sourceName,
				source: i.source,
				image: i.image || null,
			}));
		}
	} catch (e) {
		console.error("Top: works load failed", e);
	}

	// Photos — top 5
	let photos: PhotoSummary[] = [];
	try {
		const galleries = getAllPhotoGalleries() as PhotoGallery[];
		photos = galleries.slice(0, 5).map((g) => ({
			slug: g.slug,
			title: g.title,
			date: g.date ?? null,
			cover: g.images?.[0] ?? null,
			images: g.images.slice(0, 6),
		}));
	} catch (e) {
		console.error("Top: photo load failed", e);
	}

	// Podcast — top 3
	let podcasts: PodcastSummary[] = [];
	try {
		const rssUrl = "https://anchor.fm/s/6877a570/podcast/rss";
		const data = await fetchPodcastFeed(rssUrl);
		podcasts = (data.episodes as PodcastEpisode[]).slice(0, 3).map((ep) => ({
			slug: ep.slug,
			title: ep.title,
			pubDate: ep.pubDate,
			duration: ep.duration || "",
			description: stripTags(ep.description || "").slice(0, 120),
		}));
	} catch (e) {
		console.error("Top: podcast load failed", e);
	}

	return {
		props: {
			journals,
			blogs,
			journalCount,
			blogCount,
			works,
			photos,
			podcasts,
		},
	};
};
