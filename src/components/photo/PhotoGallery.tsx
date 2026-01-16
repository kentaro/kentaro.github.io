import { useLightboxStore } from "@/store/useLightboxStore";

type PhotoGalleryProps = {
	images: string[];
};

export default function PhotoGallery({ images }: PhotoGalleryProps) {
	const open = useLightboxStore((state) => state.open);

	const handleImageClick = (index: number) => {
		open(images, index);
	};

	return (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-4">
			{images.map((image, index) => (
				<button
					key={image}
					type="button"
					className="relative aspect-square overflow-hidden rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 hover:opacity-90 active:scale-[0.98] transition-all duration-200"
					onClick={() => handleImageClick(index)}
				>
					<img
						src={image}
						alt={`Photo ${index + 1}`}
						className="w-full h-full object-cover"
						loading="lazy"
					/>
				</button>
			))}
		</div>
	);
}
