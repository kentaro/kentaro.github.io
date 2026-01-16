import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/common/SEO";
import { getAllPhotoSlugs, getPhotoGallery, type PhotoGallery as PhotoGalleryType } from "@/lib/photo";
import PhotoGallery from "@/components/photo/PhotoGallery";
import PhotoLightbox from "@/components/photo/PhotoLightbox";

type PhotoPageProps = {
	gallery: PhotoGalleryType;
};

export default function PhotoPage({ gallery }: PhotoPageProps) {
	return (
		<Layout>
			<SEO
				title={gallery.title}
				description={gallery.description || `写真: ${gallery.title}`}
			/>

			<article className="py-8 sm:py-12 md:py-16">
				<div className="container max-w-5xl">
					{/* 戻るリンク */}
					<Link
						href="/photo"
						className="inline-flex items-center gap-2 text-primary hover:underline mb-6"
					>
						<FaArrowLeft className="w-4 h-4" />
						写真一覧に戻る
					</Link>

					{/* ギャラリー情報 */}
					<div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md mb-8">
						<h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-dark">
							{gallery.title}
						</h1>

						{/* 説明文 */}
						{gallery.description && (
							<div className="prose prose-lg max-w-none text-gray-700">
								{gallery.description.split("\n").map((line, i) => (
									<p key={i}>{line}</p>
								))}
							</div>
						)}
					</div>

					{/* ギャラリーグリッド */}
					<PhotoGallery images={gallery.images} />
				</div>
			</article>

			{/* ライトボックス */}
			<PhotoLightbox />
		</Layout>
	);
}

export const getStaticPaths: GetStaticPaths = async () => {
	const slugs = getAllPhotoSlugs();
	const paths = slugs.map((slug) => ({
		params: { slug },
	}));

	return {
		paths,
		fallback: false,
	};
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
	const slug = params?.slug as string;
	const gallery = getPhotoGallery(slug);

	if (!gallery) {
		return {
			notFound: true,
		};
	}

	return {
		props: {
			gallery,
		},
	};
};
