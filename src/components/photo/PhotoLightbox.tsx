import { useEffect, useCallback, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useLightboxStore } from "@/store/useLightboxStore";

export default function PhotoLightbox() {
	const { isOpen, currentIndex, images, close, next, prev } = useLightboxStore();
	const [touchStart, setTouchStart] = useState<number | null>(null);
	const [touchEnd, setTouchEnd] = useState<number | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);

	// スワイプの最小距離
	const minSwipeDistance = 50;

	// キーボードナビゲーション
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (!isOpen) return;

			switch (e.key) {
				case "Escape":
					close();
					break;
				case "ArrowLeft":
					prev();
					break;
				case "ArrowRight":
					next();
					break;
			}
		},
		[isOpen, close, prev, next]
	);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	// スクロール禁止
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	// タッチイベントハンドラ
	const onTouchStart = (e: React.TouchEvent) => {
		setTouchEnd(null);
		setTouchStart(e.targetTouches[0].clientX);
	};

	const onTouchMove = (e: React.TouchEvent) => {
		setTouchEnd(e.targetTouches[0].clientX);
	};

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return;

		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;

		if (isLeftSwipe) {
			next();
		} else if (isRightSwipe) {
			prev();
		}
	};

	// オーバーレイクリックで閉じる
	const handleOverlayClick = (e: React.MouseEvent) => {
		if (e.target === containerRef.current) {
			close();
		}
	};

	if (!isOpen) return null;

	const currentImage = images[currentIndex];
	const hasPrev = currentIndex > 0;
	const hasNext = currentIndex < images.length - 1;

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					ref={containerRef}
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					onClick={handleOverlayClick}
					onTouchStart={onTouchStart}
					onTouchMove={onTouchMove}
					onTouchEnd={onTouchEnd}
				>
					{/* 閉じるボタン */}
					<button
						type="button"
						onClick={close}
						className="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
						aria-label="閉じる"
					>
						<FiX size={28} />
					</button>

					{/* カウンター */}
					<div className="absolute top-4 left-4 z-10 text-white/80 text-sm font-medium">
						{currentIndex + 1} / {images.length}
					</div>

					{/* 前へボタン */}
					{hasPrev && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								prev();
							}}
							className="absolute left-2 md:left-4 z-10 p-2 md:p-3 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
							aria-label="前の写真"
						>
							<FiChevronLeft size={32} />
						</button>
					)}

					{/* 次へボタン */}
					{hasNext && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								next();
							}}
							className="absolute right-2 md:right-4 z-10 p-2 md:p-3 text-white/80 hover:text-white transition-colors rounded-full hover:bg-white/10"
							aria-label="次の写真"
						>
							<FiChevronRight size={32} />
						</button>
					)}

					{/* 画像 */}
					<motion.img
						key={currentImage}
						src={currentImage}
						alt={`Photo ${currentIndex + 1}`}
						className="max-w-[90vw] max-h-[85vh] object-contain select-none"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						transition={{ duration: 0.2 }}
						draggable={false}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
