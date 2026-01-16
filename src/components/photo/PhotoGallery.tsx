import { useEffect, useState } from "react";
import { useLightboxStore } from "@/store/useLightboxStore";

type PhotoGalleryProps = {
	images: string[];
};

function ImageWithPlaceholder({ src, alt, onClick }: { src: string; alt: string; onClick: () => void }) {
	return (
		<button
			type="button"
			className="relative aspect-square overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200 bg-gray-200"
			onClick={onClick}
		>
			<img
				src={src}
				alt={alt}
				className="w-full h-full object-cover"
				loading="lazy"
				decoding="async"
			/>
		</button>
	);
}

export default function PhotoGallery({ images }: PhotoGalleryProps) {
	const { open, isOpen } = useLightboxStore();
	const [isOpening, setIsOpening] = useState(false);

	// 最初の8枚をプリロード
	useEffect(() => {
		const preloadCount = Math.min(8, images.length);
		for (let i = 0; i < preloadCount; i++) {
			const img = new Image();
			img.src = images[i];
		}
	}, [images]);

	const handleImageClick = (index: number) => {
		setIsOpening(true);
		setTimeout(() => {
			open(images, index);
			setIsOpening(false);
		}, 50);
	};

	return (
		<>
			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
				{images.map((image, index) => (
					<ImageWithPlaceholder
						key={image}
						src={image}
						alt={`Photo ${index + 1}`}
						onClick={() => handleImageClick(index)}
					/>
				))}
			</div>

			{/* クリック直後のローディングオーバーレイ */}
			{isOpening && !isOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95">
					<div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
				</div>
			)}
		</>
	);
}
