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
function Heading({
	label,
	title,
	href,
	link,
}: { label: string; title: string; href: string; link: string }) {
	return (
		<div className="ed-heading">
			<div>
				<span className="ed-label">{label}</span>
				<h2>{title}</h2>
			</div>
			<Link href={href} className="ed-link">
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
	const writingPanels = [
		{ kind: "journal", items: journals },
		{ kind: "blog", items: blogs },
	] as const;
	const essays = works
		.filter((w) => w.source === "note" || w.sourceName === "note")
		.slice(0, 4);
	const creations = works
		.filter((w) => w.sourceName !== "note")
		.filter(
			(w, i, all) =>
				all.findIndex(
					(other) => other.title.normalize("NFC") === w.title.normalize("NFC"),
				) === i,
		)
		.slice(0, 3);
	const frames = photos
		.flatMap((p) =>
			p.images.map((src, i) => ({
				src,
				slug: p.slug,
				title: p.title,
				number: i + 1,
			})),
		)
		.slice(1, 5);
	return (
		<Layout activeNav="home">
			<SEO
				title="栗林健太郎のホームページ"
				description="栗林健太郎のエッセイ、日記、制作物、写真、ポッドキャスト。エッセイ集『あの頃みんなAIの話ばかりしてたね』を連載中。"
			/>
			<div className="editorial">
				<section className="ed-cover" aria-labelledby="essay-title">
					<img
						className="ed-cover-image"
						src="/images/editorial/bookshop-interior.webp"
						alt=""
						width="1536"
						height="1024"
						fetchPriority="high"
					/>
					<div className="ed-cover-top">
						<span>LITERATURE / CULTURE / TECHNOLOGY</span>
					</div>
					<div className="ed-cover-copy">
						<p className="ed-label">栗林健太郎 エッセイ集</p>
						<h1 id="essay-title">
							<span>あの頃みんな</span>
							<span>AIの話ばかり</span>
							<span>してたね</span>
						</h1>
						<p className="ed-cover-lede">
							AIが世界を変えるあいだ、私たちは何を食べ、
							<br className="ed-desktop-break" />
							誰を育て、何を忘れ、どう働いていたのか。
						</p>
						<a
							className="ed-button"
							href="https://note.com/kentarok/m/m6938ee37aa8e"
						>
							エッセイを読む <Arrow diagonal />
						</a>
					</div>
					<div className="ed-cover-bottom">
						<span>文・栗林健太郎</span>
						<a href="#essays">SCROLL TO READ ↓</a>
					</div>
				</section>
				<nav className="ed-index" aria-label="トップページの目次">
					<a href="#essays">
						<span>01</span>エッセイ
						<Arrow />
					</a>
					<a href="#writing">
						<span>02</span>日記・ブログ
						<Arrow />
					</a>
					<a href="#creations">
						<span>03</span>制作物
						<Arrow />
					</a>
					<a href="#images">
						<span>04</span>写真・イメージ
						<Arrow />
					</a>
				</nav>
				<section className="ed-section ed-wrap" id="essays">
					<Heading
						label="01 / ESSAYS"
						title="最近のエッセイ"
						href="https://note.com/kentarok/m/m6938ee37aa8e"
						link="連載を読む"
					/>
					<div className="ed-essay-grid">
						{essays.map((w, i) => (
							<article key={w.url}>
								<a href={w.url} className="ed-essay-card">
									<div className="ed-card-image">
										{w.image && (
											<img
												src={w.image}
												alt=""
												loading="lazy"
												width="800"
												height="450"
											/>
										)}
										<span className="ed-number">
											{String(i + 1).padStart(2, "0")}
										</span>
									</div>
									<div className="ed-card-meta">
										<span>ESSAY</span>
										<time dateTime={w.date}>{formatDateJP(w.date)}</time>
									</div>
									<h3>
										{w.title}
										<Arrow diagonal />
									</h3>
								</a>
							</article>
						))}
					</div>
				</section>
				<section
					className="ed-criticism ed-wrap"
					aria-labelledby="criticism-title"
				>
					<div>
						<span className="ed-label">READING NOTES</span>
						<h2 id="criticism-title">最近の読書</h2>
						<p>
							読んだ本と、そこから考えたこと。
							<br />
							日記から紹介します。
						</p>
						<Link href="/journal" className="ed-link">
							日記を読む
							<Arrow />
						</Link>
					</div>
					<div className="ed-archive-list">
						<Link href="/journal/2026/08/2026年8月9日">
							<span>
								<time dateTime="2026-08-09">2026.08.09</time> の日記より
							</span>
							<h3>
								『機械ぎらい』とセルフレジ
								<Arrow diagonal />
							</h3>
							<p>
								速水健朗『機械ぎらい』を読み、セルフレジの処理フローとメンタルモデルについて考える。
							</p>
						</Link>
						<Link href="/journal/2026/07/2026年7月14日">
							<span>
								<time dateTime="2026-07-14">2026.07.14</time> の日記より
							</span>
							<h3>
								『こちらあみ子』を読み直す
								<Arrow diagonal />
							</h3>
							<p>
								今村夏子の小説を再読し、以前は救いのない話と読んだ物語に、希望の読み筋を見つける。
							</p>
						</Link>
						<Link href="/journal/2026/06/2026年6月23日">
							<span>
								<time dateTime="2026-06-23">2026.06.23</time> の日記より
							</span>
							<h3>
								『古文と漢文』から丸山眞男へ
								<Arrow diagonal />
							</h3>
							<p>
								書き言葉の歴史を手がかりに、丸山眞男の「つぎつぎになりゆくいきほひ」を捉え直す。
							</p>
						</Link>
					</div>
				</section>
				<section className="ed-diary" id="writing">
					<div className="ed-diary-art">
						<img
							src="/images/editorial/reading-desk.webp"
							alt=""
							width="1536"
							height="1024"
							loading="lazy"
						/>
						<div>
							<span>02 / JOURNAL & BLOG</span>
							<p>日記とブログ</p>
						</div>
					</div>
					<div className="ed-diary-copy">
						<div className="ed-diary-head">
							<h2>日記とブログ</h2>
							<Link href={`/${writing}`} className="ed-link">
								すべて読む
								<Arrow />
							</Link>
						</div>
						<div className="ed-tabs" role="group" aria-label="表示する文章">
							<button
								type="button"
								aria-pressed={writing === "journal"}
								onClick={() => setWriting("journal")}
							>
								日記 <span>{journalCount.toLocaleString("ja-JP")}</span>
							</button>
							<button
								type="button"
								aria-pressed={writing === "blog"}
								onClick={() => setWriting("blog")}
							>
								ブログ <span>{blogCount.toLocaleString("ja-JP")}</span>
							</button>
						</div>
						<div className="ed-entries" aria-live="polite">
							{writingPanels.map(({ kind, items }) => (
								<div
									key={kind}
									className="ed-entry-panel"
									data-active={writing === kind}
									aria-hidden={writing !== kind}
									inert={writing !== kind}
								>
									{items.map((entry) => (
										<article key={entry.slug}>
											<Link href={`/${entry.slug}`}>
												<time dateTime={entry.date || undefined}>
													{formatDateJP(entry.date)}
												</time>
												<h3>
													{entry.title}
													<Arrow diagonal />
												</h3>
												<p>{entry.excerpt}</p>
											</Link>
										</article>
									))}
									{!items.length && <p>まだ記事がありません。</p>}
								</div>
							))}
						</div>
					</div>
				</section>
				<section className="ed-section ed-wrap" id="creations">
					<Heading
						label="03 / WORKS"
						title="つくったもの"
						href="/works"
						link="制作物の一覧"
					/>
					<div className="ed-work-grid">
						{creations.map((w) => (
							<article key={w.url}>
								<a href={w.url}>
									<div className="ed-card-image">
										{w.image ? (
											<img
												src={w.image}
												alt=""
												loading="lazy"
												width="800"
												height="600"
											/>
										) : (
											<span className="ed-work-placeholder">
												{w.sourceName}
											</span>
										)}
									</div>
									<div className="ed-card-meta">
										<span>{w.sourceName}</span>
										<time dateTime={w.date}>{formatDateJP(w.date)}</time>
									</div>
									<h3>
										{w.title}
										<Arrow diagonal />
									</h3>
								</a>
							</article>
						))}
					</div>
				</section>
				<section className="ed-visual" id="images">
					<div className="ed-wrap">
						<Heading
							label="04 / PHOTOGRAPHY & IMAGES"
							title="写真・イメージ"
							href="/photo"
							link="すべて見る"
						/>
					</div>
					<div className="ed-visual-grid">
						{frames.map((frame, i) => (
							<Link
								href={`/photo/${frame.slug}`}
								key={frame.src}
								className={`ed-frame ed-frame-${i}`}
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
				</section>
				<section className="ed-listening" id="listening">
					<div className="ed-listening-art">
						<img
							src="/images/editorial/records.webp"
							alt=""
							width="1536"
							height="1024"
							loading="lazy"
						/>
						<div>
							<span>05 / PODCAST</span>
							<h2>ポッドキャスト</h2>
							<Link href="/podcast" className="ed-button">
								ポッドキャストを聴く
								<Arrow />
							</Link>
						</div>
					</div>
					<div className="ed-podcasts">
						<span className="ed-label">LATEST EPISODES</span>
						{podcasts.map((ep) => (
							<Link href={`/podcast/${ep.slug}`} key={ep.slug}>
								<span className="ed-play" aria-hidden="true">
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
					</div>
				</section>
				<section
					className="ed-profile ed-wrap"
					aria-labelledby="profile-heading"
				>
					<div>
						<span className="ed-label">ABOUT THE AUTHOR</span>
						<h2 id="profile-heading">栗林健太郎</h2>
						<p className="ed-profile-roman">Kentaro Kuribayashi / あんちぽ</p>
						<Link href="/profile" className="ed-link">
							プロフィール・研究・登壇
							<Arrow />
						</Link>
					</div>
					<div className="ed-profile-body">
						<p>
							1976年生まれ、奄美大島育ち。東京都立大学で政治学を学び、卒業後は奄美市役所に勤務。PHPでブログを自作したのをきっかけに、プログラミングにのめり込む。2008年にはてな、2012年にGMOペパボへ入社。
						</p>
						<p>
							GMOペパボ取締役CTO・ペパボ研究所長。日本CTO協会理事、人間中心のAIコンソーシアム理事。2025年、北陸先端科学技術大学院大学で博士（情報科学）を取得。IoTシステムとElixir、Erlang/OTPを研究。
						</p>
						<p>
							本、アート、うつわ、歌舞伎、落語、語学、ソーシャルVR、アマチュア無線。歴史・思想から情報科学まで、本を年間約200冊読む。
						</p>
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

	// Works — enough entries for essays and a varied selection of other media.
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
			works = feed.items.slice(0, 16).map((i) => ({
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
