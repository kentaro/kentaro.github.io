import type { GetStaticProps } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import Layout from "@/components/layout/Layout";
import SEO from "@/components/common/SEO";
import PageHeader from "@/components/common/PageHeader";
import { getAllPhotoGalleries, type PhotoGallery } from "@/lib/photo";

type PhotoIndexPageProps = {
	galleries: PhotoGallery[];
};

export default function PhotoIndexPage({ galleries }: PhotoIndexPageProps) {
	return (
		<Layout>
			<SEO
				title="写真"
				description="栗林健太郎の写真作品"
			/>

			<PageHeader
				title="写真"
				description="写真作品を公開しています。"
			/>

			<section className="py-8 sm:py-12 md:py-16 bg-white">
				<div className="container max-w-5xl">
					{galleries.length === 0 ? (
						<p className="text-center text-gray-500">
							ギャラリーがありません
						</p>
					) : (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
							{galleries.map((gallery, index) => (
								<motion.div
									key={gallery.slug}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.3, delay: index * 0.1 }}
								>
									<Link
										href={`/photo/${gallery.slug}`}
										className="block group"
									>
										<div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
											<div className="relative aspect-[4/3] overflow-hidden">
												{gallery.images[0] && (
													<img
														src={gallery.images[0]}
														alt={gallery.title}
														className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
													/>
												)}
											</div>
											<div className="p-4">
												<h2 className="text-lg font-bold text-dark group-hover:text-primary transition-colors mb-1">
													{gallery.title}
												</h2>
												{gallery.date && (
													<p className="text-sm text-gray-500">
														{gallery.date}
													</p>
												)}
											</div>
										</div>
									</Link>
								</motion.div>
							))}
						</div>
					)}
				</div>
			</section>
		</Layout>
	);
}

export const getStaticProps: GetStaticProps = async () => {
	const galleries = getAllPhotoGalleries();

	return {
		props: {
			galleries,
		},
	};
};
