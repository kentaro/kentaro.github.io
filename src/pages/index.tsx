import type { GetStaticProps } from "next";
import Link from "next/link";
import { isCreatorWork, NOTE_URL } from "@/lib/creator-content";
import { SITE_NAME } from "@/lib/site";
import fs from "node:fs";
import path from "node:path";
import MediaGrid from "@/components/media/MediaGrid";
import { getMediaItems, type MediaItem } from "@/lib/media";
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
	description: string;
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
	music: MediaItem[];
	journals: JournalSummary[];
	works: WorkSummary[];
	photos: PhotoSummary[];
	podcasts: PodcastSummary[];
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
	music,
	journals,
	works,
	photos,
	podcasts,
}: Props) {
	const essays = works
		.filter((w) => w.source === "note" || w.sourceName === "note")
		.slice(0, 4);
	const creations = works
		.filter((w) => w.source !== "note" && w.sourceName !== "note")
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
				title={SITE_NAME}
				description="栗林健太郎のエッセイ、日記、制作物、写真、音楽、ポッドキャスト。エッセイ集『あの頃みんなAIの話ばかりしてたね』を連載中。"
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
						<span>WRITING / MUSIC / PHOTOGRAPHY</span>
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
						<span>02</span>日記
						<Arrow />
					</a>
					<a href="#creations">
						<span>03</span>制作物
						<Arrow />
					</a>
					<a href="#music"><span>04</span>音楽<Arrow /></a>
					<a href="#images">
						<span>05</span>写真
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
						{essays.map((w) => (
							<article key={w.url}>
								<a href={w.url} className="ed-essay-card">
									<div className="ed-card-meta">
										<time dateTime={w.date}>{formatDateJP(w.date)}</time>
									</div>
									<h3>
										{w.title}
										<Arrow diagonal />
									</h3>
									<p className="ed-essay-excerpt">{w.description}</p>
								</a>
							</article>
						))}
					</div>
				</section>
				<section className="ed-diary" id="writing">
					<div className="ed-diary-art">
						<img
							src="/images/editorial/reading-desk-v2.webp"
							alt=""
							width="1536"
							height="1024"
							loading="lazy"
						/>
						<div>
							<span>02 / JOURNAL</span>
							<p>日記</p>
						</div>
					</div>
					<div className="ed-diary-copy">
						<div className="ed-diary-head">
							<h2>日記</h2>
							<Link href="/journal" className="ed-link">
								すべて読む
								<Arrow />
							</Link>
						</div>
						<div className="ed-entries">
							{journals.map((entry) => (
								<article key={entry.slug}>
									<Link href={`/${entry.slug}`}>
										<time dateTime={entry.date || undefined}>
											{formatDateJP(entry.date)}
										</time>
										<h3>{entry.title}<Arrow diagonal /></h3>
										<p>{entry.excerpt}</p>
									</Link>
								</article>
							))}
							{!journals.length && <p>まだ日記がありません。</p>}
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
				<section className="ed-section ed-wrap music-preview" id="music">
                    <Heading label="04 / MUSIC" title="音楽" href="/music" link="すべて聴く" />
                    <p className="music-preview-intro">つくった曲、演奏、音楽の映像。YouTubeとSoundCloudから。</p>
                    <MediaGrid items={music} />
                </section>
				<section className="ed-visual" id="images">
					<div className="ed-wrap">
						<Heading
							label="05 / PHOTOGRAPHY"
							title="写真"
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
							<span>06 / PODCAST</span>
							<p>ポッドキャスト</p>
						</div>
					</div>
					<div className="ed-podcasts">
						<div className="ed-diary-head">
							<h2>ポッドキャスト</h2>
							<Link href="/podcast" className="ed-link">
								すべて聴く
								<Arrow />
							</Link>
						</div>
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
					aria-labelledby="creator-heading"
				>
					<div>
						<span className="ed-label">ABOUT THE AUTHOR</span>
						<h2 id="creator-heading">栗林健太郎</h2>
						<p className="ed-profile-roman">{SITE_NAME}</p>
						<a href={NOTE_URL} className="ed-link">
							noteで読む
							<Arrow diagonal />
						</a>
					</div>
					<div className="ed-profile-body">
						<p>
							文章を書き、音楽をつくり、写真を撮っています。エッセイや日記、曲、映像、ポッドキャストをこのサイトにまとめています。
						</p>
						<p>
							本、アート、うつわ、歌舞伎、落語、語学などに関心があります。
						</p>
					</div>
				</section>
			</div>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps<Props> = async () => {
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
					description?: string;
					title: string;
					url: string;
					date: string;
					sourceName: string;
					source: string;
					image?: string | null;
				}>;
			};
			works = feed.items.filter(isCreatorWork).slice(0, 16).map((i) => ({
				title: i.title,
				description: stripTags(i.description || "").replace(/続きをみる$/, "").slice(0, 150),
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

	const archive = getMediaItems();
	const music = [
		...archive.filter((item) => item.source === "video").slice(0, 2),
		...archive.filter((item) => item.source === "music").slice(0, 2),
	];
	return {
		props: {
			music,
			journals,
			works,
			photos,
			podcasts,
		},
	};
};
